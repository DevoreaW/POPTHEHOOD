import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sanitizeInput } from "./utils.js";

const ALLOWED_ORIGINS = [
  'https://popthehood.app',
  'https://www.popthehood.app',
  'https://popthehood.vercel.app'
];

let ratelimit = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "1 h"),
    analytics: true,
  });
} catch {
  console.warn('Upstash env vars missing — rate limiting disabled');
}

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

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const xff = req.headers['x-forwarded-for'];
  const ip = (xff ? xff.split(',').pop().trim() : null)
           || req.headers['x-real-ip']
           || req.socket.remoteAddress
           || 'anonymous';

  if (ratelimit) {
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.', limit, reset, remaining });
    }
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const cleanPrompt = sanitizeInput(prompt);

  if (!cleanPrompt) {
    return res.status(400).json({ error: 'Invalid input provided' });
  }

  try {
    const apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: cleanPrompt }] }]
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response status:', response.status);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      console.error('Empty response from Gemini:', data);
      return res.status(500).json({ error: 'Empty response from Gemini', details: data });
    }
    
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error('Gemini API error:', error);
    const { sanitizeErrorMessage } = await import('./utils.js');
    return res.status(500).json({ error: sanitizeErrorMessage(error.message) });
  }
}