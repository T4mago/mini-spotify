import { SpotifyTrack } from '../types.js';

interface SpotifyAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class SpotifyService {
  private auth: SpotifyAuth | null = null;
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  getRedirectUri(): string {
    return 'mini-spotify://callback';
  }

  getAuthUrl(): string {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-private',
    ];
    console.log(`[SpotifyService] getAuthUrl: Requesting scopes: ${scopes.join(', ')}`);
    return `https://accounts.spotify.com/authorize?` +
      `client_id=${this.clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(this.getRedirectUri())}` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&show_dialog=true`;
  }

  async handleCallback(code: string): Promise<boolean> {
    console.log('[SpotifyService] handleCallback: Exchanging code for token');
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.getRedirectUri(),
        }).toString(),
      });

      console.log(`[SpotifyService] handleCallback: Response status: ${response.status}`);
      const data = await response.json() as any;
      console.log(`[SpotifyService] handleCallback: Granted scopes: ${data.scope}`);
      console.log(`[SpotifyService] handleCallback: Token type: ${data.token_type}`);

      if (data.access_token) {
        this.auth = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + data.expires_in * 1000,
        };
        console.log('[SpotifyService] handleCallback: Token stored successfully');
        console.log(`[SpotifyService] handleCallback: Token expires at: ${new Date(this.auth.expiresAt).toISOString()}`);
        return true;
      } else {
        console.error('[SpotifyService] handleCallback: No access_token in response:', data);
        return false;
      }
    } catch (error) {
      console.error('[SpotifyService] handleCallback: Error:', error);
      return false;
    }
  }

  async ensureToken(): Promise<string | null> {
    if (!this.auth) {
      console.log('[SpotifyService] ensureToken: No auth state');
      return null;
    }

    console.log(`[SpotifyService] ensureToken: Token expires at ${new Date(this.auth.expiresAt).toISOString()}, now: ${new Date().toISOString()}`);

    if (Date.now() >= this.auth.expiresAt - 60000) {
      console.log('[SpotifyService] ensureToken: Token expired or about to expire, refreshing...');
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: this.auth.refreshToken,
          }).toString(),
        });

        const data = await response.json() as any;
        console.log(`[SpotifyService] ensureToken: Refresh response status: ${response.status}`);

        if (data.access_token) {
          this.auth.accessToken = data.access_token;
          this.auth.expiresAt = Date.now() + data.expires_in * 1000;
          if (data.refresh_token) {
            this.auth.refreshToken = data.refresh_token;
          }
          console.log('[SpotifyService] ensureToken: Token refreshed successfully');
        } else {
          console.error('[SpotifyService] ensureToken: Refresh failed:', data);
        }
      } catch (error) {
        console.error('[SpotifyService] ensureToken: Token refresh error:', error);
        return null;
      }
    }

    console.log(`[SpotifyService] ensureToken: Returning token (first 20 chars): ${this.auth.accessToken.substring(0, 20)}...`);
    return this.auth.accessToken;
  }

  isConnected(): boolean {
    return this.auth !== null;
  }

  disconnect(): void {
    this.auth = null;
  }

  parsePlaylistId(url: string): string | null {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get a Client Credentials token (no user scope needed).
   * This can access public playlists and tracks without Development Mode restrictions.
   */
  private clientToken: { token: string; expiresAt: number } | null = null;

  async getClientToken(): Promise<string> {
    // Return cached token if still valid
    if (this.clientToken && Date.now() < this.clientToken.expiresAt - 60000) {
      return this.clientToken.token;
    }

    console.log('[SpotifyService] getClientToken: Requesting Client Credentials token...');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json() as any;
    console.log(`[SpotifyService] getClientToken: Response status: ${response.status}`);

    if (!data.access_token) {
      console.error('[SpotifyService] getClientToken: Failed:', data);
      throw new Error('Failed to get Client Credentials token');
    }

    this.clientToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    console.log('[SpotifyService] getClientToken: Token obtained successfully');
    return this.clientToken.token;
  }

  async getUserMarket(): Promise<string> {
    const token = await this.ensureToken();
    if (!token) return 'US';
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`[SpotifyService] getUserMarket: /v1/me status: ${response.status}`);
      if (response.ok) {
        const data = await response.json() as any;
        console.log(`[SpotifyService] getUserMarket: country=${data.country}, product=${data.product}`);
        return data.country || 'US';
      } else {
        const errorBody = await response.text();
        console.error(`[SpotifyService] getUserMarket: Failed (${response.status}): ${errorBody}`);
      }
    } catch (error) {
      console.error('[SpotifyService] getUserMarket: Error:', error);
    }
    return 'US';
  }

  async getPlaylist(playlistId: string): Promise<any> {
    console.log(`[SpotifyService] getPlaylist: Fetching playlist ${playlistId}`);

    // Try Client Credentials first (more reliable for public playlists in Dev Mode)
    try {
      const clientToken = await this.getClientToken();
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      console.log(`[SpotifyService] getPlaylist: Client token response: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[SpotifyService] getPlaylist: Response keys: ${Object.keys(data).join(', ')}`);
        console.log(`[SpotifyService] getPlaylist: tracks field: items=${data.tracks?.items?.length ?? 'undefined'}, total=${data.tracks?.total ?? 'undefined'}, next=${!!data.tracks?.next}`);
        return data;
      }
    } catch (err: any) {
      console.warn(`[SpotifyService] getPlaylist: Client Credentials failed: ${err.message}`);
    }

    // Fallback to user token
    const userToken = await this.ensureToken();
    if (!userToken) throw new Error('Not authenticated');
    
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log(`[SpotifyService] getPlaylist: User token response: ${response.status}`);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[SpotifyService] getPlaylist: Error: ${errorBody}`);
      if (response.status === 404) throw new Error('Playlist not found');
      throw new Error(`Failed to fetch playlist (${response.status})`);
    }

    const data = await response.json();
    console.log(`[SpotifyService] getPlaylist: Response keys: ${Object.keys(data).join(', ')}`);
    console.log(`[SpotifyService] getPlaylist: tracks field: items=${data.tracks?.items?.length ?? 'undefined'}, total=${data.tracks?.total ?? 'undefined'}, next=${!!data.tracks?.next}`);
    return data;
  }

  async getPlaylistTracks(playlistId: string): Promise<any[]> {
    console.log(`[SpotifyService] getPlaylistTracks: Fetching tracks for playlist ${playlistId}`);

    // Strategy 1: Try API with explicit fields parameter
    console.log('[SpotifyService] getPlaylistTracks: Strategy 1 - API with fields parameter');
    try {
      const tracks = await this._fetchTracksViaFields(playlistId);
      if (tracks.length > 0) {
        console.log(`[SpotifyService] getPlaylistTracks: Strategy 1 succeeded: ${tracks.length} tracks`);
        return tracks;
      }
    } catch (err: any) {
      console.warn(`[SpotifyService] getPlaylistTracks: Strategy 1 failed: ${err.message}`);
    }

    // Strategy 2: Try /tracks endpoint with various tokens
    console.log('[SpotifyService] getPlaylistTracks: Strategy 2 - /tracks endpoint');
    try {
      const tracks = await this._fetchTracksViaEndpoint(playlistId);
      if (tracks.length > 0) {
        console.log(`[SpotifyService] getPlaylistTracks: Strategy 2 succeeded: ${tracks.length} tracks`);
        return tracks;
      }
    } catch (err: any) {
      console.warn(`[SpotifyService] getPlaylistTracks: Strategy 2 failed: ${err.message}`);
    }

    // Strategy 3: Scrape Spotify embed page (no auth needed)
    console.log('[SpotifyService] getPlaylistTracks: Strategy 3 - Embed page scrape');
    try {
      const tracks = await this._fetchTracksViaEmbed(playlistId);
      if (tracks.length > 0) {
        console.log(`[SpotifyService] getPlaylistTracks: Strategy 3 succeeded: ${tracks.length} tracks`);
        return tracks;
      }
    } catch (err: any) {
      console.warn(`[SpotifyService] getPlaylistTracks: Strategy 3 failed: ${err.message}`);
    }

    console.error('[SpotifyService] getPlaylistTracks: All strategies failed');
    throw new Error('Could not fetch tracks. Spotify API is restricted for Development Mode apps. Consider applying for Extended Quota Mode at developer.spotify.com.');
  }

  private async _fetchTracksViaFields(playlistId: string): Promise<any[]> {
    const fields = 'tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls)),tracks.total,tracks.next';
    
    // Try client credentials
    const clientToken = await this.getClientToken();
    let response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=${encodeURIComponent(fields)}`,
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    console.log(`[SpotifyService] _fetchTracksViaFields: Client token status: ${response.status}`);

    // Fallback to user token
    if (!response.ok) {
      const userToken = await this.ensureToken();
      if (userToken) {
        response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}?fields=${encodeURIComponent(fields)}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        console.log(`[SpotifyService] _fetchTracksViaFields: User token status: ${response.status}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Fields API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[SpotifyService] _fetchTracksViaFields: Response keys: ${Object.keys(data).join(', ')}`);
    console.log(`[SpotifyService] _fetchTracksViaFields: tracks items=${data.tracks?.items?.length ?? 'N/A'}, total=${data.tracks?.total ?? 'N/A'}`);

    if (!data.tracks?.items?.length) return [];
    return data.tracks.items.map((item: any) => item?.track).filter(Boolean);
  }

  private async _fetchTracksViaEndpoint(playlistId: string): Promise<any[]> {
    // Try with client token first, then user token
    const tokens: string[] = [];
    try { tokens.push(await this.getClientToken()); } catch {}
    const userToken = await this.ensureToken();
    if (userToken) tokens.push(userToken);

    for (const token of tokens) {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`[SpotifyService] _fetchTracksViaEndpoint: Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json() as any;
        const tracks = (data.items || []).map((item: any) => item?.track).filter(Boolean);
        if (tracks.length > 0) return tracks;
      }
    }

    throw new Error('Tracks endpoint failed with all tokens');
  }

  private async _fetchTracksViaEmbed(playlistId: string): Promise<any[]> {
    console.log(`[SpotifyService] _fetchTracksViaEmbed: Fetching embed page for ${playlistId}`);
    
    // Fetch the Spotify embed page - this is publicly accessible
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    console.log(`[SpotifyService] _fetchTracksViaEmbed: Embed page status: ${response.status}`);
    if (!response.ok) throw new Error(`Embed page failed: ${response.status}`);

    const html = await response.text();
    console.log(`[SpotifyService] _fetchTracksViaEmbed: HTML length: ${html.length}`);

    // Strategy A: Look for __NEXT_DATA__ JSON blob
    const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      console.log('[SpotifyService] _fetchTracksViaEmbed: Found __NEXT_DATA__');
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const tracks = this._extractTracksFromNextData(nextData);
        if (tracks.length > 0) return tracks;
      } catch (err: any) {
        console.warn(`[SpotifyService] _fetchTracksViaEmbed: __NEXT_DATA__ parse error: ${err.message}`);
      }
    }

    // Strategy B: Look for resource JSON in script tags
    const resourceMatch = html.match(/<script[^>]*>\s*window\.__spotify__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
    if (resourceMatch) {
      console.log('[SpotifyService] _fetchTracksViaEmbed: Found __spotify__ data');
      try {
        const spotifyData = JSON.parse(resourceMatch[1]);
        const tracks = this._extractTracksFromSpotifyData(spotifyData);
        if (tracks.length > 0) return tracks;
      } catch (err: any) {
        console.warn(`[SpotifyService] _fetchTracksViaEmbed: __spotify__ parse error: ${err.message}`);
      }
    }

    // Strategy C: Extract from any JSON-like structure containing track data
    const jsonMatches = html.matchAll(/"tracks?":\s*\{[^}]*"items":\s*\[/g);
    for (const m of jsonMatches) {
      console.log(`[SpotifyService] _fetchTracksViaEmbed: Found tracks JSON at position ${m.index}`);
    }

    // Strategy D: Look for structured data (ld+json)
    const ldJsonMatch = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (ldJsonMatch) {
      console.log('[SpotifyService] _fetchTracksViaEmbed: Found ld+json');
      try {
        const ldData = JSON.parse(ldJsonMatch[1]);
        console.log(`[SpotifyService] _fetchTracksViaEmbed: ld+json keys: ${Object.keys(ldData).join(', ')}`);
        if (ldData.track) {
          const tracks = (Array.isArray(ldData.track) ? ldData.track : [ldData.track]).map((t: any) => ({
            id: t.url?.split('/').pop() || '',
            name: t.name || '',
            artists: [{ name: t.byArtist?.name || 'Unknown' }],
            album: { name: t.inAlbum?.name || '', images: [] },
            duration_ms: t.duration ? this._parseDuration(t.duration) : 0,
            external_urls: { spotify: t.url || '' },
          }));
          if (tracks.length > 0) return tracks;
        }
      } catch (err: any) {
        console.warn(`[SpotifyService] _fetchTracksViaEmbed: ld+json parse error: ${err.message}`);
      }
    }

    // Log some of the HTML for debugging
    console.log(`[SpotifyService] _fetchTracksViaEmbed: First 500 chars of HTML: ${html.substring(0, 500)}`);
    
    // Look for any script tags and log their IDs for debugging
    const scriptIds = [...html.matchAll(/<script[^>]*id="([^"]*)"[^>]*>/g)].map(m => m[1]);
    console.log(`[SpotifyService] _fetchTracksViaEmbed: Script IDs found: ${scriptIds.join(', ') || 'none'}`);

    throw new Error('Could not extract tracks from embed page');
  }

  private _extractTracksFromNextData(data: any): any[] {
    try {
      // Fast path: direct extraction if structure matches expected Next.js embed format
      const trackList = data?.props?.pageProps?.state?.data?.entity?.trackList;
      if (Array.isArray(trackList)) {
        console.log(`[SpotifyService] _extractTracksFromNextData: Found trackList with ${trackList.length} items`);
        const tracks = trackList.map((t: any) => ({
          id: t.uri?.split(':').pop() || '',
          name: t.title || '',
          artists: [{ name: t.subtitle || 'Unknown' }],
          album: { name: '', images: [] }, // Embed page trackList typically doesn't have album art per track
          duration_ms: t.duration || 0,
          external_urls: { spotify: t.uri ? `https://open.spotify.com/track/${t.uri.split(':').pop()}` : '' }
        })).filter((t: any) => t.id && t.name);
        
        if (tracks.length > 0) return tracks;
      }
    } catch (err: any) {
      console.warn(`[SpotifyService] _extractTracksFromNextData: Fast path failed: ${err.message}`);
    }

    // Fallback: search recursively
    try {
      return this._findTracksInObject(data);
    } catch {
      return [];
    }
  }

  private _extractTracksFromSpotifyData(data: any): any[] {
    try {
      return this._findTracksInObject(data);
    } catch {
      return [];
    }
  }

  private _findTracksInObject(obj: any, depth = 0): any[] {
    if (depth > 15 || !obj || typeof obj !== 'object') return [];

    // Check if this object is an array of items
    if (Array.isArray(obj)) {
      // Check if it's an array of embed-style tracks
      if (obj.length > 0 && obj[0].title && obj[0].subtitle && obj[0].uri) {
        return obj.map((t: any) => ({
          id: t.uri?.split(':').pop() || '',
          name: t.title || '',
          artists: [{ name: t.subtitle || 'Unknown' }],
          album: { name: '', images: [] },
          duration_ms: t.duration || 0,
          external_urls: { spotify: t.uri ? `https://open.spotify.com/track/${t.uri.split(':').pop()}` : '' }
        })).filter(t => t.id && t.name);
      }
      
      // Check if it's an array of standard API tracks
      const apiTracks = obj.map((item: any) => item?.track || item).filter((t: any) => t?.name && (t?.artists || t?.artist));
      if (apiTracks.length > 0) return apiTracks;

      // Otherwise recurse into array elements
      for (const item of obj) {
        const result = this._findTracksInObject(item, depth + 1);
        if (result.length > 0) return result;
      }
      return [];
    }

    // Check if this is an object containing an items array
    if (Array.isArray(obj.items)) {
      const tracks = obj.items
        .map((item: any) => item?.track || item)
        .filter((t: any) => t?.name && (t?.artists || t?.artist));
      if (tracks.length > 0) return tracks;
    }
    
    // Check if this is an object containing a trackList array
    if (Array.isArray(obj.trackList)) {
      const result = this._findTracksInObject(obj.trackList, depth + 1);
      if (result.length > 0) return result;
    }

    // Recurse into common property names that might contain tracks
    for (const key of Object.keys(obj)) {
      if (['tracks', 'items', 'data', 'entity', 'state', 'trackList', 'props', 'pageProps'].includes(key)) {
        const result = this._findTracksInObject(obj[key], depth + 1);
        if (result.length > 0) return result;
      }
    }

    return [];
  }

  private _parseDuration(iso8601: string): number {
    // Parse ISO 8601 duration like "PT3M25S"
    const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
}

export function parsePlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export async function fetchSpotifyPlaylistViaEmbed(playlistId: string):
  Promise<{ playlist: { id: string; name: string; description: string; images: { url: string }[] }; tracks: SpotifyTrack[] }> {
  console.log(`[EmbedScraper] Fetching embed page for ${playlistId}`);

  const response = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html',
    },
  });

  if (!response.ok) throw new Error(`Embed page failed: ${response.status}`);
  const html = await response.text();

  const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    const nextData = JSON.parse(nextDataMatch[1]);
    const entity = nextData?.props?.pageProps?.state?.data?.entity;
    const trackList = entity?.trackList;
    if (Array.isArray(trackList) && trackList.length > 0) {
      const tracks: SpotifyTrack[] = trackList
        .map((t: any) => ({
          id: t.uri?.split(':').pop() || '',
          name: t.title || '',
          artists: [{ name: t.subtitle || 'Unknown' }],
          album: { name: '', images: [] },
          duration_ms: t.duration || 0,
          external_urls: { spotify: `https://open.spotify.com/track/${t.uri?.split(':').pop() || ''}` },
        }))
        .filter((t: SpotifyTrack) => t.id && t.name);

      const coverUrl = entity.coverArt?.sources?.[0]?.url;
      return {
        playlist: {
          id: playlistId,
          name: entity.title || 'Imported Playlist',
          description: '',
          images: coverUrl ? [{ url: coverUrl }] : [],
        },
        tracks,
      };
    }
  }

  const ldJsonMatch = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (ldJsonMatch) {
    const ldData = JSON.parse(ldJsonMatch[1]);
    if (ldData.track) {
      const tracks: SpotifyTrack[] = (Array.isArray(ldData.track) ? ldData.track : [ldData.track])
        .map((t: any) => ({
          id: t.url?.split('/').pop() || '',
          name: t.name || '',
          artists: [{ name: t.byArtist?.name || 'Unknown' }],
          album: { name: t.inAlbum?.name || '', images: [] },
          duration_ms: _parseDuration(t.duration || ''),
          external_urls: { spotify: t.url || '' },
        }));

      return {
        playlist: {
          id: playlistId,
          name: ldData.name || 'Imported Playlist',
          description: '',
          images: [],
        },
        tracks,
      };
    }
  }

  throw new Error('Could not extract tracks from embed page');
}

function _parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

