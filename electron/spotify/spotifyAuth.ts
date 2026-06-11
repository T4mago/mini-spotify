import { shell } from 'electron';

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

  async login(): Promise<void> {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${this.clientId}` +
      `&response_type=code` +
      `&redirect_uri=mini-spotify://callback` +
      `&scope=playlist-read-private playlist-read-collaborative`;

    shell.openExternal(authUrl);
  }

  async handleCallback(code: string): Promise<boolean> {
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
          redirect_uri: 'mini-spotify://callback',
        }).toString(),
      });

      const data = await response.json() as any;

      if (data.access_token) {
        this.auth = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + data.expires_in * 1000,
        };
        return true;
      }

      return false;
    } catch (error) {
      console.error('Spotify auth error:', error);
      return false;
    }
  }

  async ensureToken(): Promise<string | null> {
    if (!this.auth) return null;

    if (Date.now() >= this.auth.expiresAt - 60000) {
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

        if (data.access_token) {
          this.auth.accessToken = data.access_token;
          this.auth.expiresAt = Date.now() + data.expires_in * 1000;
          if (data.refresh_token) {
            this.auth.refreshToken = data.refresh_token;
          }
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
      }
    }

    return this.auth.accessToken;
  }

  isConnected(): boolean {
    return this.auth !== null;
  }

  parsePlaylistId(url: string): string | null {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  async getPlaylist(playlistId: string): Promise<any> {
    const token = await this.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error('Playlist not found');
      if (response.status === 403) throw new Error('This playlist is private');
      throw new Error('Failed to fetch playlist');
    }

    return response.json();
  }

  async getPlaylistTracks(playlistId: string): Promise<any[]> {
    const token = await this.ensureToken();
    if (!token) throw new Error('Not authenticated');

    let tracks: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json() as any;
      tracks.push(...data.items.map((item: any) => item.track));

      if (data.next) offset += limit;
      else break;
    }

    return tracks;
  }
}
