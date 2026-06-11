import { create } from 'zustand';
import { Song } from '../types';
import { ipc } from '../lib/ipc';

interface LibraryState {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  loadSongs: () => Promise<void>;
  scanFolder: () => Promise<Song[]>;
  removeSong: (id: string) => Promise<void>;
}

export const useLibrary = create<LibraryState>((set) => ({
  songs: [],
  isLoading: false,
  error: null,
  
  loadSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const songs = await ipc.invoke<Song[]>('library:songs');
      set({ songs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load songs', isLoading: false });
    }
  },
  
  scanFolder: async () => {
    set({ isLoading: true, error: null });
    try {
      const newSongs = await ipc.invoke<Song[]>('library:scan');
      set((state) => ({ 
        songs: [...state.songs, ...newSongs],
        isLoading: false 
      }));
      return newSongs;
    } catch (error) {
      set({ error: 'Failed to scan folder', isLoading: false });
      return [];
    }
  },
  
  removeSong: async (id: string) => {
    try {
      await ipc.invoke('library:removeSong', id);
      set((state) => ({ songs: state.songs.filter(s => s.id !== id) }));
    } catch (error) {
      set({ error: 'Failed to remove song' });
    }
  },
}));
