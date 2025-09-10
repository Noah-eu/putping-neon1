// netlify/functions/openai.js
export default async (req, res) => {
  try {
    // Lazy dotenv pro lokál (na Netlify to nastaví env sama platforma)
    try {
      const { existsSync } = await import('node:fs');
      if (existsSync('.env.server')) {
        const dotenv = await import('dotenv');
        dotenv.config({ path: '.env.server' });
      }
    } catch {}

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'OPENAI_API_KEY missing on server' }));
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      res.end('Method Not Allowed');
      return;
    }

    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(data || '{}'));
      req.on('error', reject);
    });

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body
    });

    const text = await resp.text();
    res.statusCode = resp.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(text);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err) }));
  }
}

