import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sanitizeInput } from "./utils.js";

const ALLOWED_ORIGINS = [
  'https://popthehood.app',
  'https://www.popthehood.app',
  'https://popthehood.vercel.app'
];

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
});

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
  const textQuery = cleanType === 'mechanic' ? 'auto repair shop near me' : 'towing service near me';

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri'
        },
        body: JSON.stringify({
          textQuery,
          maxResultCount: 5,
          locationBias: {
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
      return res.status(200).json({ places: [] });
    }

    const places = data.places.map((place) => ({
      title: place.displayName?.text || 'Unknown',
      uri: place.websiteUri || '',
      snippet: `${place.formattedAddress || ''} ${place.rating ? `⭐ ${place.rating} (${place.userRatingCount} reviews)` : ''} ${place.internationalPhoneNumber || ''}`
    }));

    return res.status(200).json({ places });

  } catch (error) {
    console.error('Gemini API error:', error);
    const { sanitizeErrorMessage } = await import('./utils.js');
    return res.status(500).json({ error: sanitizeErrorMessage(error.message) });
  }
}