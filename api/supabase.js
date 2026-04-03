import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sanitizeErrorMessage } from './utils.js';
import { verifyToken } from '@clerk/backend';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

const ALLOWED_ORIGINS = [
  'https://popthehood.app',
  'https://www.popthehood.app',
  'https://popthehood.vercel.app'
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Derive the Clerk JWKS URL from the publishable key so we don't need
// CLERK_SECRET_KEY as an additional environment variable.
function getClerkJwksUrl() {
  const key = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';
  // Format: pk_test_<base64> or pk_live_<base64>
  const match = key.match(/^pk_(?:test|live)_(.+)$/);
  if (!match) return null;
  const domain = Buffer.from(match[1], 'base64').toString('utf-8').replace(/\$$/, '');
  return `https://${domain}/.well-known/jwks.json`;
}

async function verifyClerkToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('unauthorized');
  }
  const token = authHeader.slice(7);
  const jwksUrl = getClerkJwksUrl();
  if (!jwksUrl) throw new Error('unauthorized');

  const payload = await verifyToken(token, {
    jwksUrl,
    authorizedParties: ALLOWED_ORIGINS,
  });
  return payload.sub; // Clerk user ID
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use the last IP in x-forwarded-for to prevent spoofing
  const xff = req.headers['x-forwarded-for'];
  const ip = (xff ? xff.split(',').pop().trim() : null)
           || req.headers['x-real-ip']
           || req.socket.remoteAddress
           || 'anonymous';

  if (ratelimit) {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
  }

  // Verify Clerk session — extract userId from the signed token, never trust the body
  let verifiedUserId;
  try {
    verifiedUserId = await verifyClerkToken(req.headers.authorization);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, data } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (action === 'saveDiagnostic') {
      const { error } = await supabase
        .from('diagnostics')
        .insert({
          user_id: verifiedUserId,
          vehicle_make: data.vehicle?.make,
          vehicle_model: data.vehicle?.model,
          vehicle_year: data.vehicle?.year,
          vehicle_mileage: data.vehicle?.mileage,
          description: data.analysisSummary,
          report: data
        });
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'saveTireScan') {
      const { error } = await supabase
        .from('tire_scans')
        .insert({
          user_id: verifiedUserId,
          report: data
        });
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'getDiagnostics') {
      const { data: rows, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('user_id', verifiedUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ data: rows });
    }

    if (action === 'getTireScans') {
      const { data: rows, error } = await supabase
        .from('tire_scans')
        .select('*')
        .eq('user_id', verifiedUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ data: rows });
    }

    if (action === 'deleteDiagnostic') {
      const { error } = await supabase
        .from('diagnostics')
        .delete()
        .eq('id', data.id)
        .eq('user_id', verifiedUserId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'deleteTireScan') {
      const { error } = await supabase
        .from('tire_scans')
        .delete()
        .eq('id', data.id)
        .eq('user_id', verifiedUserId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: sanitizeErrorMessage(error.message) });
  }
}
