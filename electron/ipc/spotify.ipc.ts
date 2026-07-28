import { ipcMain, BrowserWindow, shell } from 'electron';
import yts from 'yt-search';
import { SpotifyService, fetchSpotifyPlaylistViaEmbed, parsePlaylistId } from '../spotify/spotifyAuth.js';
import { store } from '../store/index.js';
import { Song, SpotifyTrack, ImportMatch } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

let spotifyService: SpotifyService | null = null;

function getSpotifyService(): SpotifyService | null {
  const settings = store.getSettings();
  const clientId = settings.spotifyClientId || '';
  const clientSecret = settings.spotifyClientSecret || '';

  console.log(`[SpotifyIPC] getSpotifyService: clientId=${clientId ? 'SET' : 'EMPTY'}, clientSecret=${clientSecret ? 'SET' : 'EMPTY'}`);
  console.log(`[SpotifyIPC] getSpotifyService: Existing service: ${spotifyService ? 'YES' : 'NO'}`);

  if (!spotifyService && clientId && clientSecret) {
    console.log('[SpotifyIPC] getSpotifyService: Creating new SpotifyService');
    spotifyService = new SpotifyService(clientId, clientSecret);
  }

  return spotifyService;
}

function notifyRenderer(channel: string, ...args: unknown[]) {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

export function registerSpotifyIPC() {
  ipcMain.handle('spotify:isConnected', () => {
    const service = getSpotifyService();
    return service?.isConnected() ?? false;
  });

  ipcMain.handle('spotify:login', async () => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');

    const authWindow = new BrowserWindow({
      width: 600,
      height: 700,
      show: true,
      title: 'Spotify Login',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    authWindow.on('closed', () => {});

    authWindow.loadURL(service.getAuthUrl());
  });

  ipcMain.handle('spotify:setCredentials', (_, { clientId, clientSecret }: { clientId: string; clientSecret: string }) => {
    spotifyService = new SpotifyService(clientId, clientSecret);
    store.saveSettings({ spotifyClientId: clientId, spotifyClientSecret: clientSecret });
  });

  ipcMain.handle('spotify:disconnect', () => {
    if (spotifyService) {
      spotifyService.disconnect();
      spotifyService = null;
    }
    notifyRenderer('spotify:loginStatus', false);
  });

  ipcMain.handle('spotify:handleCallback', async (_, code: string) => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    return service.handleCallback(code);
  });

  ipcMain.handle('spotify:import', async (_, url: string) => {
    console.log(`[SpotifyIPC] spotify:import: URL: ${url}`);

    const playlistId = parsePlaylistId(url);
    console.log(`[SpotifyIPC] spotify:import: Parsed playlistId: ${playlistId}`);
    if (!playlistId) throw new Error('Invalid Spotify playlist URL');

    // Strategy 1: Scrape embed page (no auth needed)
    try {
      console.log('[SpotifyIPC] spotify:import: Trying embed scrape...');
      const result = await fetchSpotifyPlaylistViaEmbed(playlistId);
      console.log(`[SpotifyIPC] spotify:import: Embed scrape succeeded: ${result.playlist.name} (${result.tracks.length} tracks)`);
      return result;
    } catch (err) {
      console.warn('[SpotifyIPC] spotify:import: Embed scrape failed:', err);
    }

    // Strategy 2: Spotify API (requires credentials)
    const service = getSpotifyService();
    if (!service) {
      throw new Error('Could not fetch playlist. Try registering a free Spotify Developer app and setting your credentials in Settings.');
    }

    try {
      console.log('[SpotifyIPC] spotify:import: Fetching playlist via API...');
      const playlist = await service.getPlaylist(playlistId);
      console.log(`[SpotifyIPC] spotify:import: Playlist fetched: ${playlist.name}`);

      console.log('[SpotifyIPC] spotify:import: Fetching tracks via API...');
      const tracks = await service.getPlaylistTracks(playlistId);
      console.log(`[SpotifyIPC] spotify:import: Tracks fetched: ${tracks.length}`);

      return { playlist, tracks };
    } catch (error) {
      console.error('[SpotifyIPC] spotify:import: API Error:', error);
      throw error;
    }
  });

  ipcMain.handle('spotify:matchTracks', async (_, { tracks }: { tracks: SpotifyTrack[] }) => {
    const songs = store.getSongs();
    const matches: ImportMatch[] = [];

    for (const track of tracks) {
      let bestMatch: ImportMatch = { spotifyTrack: track, confidence: 0 };

      for (const song of songs) {
        const score = calculateMatchScore(track, song);
        if (score > bestMatch.confidence) {
          bestMatch = { spotifyTrack: track, matchedSongId: song.id, confidence: score };
        }
      }

      matches.push(bestMatch);
    }

    return matches;
  });

  ipcMain.handle('spotify:createPlaylist', async (_, { name, description, tracks, spotifyUrl }: {
    name: string;
    description?: string;
    tracks: SpotifyTrack[];
    spotifyUrl?: string;
  }) => {
    const existingSongs = store.getSongs();
    const songIds: string[] = [];

    for (const track of tracks) {
      const existing = existingSongs.find(s => s.spotifyId === track.id);
      if (existing) {
        songIds.push(existing.id);
        continue;
      }

      const song: Song = {
        id: uuidv4(),
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms / 1000,
        filePath: '',
        coverArt: track.album.images[0]?.url,
        spotifyId: track.id,
        streamingUri: `spotify:track:${track.id}`,
        dateAdded: new Date().toISOString(),
      };

      store.addSong(song);
      songIds.push(song.id);
    }

    const playlist = {
      id: uuidv4(),
      name,
      description,
      songIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spotifyUrl,
    };

    store.addPlaylist(playlist);
    return playlist;
  });

  ipcMain.handle('spotify:accessToken', async () => {
    const service = getSpotifyService();
    if (!service) return null;
    return service.ensureToken();
  });

  ipcMain.handle('spotify:playTracks', async (_, { trackUris, deviceId }: { trackUris: string[]; deviceId?: string }) => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    const token = await service.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const body: any = {};
    if (trackUris && trackUris.length > 0) {
      body.uris = trackUris;
    }

    let url = 'https://api.spotify.com/v1/me/player/play';
    if (deviceId) {
      url += `?device_id=${deviceId}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 404 && trackUris && trackUris.length > 0) {
        console.log('[SpotifyIPC] No active device found. Launching Spotify Desktop App as fallback.');
        shell.openExternal(trackUris[0]);
        return true;
      }
      const errorText = await response.text();
      console.error(`[SpotifyIPC] Failed to start playback. Status: ${response.status}`, errorText);
      throw new Error(`Failed to start playback: ${response.status} - ${errorText}`);
    }
    return true;
  });

  ipcMain.handle('spotify:pause', async () => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    const token = await service.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok && response.status !== 204) throw new Error('Failed to pause');
    return true;
  });

  ipcMain.handle('spotify:seek', async (_, positionMs: number) => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    const token = await service.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok && response.status !== 204) throw new Error('Failed to seek');
    return true;
  });

  ipcMain.handle('spotify:setVolume', async (_, volume: number) => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    const token = await service.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok && response.status !== 204) throw new Error('Failed to set volume');
    return true;
  });

  ipcMain.handle('spotify:nextTrack', async () => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    const token = await service.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok && response.status !== 204) throw new Error('Failed to skip track');
    return true;
  });

  ipcMain.handle('spotify:previousTrack', async () => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');
    const token = await service.ensureToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok && response.status !== 204) throw new Error('Failed to previous track');
    return true;
  });

  ipcMain.handle('spotify:getState', async () => {
    const service = getSpotifyService();
    if (!service) return null;
    const token = await service.ensureToken();
    if (!token) return null;

    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 204) return null;
    if (!response.ok) return null;
    
    try {
      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  });

  ipcMain.handle('youtube:search', async (_, query: string) => {
    try {
      console.log('[YoutubeIPC] Received search query:', query);
      const searchFn = typeof yts === 'function' ? yts : (yts as any).default || yts;
      const r = await searchFn(query);
      if (r && r.videos.length > 0) {
        console.log('[YoutubeIPC] Found video:', r.videos[0].title, '(', r.videos[0].videoId, ')');
        return r.videos[0].videoId;
      }
      console.log('[YoutubeIPC] Video not found by yt-search');
      return null;
    } catch (err) {
      console.error('[YoutubeIPC] Search failed:', err);
      return null;
    }
  });
}

function calculateMatchScore(spotify: SpotifyTrack, local: Song): number {
  let score = 0;

  const spotifyName = spotify.name.toLowerCase();
  const localTitle = local.title.toLowerCase();
  if (spotifyName === localTitle) {
    score += 40;
  } else if (fuzzyMatch(spotifyName, localTitle) > 0.8) {
    score += 25;
  }

  const spotifyArtist = spotify.artists[0]?.name.toLowerCase() || '';
  const localArtist = local.artist.toLowerCase();
  if (spotifyArtist === localArtist) {
    score += 40;
  } else if (fuzzyMatch(spotifyArtist, localArtist) > 0.8) {
    score += 25;
  }

  const spotifyAlbum = spotify.album.name.toLowerCase();
  const localAlbum = local.album.toLowerCase();
  if (spotifyAlbum === localAlbum) {
    score += 15;
  }

  const spotifyDuration = spotify.duration_ms / 1000;
  const durationDiff = Math.abs(spotifyDuration - local.duration);
  if (durationDiff < 5) {
    score += 5;
  }

  return score;
}

function fuzzyMatch(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 1;
  if (aLower.length === 0 || bLower.length === 0) return 0;

  let matches = 0;
  let bIndex = 0;

  for (let i = 0; i < aLower.length; i++) {
    const found = bLower.indexOf(aLower[i], bIndex);
    if (found !== -1) {
      matches++;
      bIndex = found + 1;
    }
  }

  return matches / Math.max(aLower.length, bLower.length);
}
