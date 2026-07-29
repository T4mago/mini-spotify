import { v4 as uuidv4 } from 'uuid';
import { browserStore } from './browser-store';
import { Song } from '../types';

const AUDIO_EXTS = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'];

async function parseAudioMetadata(file: File): Promise<Partial<Song>> {
  try {
    const { parseBuffer } = await import('music-metadata');
    const buf = await file.arrayBuffer();
    const meta = await parseBuffer(new Uint8Array(buf));
    return {
      title: meta.common.title || file.name.replace(/\.[^.]+$/, ''),
      artist: meta.common.artist || 'Unknown Artist',
      album: meta.common.album || 'Unknown Album',
      duration: meta.format.duration || 0,
      coverArt: meta.common.picture?.[0]
        ? `data:${meta.common.picture[0].format};base64,${btoa(
            String.fromCharCode(...new Uint8Array(meta.common.picture[0].data))
          )}`
        : undefined,
      year: meta.common.year,
      genre: meta.common.genre?.[0],
    };
  } catch {
    return { title: file.name.replace(/\.[^.]+$/, '') };
  }
}

// ponytail: FileSystemDirectoryHandle.entries() not in TS DOM types yet
async function* iterateDir(dirHandle: FileSystemDirectoryHandle) {
  const iter = (dirHandle as any).entries();
  for await (const [name, handle] of iter) {
    yield { name, handle } as { name: string; handle: FileSystemFileHandle | FileSystemDirectoryHandle };
  }
}

async function scanDirectory(dirHandle: FileSystemDirectoryHandle): Promise<Song[]> {
  const songs: Song[] = [];
  for await (const { name, handle } of iterateDir(dirHandle)) {
    if (handle.kind === 'directory') {
      songs.push(...(await scanDirectory(handle as FileSystemDirectoryHandle)));
    } else if (handle.kind === 'file') {
      const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
      if (!AUDIO_EXTS.includes(ext)) continue;
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        const meta = await parseAudioMetadata(file);
        const objectUrl = URL.createObjectURL(file);
        songs.push({
          id: uuidv4(),
          title: meta.title || name,
          artist: meta.artist || 'Unknown Artist',
          album: meta.album || 'Unknown Album',
          duration: meta.duration || 0,
          filePath: objectUrl,
          coverArt: meta.coverArt,
          year: meta.year,
          genre: meta.genre,
          dateAdded: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`Error parsing ${name}:`, err);
      }
    }
  }
  return songs;
}

async function youtubeSearch(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`
    );
    const html = await res.text();
    const match = html.match(/"videoId":"([^"]+)"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChannelHandler = (...args: any[]) => Promise<any> | any;

const handlers: Record<string, ChannelHandler> = {
  'library:songs': () => browserStore.getSongs(),
  'library:removeSong': (id: string) => browserStore.removeSong(id),
  'library:scan': async () => {
    if (!('showDirectoryPicker' in window)) {
      console.warn('File System Access API not supported');
      return [];
    }
    const dirHandle = await (window as any).showDirectoryPicker();
    const newSongs = await scanDirectory(dirHandle);
    const existing = await browserStore.getSongs();
    const existingPaths = new Set(existing.map((s) => s.filePath));
    const unique = newSongs.filter((s) => !existingPaths.has(s.filePath));
    await browserStore.saveSongs([...existing, ...unique]);
    return unique;
  },

  'playlist:getAll': () => browserStore.getPlaylists(),
  'playlist:create': async ({ name, description }: { name: string; description?: string }) => {
    const playlist = {
      id: uuidv4(),
      name,
      description,
      songIds: [] as string[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await browserStore.addPlaylist(playlist);
    return playlist;
  },
  'playlist:update': async ({ id, updates }: { id: string; updates: any }) => {
    await browserStore.updatePlaylist(id, updates);
    return true;
  },
  'playlist:delete': async (id: string) => {
    await browserStore.deletePlaylist(id);
    return true;
  },
  'playlist:addSong': async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
    const playlists = await browserStore.getPlaylists();
    const p = playlists.find((pl) => pl.id === playlistId);
    if (p && !p.songIds.includes(songId)) {
      await browserStore.updatePlaylist(playlistId, { songIds: [...p.songIds, songId] });
    }
    return true;
  },
  'playlist:removeSong': async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
    const playlists = await browserStore.getPlaylists();
    const p = playlists.find((pl) => pl.id === playlistId);
    if (p) {
      await browserStore.updatePlaylist(playlistId, { songIds: p.songIds.filter((id) => id !== songId) });
    }
    return true;
  },

  'settings:get': () => browserStore.getSettings(),
  'settings:save': async (settings: any) => {
    await browserStore.saveSettings(settings);
    return true;
  },

  'lyrics:get': async (songId: string) => browserStore.getLyricsForSong(songId),
  'lyrics:save': async (lyrics: any) => {
    await browserStore.saveLyrics(lyrics);
    return true;
  },

  'audio:getSettings': () => browserStore.getSettings(),
  'audio:savePosition': async (songId: string, position: number) => {
    await browserStore.saveSettings({ lastPlayedSong: songId, lastPlayedPosition: position });
    return true;
  },
  'audio:saveVolume': async (volume: number) => {
    await browserStore.saveSettings({ volume });
    return true;
  },

  'youtube:search': (query: string) => youtubeSearch(query),

  // Spotify - real PKCE flow
  'spotify:isConnected': () => import('./browser-spotify').then(m => m.isConnected()),
  'spotify:login': async () => {
    const { login, getSpotifyClientId } = await import('./browser-spotify');
    const clientId = await getSpotifyClientId();
    if (!clientId) throw new Error('Spotify Client ID not configured');
    login(clientId);
  },
  'spotify:handleCallback': (code: string) =>
    import('./browser-spotify').then(m => m.handleCallback(code)),
  'spotify:setCredentials': async ({ clientId }: { clientId: string; clientSecret: string }) => {
    // ponytail: only clientId used in PKCE, clientSecret ignored
    const { browserStore: bs } = await import('./browser-store');
    const settings = await bs.getSettings();
    await bs.saveSettings({ ...settings, spotifyClientId: clientId });
  },
  'spotify:disconnect': () => import('./browser-spotify').then(m => m.disconnect()),
  'spotify:accessToken': () => import('./browser-spotify').then(m => m.ensureToken()),
  'spotify:import': async (url: string) => {
    const { parsePlaylistId, getPlaylist, getPlaylistTracks } = await import('./browser-spotify');
    const playlistId = parsePlaylistId(url);
    console.log('[PWA] spotify:import playlistId:', playlistId);
    if (!playlistId) throw new Error('Invalid Spotify playlist URL');

    // Try Vercel Serverless Function first (gratis, bypass CORS)
    try {
      console.log('[PWA] spotify:import trying Vercel API proxy...');
      const response = await fetch(`/api/import?id=${playlistId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[PWA] spotify:import proxy success:', data.playlist.name);
        return data;
      }
      console.warn('[PWA] spotify:import proxy failed with status:', response.status);
    } catch (err) {
      console.warn('[PWA] spotify:import proxy error:', err);
    }

    // Fallback to client-side Spotify API (requires logged-in user)
    console.log('[PWA] Falling back to client-side Spotify API...');
    const playlist = await getPlaylist(playlistId);
    console.log('[PWA] spotify:import playlist:', playlist?.name);
    const tracks = await getPlaylistTracks(playlistId);
    console.log('[PWA] spotify:import tracks:', tracks?.length);
    return { playlist, tracks };
  },
  'spotify:matchTracks': async ({ tracks }: { tracks: any[] }) => {
    const songs = await browserStore.getSongs();
    return tracks.map((track: any) => {
      let best = { spotifyTrack: track, matchedSongId: undefined as string | undefined, confidence: 0 };
      for (const song of songs) {
        let score = 0;
        const tn = track.name.toLowerCase();
        const lt = song.title.toLowerCase();
        if (tn === lt) score += 40;
        const ta = (track.artists?.[0]?.name || '').toLowerCase();
        const la = song.artist.toLowerCase();
        if (ta === la) score += 40;
        if (track.album?.name?.toLowerCase() === song.album.toLowerCase()) score += 15;
        if (score > best.confidence) best = { spotifyTrack: track, matchedSongId: song.id, confidence: score };
      }
      return best;
    });
  },
  'spotify:createPlaylist': async ({ name, description, tracks, spotifyUrl }: any) => {
    const { v4: uuidv4 } = await import('uuid');
    const songs = await browserStore.getSongs();
    const songIds: string[] = [];
    for (const track of tracks) {
      const existing = songs.find((s: any) => s.spotifyId === track.id);
      if (existing) { songIds.push(existing.id); continue; }
      const song = {
        id: uuidv4(),
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms / 1000,
        filePath: '',
        coverArt: track.album.images?.[0]?.url,
        spotifyId: track.id,
        streamingUri: `spotify:track:${track.id}`,
        dateAdded: new Date().toISOString(),
      };
      await browserStore.addSong(song);
      songIds.push(song.id);
    }
    const playlist = {
      id: uuidv4(), name, description, songIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spotifyUrl,
    };
    await browserStore.addPlaylist(playlist);
    return playlist;
  },
  'spotify:playTracks': async ({ trackUris }: { trackUris: string[] }) => {
    const { playTracks } = await import('./browser-spotify');
    return playTracks(trackUris);
  },
  'spotify:pause': () => import('./browser-spotify').then(m => m.pause()),
  'spotify:nextTrack': () => import('./browser-spotify').then(m => m.nextTrack()),
  'spotify:previousTrack': () => import('./browser-spotify').then(m => m.previousTrack()),
  'spotify:seek': (pos: number) => import('./browser-spotify').then(m => m.seek(pos)),
  'spotify:setVolume': (vol: number) => import('./browser-spotify').then(m => m.setVolume(vol)),
  'spotify:getState': () => import('./browser-spotify').then(m => m.getState()),
};

export const browserIpc = {
  invoke: async <T>(channel: string, ...args: unknown[]): Promise<T> => {
    const handler = handlers[channel];
    if (!handler) {
      console.warn(`[PWA] Unhandled channel: ${channel}`);
      return undefined as T;
    }
    return handler(...args) as Promise<T>;
  },
  send: (channel: string, ..._args: unknown[]) => {
    console.warn(`[PWA] send() not supported: ${channel}`);
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    // Handle spotify:callback / spotify:loginStatus via postMessage
    if (channel === 'spotify:callback' || channel === 'spotify:loginStatus') {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'spotify-auth') {
          callback(event.data.success ? event.data.code : null);
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
    console.warn(`[PWA] on() not supported: ${channel}`);
    return () => {};
  },
};
