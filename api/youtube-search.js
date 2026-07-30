export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const q = url.searchParams.get('q');

  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const ytRes = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%3D%3D`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );

    if (!ytRes.ok) {
      return res.status(ytRes.status).json({ error: `YouTube search failed: ${ytRes.status}` });
    }

    const html = await ytRes.text();
    const match = html.match(/"videoId":"([^"]+)"/);
    const videoId = match?.[1] ?? null;

    if (videoId) {
      return res.status(200).json({ videoId });
    }

    return res.status(404).json({ error: 'No video ID found in search results' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
