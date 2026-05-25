// api/data.js — Vercel serverless function
// Fetches Google Sheet CSVs server-side so the sheet URLs are never exposed to the browser.
// Cached for 5 minutes (300s) via Cache-Control so every visitor doesn't hit Google.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const devUrl  = process.env.SHEET_DEVELOPERS;
  const projUrl = process.env.SHEET_PROJECTS;

  if (!devUrl || !projUrl) {
    return res.status(500).json({
      error: 'Sheet URLs not configured. Set SHEET_DEVELOPERS and SHEET_PROJECTS in Vercel environment variables.'
    });
  }

  try {
    const [devRes, projRes] = await Promise.all([
      fetch(devUrl,  { headers: { 'User-Agent': 'DeveloperIndex/1.0' }, signal: AbortSignal.timeout(8000) }),
      fetch(projUrl, { headers: { 'User-Agent': 'DeveloperIndex/1.0' }, signal: AbortSignal.timeout(8000) }),
    ]);

    if (!devRes.ok)  throw new Error(`Developers sheet returned ${devRes.status}`);
    if (!projRes.ok) throw new Error(`Projects sheet returned ${projRes.status}`);

    const [devCsv, projCsv] = await Promise.all([devRes.text(), projRes.text()]);

    // Cache for 5 minutes on CDN edge, 1 minute stale-while-revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ developers: devCsv, projects: projCsv });

  } catch (e) {
    console.error('Sheet fetch error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
