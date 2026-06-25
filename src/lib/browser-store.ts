import { Song, Playlist, Lyrics, Settings } from '../types';

const DB_NAME = 'mini-spotify';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('library')) db.createObjectStore('library');
      if (!db.objectStoreNames.contains('playlists')) db.createObjectStore('playlists');
      if (!db.objectStoreNames.contains('lyrics')) db.createObjectStore('lyrics');
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      if (!db.objectStoreNames.contains('spotify-auth')) db.createObjectStore('spotify-auth');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get<T>(store: string, key: string, fallback: T): Promise<T> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result ?? fallback);
    req.onerror = () => resolve(fallback);
  });
}

async function set<T>(store: string, key: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accentColor: '#1db954',
  volume: 80,
};

export const browserStore = {
  get: <T>(store: string, key: string, fallback: T) => get<T>(store, key, fallback),
  set: <T>(store: string, key: string, value: T) => set<T>(store, key, value),
  getSongs: () => get<Song[]>('library', 'data', []),
  saveSongs: (songs: Song[]) => set('library', 'data', songs),
  addSong: async (song: Song) => {
    const songs = await browserStore.getSongs();
    songs.push(song);
    await browserStore.saveSongs(songs);
  },
  removeSong: async (id: string) => {
    const songs = await browserStore.getSongs();
    await browserStore.saveSongs(songs.filter((s) => s.id !== id));
  },

  getPlaylists: () => get<Playlist[]>('playlists', 'data', []),
  savePlaylists: (playlists: Playlist[]) => set('playlists', 'data', playlists),
  addPlaylist: async (playlist: Playlist) => {
    const playlists = await browserStore.getPlaylists();
    playlists.push(playlist);
    await browserStore.savePlaylists(playlists);
  },
  updatePlaylist: async (id: string, updates: Omit<Partial<Playlist>, 'id'>) => {
    const playlists = await browserStore.getPlaylists();
    const idx = playlists.findIndex((p) => p.id === id);
    if (idx !== -1) {
      playlists[idx] = { ...playlists[idx], ...updates, updatedAt: new Date().toISOString() };
      await browserStore.savePlaylists(playlists);
    }
  },
  deletePlaylist: async (id: string) => {
    const playlists = await browserStore.getPlaylists();
    await browserStore.savePlaylists(playlists.filter((p) => p.id !== id));
  },

  getLyrics: () => get<Lyrics[]>('lyrics', 'data', []),
  getLyricsForSong: async (songId: string) => {
    const all = await browserStore.getLyrics();
    return all.find((l) => l.songId === songId);
  },
  saveLyrics: async (lyrics: Lyrics) => {
    const all = await browserStore.getLyrics();
    const idx = all.findIndex((l) => l.songId === lyrics.songId);
    if (idx !== -1) all[idx] = lyrics;
    else all.push(lyrics);
    await set('lyrics', 'data', all);
  },

  getSettings: () => get<Settings>('settings', 'config', DEFAULT_SETTINGS),
  saveSettings: async (settings: Partial<Settings>) => {
    const current = await browserStore.getSettings();
    await set('settings', 'config', { ...current, ...settings });
  },
};
