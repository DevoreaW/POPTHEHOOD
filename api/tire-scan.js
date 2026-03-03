export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData, mimeType, prompt } = req.body;

  if (!imageData || !prompt) {
    return res.status(400).json({ error: 'Image data and prompt are required' });
  }

  try {
    const apiKey = process.env.API_KEY || process.env.VITE_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageData } }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    console.log('Tire scan response:', JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      console.error('Empty response from Gemini:', data);
      return res.status(500).json({ error: 'Empty response from Gemini', details: data });
    }

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error('Tire scan API error:', error);
    return res.status(500).json({ error: error.message });
  }
}