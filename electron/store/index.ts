import Store from 'electron-store';
import { Song, Playlist, Lyrics, Settings } from '../types';

const libraryStore = new Store<Song[]>({ name: 'library', defaults: [] });
const playlistStore = new Store<Playlist[]>({ name: 'playlists', defaults: [] });
const lyricsStore = new Store<Lyrics[]>({ name: 'lyrics', defaults: [] });
const settingsStore = new Store<Settings>({ name: 'settings', defaults: {
  theme: 'dark',
  accentColor: '#1db954',
  volume: 80,
}});

export const store = {
  // Library
  getSongs: (): Song[] => libraryStore.get(undefined, []),
  saveSongs: (songs: Song[]): void => libraryStore.set(undefined, songs),
  addSong: (song: Song): void => {
    const songs = libraryStore.get(undefined, []);
    songs.push(song);
    libraryStore.set(undefined, songs);
  },
  removeSong: (id: string): void => {
    const songs = libraryStore.get(undefined, []);
    libraryStore.set(undefined, songs.filter(s => s.id !== id));
  },
  
  // Playlists
  getPlaylists: (): Playlist[] => playlistStore.get(undefined, []),
  savePlaylists: (playlists: Playlist[]): void => playlistStore.set(undefined, playlists),
  addPlaylist: (playlist: Playlist): void => {
    const playlists = playlistStore.get(undefined, []);
    playlists.push(playlist);
    playlistStore.set(undefined, playlists);
  },
  updatePlaylist: (id: string, updates: Partial<Playlist>): void => {
    const playlists = playlistStore.get(undefined, []);
    const index = playlists.findIndex(p => p.id === id);
    if (index !== -1) {
      playlists[index] = { ...playlists[index], ...updates, updatedAt: new Date().toISOString() };
      playlistStore.set(undefined, playlists);
    }
  },
  deletePlaylist: (id: string): void => {
    const playlists = playlistStore.get(undefined, []);
    playlistStore.set(undefined, playlists.filter(p => p.id !== id));
  },
  
  // Lyrics
  getLyrics: (): Lyrics[] => lyricsStore.get(undefined, []),
  saveLyrics: (lyrics: Lyrics): void => {
    const allLyrics = lyricsStore.get(undefined, []);
    const index = allLyrics.findIndex(l => l.songId === lyrics.songId);
    if (index !== -1) {
      allLyrics[index] = lyrics;
    } else {
      allLyrics.push(lyrics);
    }
    lyricsStore.set(undefined, allLyrics);
  },
  getLyricsForSong: (songId: string): Lyrics | undefined => {
    return lyricsStore.get(undefined, []).find(l => l.songId === songId);
  },
  
  // Settings
  getSettings: (): Settings => settingsStore.store,
  saveSettings: (settings: Partial<Settings>): void => {
    settingsStore.set(settings);
  },
};