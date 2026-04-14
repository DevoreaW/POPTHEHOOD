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
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
}

// Fetch all pages of trims/v2 for a given make + optional year
async function fetchAllTrims(token, make, year) {
  const results = [];
  let page = 1;
  while (true) {
    const url = new URL('https://carapi.app/api/trims/v2');
    url.searchParams.set('make', make);
    if (year) url.searchParams.set('year', year);
    url.searchParams.set('limit', '200');
    url.searchParams.set('page', String(page));
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) break;
    const data = await r.json();
    if (!data.data?.length) break;
    results.push(...data.data);
    if (page >= data.collection.pages) break;
    page++;
  }
  return results;
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { type, make, model, year } = req.query;

  if (!type || !['models', 'trims'].includes(type)) {
    return res.status(400).json({ error: 'type must be "models" or "trims"' });
  }
  if (!make) return res.status(400).json({ error: 'make required' });
  if (type === 'trims' && !model) return res.status(400).json({ error: 'model required for trims' });

  try {
    const token = await getToken();
    const allTrims = await fetchAllTrims(token, make, year);

    if (type === 'models') {
      // Use series if present, otherwise fall back to model name
      const names = [...new Set(
        allTrims.map(t => t.series || t.model).filter(Boolean)
      )].sort();
      return res.status(200).json({ models: names });
    }

    if (type === 'trims') {
      // Match trims where series === model (BMW-style) OR model === model (Honda-style)
      const matched = allTrims.filter(t =>
        (t.series && t.series === model) || (!t.series && t.model === model)
      );

      let names;
      if (matched.length && matched[0].series) {
        // Series-based (BMW): return model names, append submodel if not Base
        names = [...new Set(
          matched.map(t => {
            const sub = t.submodel && t.submodel !== 'Base' ? ` ${t.submodel}` : '';
            return `${t.model}${sub}`;
          })
        )].sort();
      } else {
        // Standard (Honda): return trim/submodel names
        names = [...new Set(
          matched.map(t => t.trim || t.submodel).filter(Boolean)
        )].sort();
      }

      return res.status(200).json({ trims: names });
    }
  } catch (err) {
    console.error('vehicles handler error:', err.message);
    return res.status(500).json({ error: 'Vehicle data unavailable' });
  }
}
