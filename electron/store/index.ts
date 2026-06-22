import Store from 'electron-store';
import { Song, Playlist, Lyrics, Settings } from '../types.js';

const libraryStore = new Store<{ data: Song[] }>({ name: 'library', defaults: { data: [] } });
const playlistStore = new Store<{ data: Playlist[] }>({ name: 'playlists', defaults: { data: [] } });
const lyricsStore = new Store<{ data: Lyrics[] }>({ name: 'lyrics', defaults: { data: [] } });
const settingsStore = new Store<Settings>({ name: 'settings', defaults: {
  theme: 'dark',
  accentColor: '#1db954',
  volume: 80,
}});

export const store = {
  // Library
  getSongs: (): Song[] => libraryStore.get('data', []),
  saveSongs: (songs: Song[]): void => libraryStore.set('data', songs),
  addSong: (song: Song): void => {
    const songs = libraryStore.get('data', []);
    songs.push(song);
    libraryStore.set('data', songs);
  },
  removeSong: (id: string): void => {
    const songs = libraryStore.get('data', []);
    libraryStore.set('data', songs.filter(s => s.id !== id));
  },
  
  // Playlists
  getPlaylists: (): Playlist[] => playlistStore.get('data', []),
  savePlaylists: (playlists: Playlist[]): void => playlistStore.set('data', playlists),
  addPlaylist: (playlist: Playlist): void => {
    const playlists = playlistStore.get('data', []);
    playlists.push(playlist);
    playlistStore.set('data', playlists);
  },
  updatePlaylist: (id: string, updates: Omit<Partial<Playlist>, 'id'>): void => {
    const playlists = playlistStore.get('data', []);
    const index = playlists.findIndex(p => p.id === id);
    if (index !== -1) {
      playlists[index] = { ...playlists[index], ...updates, updatedAt: new Date().toISOString() };
      playlistStore.set('data', playlists);
    }
  },
  deletePlaylist: (id: string): void => {
    const playlists = playlistStore.get('data', []);
    playlistStore.set('data', playlists.filter(p => p.id !== id));
  },
  
  // Lyrics
  getLyrics: (): Lyrics[] => lyricsStore.get('data', []),
  saveLyrics: (lyrics: Lyrics): void => {
    const allLyrics = lyricsStore.get('data', []);
    const index = allLyrics.findIndex(l => l.songId === lyrics.songId);
    if (index !== -1) {
      allLyrics[index] = lyrics;
    } else {
      allLyrics.push(lyrics);
    }
    lyricsStore.set('data', allLyrics);
  },
  getLyricsForSong: (songId: string): Lyrics | undefined => {
    return lyricsStore.get('data', []).find(l => l.songId === songId);
  },
  
  // Settings
  getSettings: (): Settings => settingsStore.store,
  saveSettings: (settings: Partial<Settings>): void => {
    settingsStore.set(settings);
  },
};