const fs = require('fs');

async function testScrape() {
  const playlistId = '3T2g0ppL6DJYNvzC8B8xE3';
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  
  console.log('Fetching', embedUrl);
  const response = await fetch(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  
  const html = await response.text();
  console.log('HTML length:', html.length);
  
  fs.writeFileSync('embed.html', html);
  
  const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    const nextData = JSON.parse(nextDataMatch[1]);
    fs.writeFileSync('next_data.json', JSON.stringify(nextData, null, 2));
    console.log('Saved next_data.json');
  }
}

testScrape().catch(console.error);
