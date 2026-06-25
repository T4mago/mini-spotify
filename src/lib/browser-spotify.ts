import { browserStore } from './browser-store';

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-private',
];

// ponytail: store PKCE verifier in sessionStorage (not IndexedDB — short-lived)
function generateCodeVerifier(): string {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 128);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface SpotifyAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

async function getAuth(): Promise<SpotifyAuth | null> {
  return browserStore.get<SpotifyAuth | null>('spotify-auth', 'auth', null);
}

async function saveAuth(auth: SpotifyAuth): Promise<void> {
  await browserStore.set('spotify-auth', 'auth', auth);
}

async function clearAuth(): Promise<void> {
  await browserStore.set('spotify-auth', 'auth', null);
}

export async function getSpotifyClientId(): Promise<string> {
  const settings = await browserStore.getSettings();
  return settings.spotifyClientId || '';
}

export async function isConnected(): Promise<boolean> {
  const auth = await getAuth();
  return auth !== null;
}

export async function login(clientId: string): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem('pkce_verifier', verifier);

  const redirectUri = getRedirectUri();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'true',
  });

  window.open(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
    'spotify-auth',
    'width=600,height=700'
  );
}

export async function handleCallback(code: string): Promise<boolean> {
  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) {
    console.error('[PWA Spotify] No PKCE verifier found');
    return false;
  }

  const clientId = await getSpotifyClientId();
  const redirectUri = getRedirectUri();

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: verifier,
      }).toString(),
    });

    const data = await response.json();
    if (data.access_token) {
      await saveAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      });
      sessionStorage.removeItem('pkce_verifier');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[PWA Spotify] Token exchange failed:', err);
    return false;
  }
}

export async function ensureToken(): Promise<string | null> {
  const auth = await getAuth();
  if (!auth) return null;

  if (Date.now() < auth.expiresAt - 60000) {
    return auth.accessToken;
  }

  // Refresh
  const clientId = await getSpotifyClientId();
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: auth.refreshToken,
        client_id: clientId,
      }).toString(),
    });

    const data = await response.json();
    if (data.access_token) {
      const updated: SpotifyAuth = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || auth.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
      await saveAuth(updated);
      return updated.accessToken;
    }
  } catch (err) {
    console.error('[PWA Spotify] Token refresh failed:', err);
  }
  return null;
}

export async function disconnect(): Promise<void> {
  await clearAuth();
}

export function getRedirectUri(): string {
  return window.location.origin + '/';
}

export function parsePlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// Spotify API helpers

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Spotify API ${res.status}`);
  return res.json();
}

export async function getPlaylist(playlistId: string) {
  return apiFetch(`/playlists/${playlistId}`);
}

export async function getPlaylistTracks(playlistId: string): Promise<any[]> {
  const fields = 'tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls)),tracks.total,tracks.next';
  const data = await apiFetch(`/playlists/${playlistId}?fields=${encodeURIComponent(fields)}`);
  return data?.tracks?.items?.map((item: any) => item?.track).filter(Boolean) || [];
}

export async function getState() {
  try {
    return await apiFetch('/me/player');
  } catch {
    return null;
  }
}

export async function playTracks(trackUris: string[], deviceId?: string) {
  let url = '/me/player/play';
  if (deviceId) url += `?device_id=${deviceId}`;
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`https://api.spotify.com/v1${url}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: trackUris }),
  });
  return res.ok || res.status === 204;
}

export async function pause() {
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok || res.status === 204;
}

export async function nextTrack() {
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('https://api.spotify.com/v1/me/player/next', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok || res.status === 204;
}

export async function previousTrack() {
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('https://api.spotify.com/v1/me/player/previous', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok || res.status === 204;
}

export async function seek(positionMs: number) {
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok || res.status === 204;
}

export async function setVolume(volume: number) {
  const token = await ensureToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok || res.status === 204;
}
