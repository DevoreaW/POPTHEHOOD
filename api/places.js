import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sanitizeInput } from "./utils.js";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { latitude, longitude, type } = req.body;

  if (!latitude || !longitude || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanType = sanitizeInput(type);

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const includedTypes = cleanType === 'mechanic' 
      ? ['auto_repair'] 
      : ['towing_service'];

    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri'
        },
        body: JSON.stringify({
          includedTypes,
          maxResultCount: 5,
          locationRestriction: {
            circle: {
              center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
              radius: 16000
            }
          }
        })
      }
    );

    const data = await response.json();
    console.log('Places API response:', JSON.stringify(data));

    if (!data.places || data.places.length === 0) {
      return res.status(200).json({ places: [], debug: data });
    }

    const places = data.places.map((place) => ({
      title: place.displayName?.text || 'Unknown',
      uri: place.websiteUri || '',
      snippet: `${place.formattedAddress || ''} ${place.rating ? `⭐ ${place.rating} (${place.userRatingCount} reviews)` : ''} ${place.internationalPhoneNumber || ''}`
    }));

    return res.status(200).json({ places });

  } catch (error) {
    console.error('Places API error:', error);
    return res.status(500).json({ error: error.message });
  }
}