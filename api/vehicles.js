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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch('https://carapi.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_token: process.env.CARAPI_APP_ID,
      api_secret: process.env.CARAPI_APP_SECRET,
    }),
  });

  if (!res.ok) throw new Error('CarAPI auth failed');
  const token = await res.text();
  cachedToken = token.replace(/"/g, '').trim();
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours
  return cachedToken;
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { type, make, model, year } = req.query;

  if (!type || !['models', 'trims'].includes(type)) {
    return res.status(400).json({ error: 'type must be "models" or "trims"' });
  }
  if (type === 'models' && !make) return res.status(400).json({ error: 'make required' });
  if (type === 'trims' && (!make || !model)) return res.status(400).json({ error: 'make and model required' });

  try {
    const token = await getToken();

    if (type === 'models') {
      const url = new URL('https://carapi.app/api/models');
      url.searchParams.set('make', make);
      url.searchParams.set('limit', '100');

      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error(`CarAPI models failed: ${r.status}`);
      const data = await r.json();

      const names = [...new Set(
        (data.data || []).map(m => m.name).filter(Boolean)
      )].sort();
      return res.status(200).json({ models: names });
    }

    if (type === 'trims') {
      const url = new URL('https://carapi.app/api/trims');
      url.searchParams.set('make', make);
      url.searchParams.set('model', model);
      if (year) url.searchParams.set('year', year);
      url.searchParams.set('limit', '200');

      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error(`CarAPI trims failed: ${r.status}`);
      const data = await r.json();

      const names = [...new Set(
        (data.data || []).map(t => t.name).filter(Boolean)
      )].sort();
      return res.status(200).json({ trims: names });
    }
  } catch (err) {
    console.error('vehicles handler error:', err.message);
    return res.status(500).json({ error: 'Vehicle data unavailable' });
  }
}
