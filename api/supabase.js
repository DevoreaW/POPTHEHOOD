import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
});

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

  const { action, userId, data } = req.body;

  if (!action || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (action === 'saveDiagnostic') {
      const { error } = await supabase
        .from('diagnostics')
        .insert({
          user_id: userId,
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
          user_id: userId,
          report: data
        });
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'getDiagnostics') {
      const { data: rows, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ data: rows });
    }

    if (action === 'getTireScans') {
      const { data: rows, error } = await supabase
        .from('tire_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ data: rows });
    }

    if (action === 'deleteDiagnostic') {
      const { error } = await supabase
        .from('diagnostics')
        .delete()
        .eq('id', data.id)
        .eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'deleteTireScan') {
      const { error } = await supabase
        .from('tire_scans')
        .delete()
        .eq('id', data.id)
        .eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }
}