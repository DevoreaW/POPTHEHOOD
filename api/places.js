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
  const searchQuery = cleanType === 'mechanic' ? 'auto repair shop' : 'towing service';

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.regularOpeningHours,places.websiteUri'
        },
        body: JSON.stringify({
          includedTypes: [cleanType === 'mechanic' ? 'auto_repair' : 'car_repair'],
          maxResultCount: 5,
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius: 8000
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return res.status(200).json({ places: [] });
    }

    return res.status(200).json({ places: data.places });

  } catch (error) {
    console.error('Places API error:', error);
    return res.status(500).json({ error: error.message });
  }
}