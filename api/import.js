export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get('id');

  if (!id) {
    return res.status(400).json({ error: 'Playlist ID is required' });
  }

  try {
    const response = await fetch(`https://open.spotify.com/embed/playlist/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Embed page failed: ${response.status}` });
    }

    const html = await response.text();
    const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      const nextData = JSON.parse(nextDataMatch[1]);
      const entity = nextData?.props?.pageProps?.state?.data?.entity;
      const trackList = entity?.trackList;
      if (Array.isArray(trackList) && trackList.length > 0) {
        const tracks = trackList
          .map((t) => ({
            id: t.uri?.split(':').pop() || '',
            name: t.title || '',
            artists: [{ name: t.subtitle || 'Unknown' }],
            album: { name: '', images: [] },
            duration_ms: t.duration || 0,
            external_urls: { spotify: `https://open.spotify.com/track/${t.uri?.split(':').pop() || ''}` },
          }))
          .filter((t) => t.id && t.name);

        const coverUrl = entity.coverArt?.sources?.[0]?.url;
        return res.status(200).json({
          playlist: {
            id,
            name: entity.title || 'Imported Playlist',
            description: '',
            images: coverUrl ? [{ url: coverUrl }] : [],
          },
          tracks,
        });
      }
    }

    const ldJsonMatch = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (ldJsonMatch) {
      const ldData = JSON.parse(ldJsonMatch[1]);
      if (ldData.track) {
        const tracks = (Array.isArray(ldData.track) ? ldData.track : [ldData.track])
          .map((t) => ({
            id: t.url?.split('/').pop() || '',
            name: t.name || '',
            artists: [{ name: t.byArtist?.name || 'Unknown' }],
            album: { name: t.inAlbum?.name || '', images: [] },
            duration_ms: parseDuration(t.duration || ''),
            external_urls: { spotify: t.url || '' },
          }));

        return res.status(200).json({
          playlist: {
            id,
            name: ldData.name || 'Imported Playlist',
            description: '',
            images: [],
          },
          tracks,
        });
      }
    }

    return res.status(404).json({ error: 'Could not extract tracks from embed page' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

function parseDuration(iso8601) {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
