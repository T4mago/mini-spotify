import { create } from 'zustand';
import { Lyrics } from '../types';
import { ipc } from '../lib/ipc';

interface LyricsState {
  currentLyrics: Lyrics | null;
  isLoading: boolean;
  
  loadLyrics: (songId: string) => Promise<void>;
  saveLyrics: (songId: string, content: string) => Promise<void>;
  clearLyrics: () => void;
}

export const useLyrics = create<LyricsState>((set) => ({
  currentLyrics: null,
  isLoading: false,
  
  loadLyrics: async (songId) => {
    set({ isLoading: true });
    try {
      const lyrics = await ipc.invoke<Lyrics | undefined>('lyrics:get', songId);
      set({ currentLyrics: lyrics || null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  
  saveLyrics: async (songId, content) => {
    const lyrics: Lyrics = {
      songId,
      content,
      updatedAt: new Date().toISOString(),
    };
    try {
      await ipc.invoke('lyrics:save', lyrics);
      set({ currentLyrics: lyrics });
    } catch (error) {
      console.error('Failed to save lyrics:', error);
      throw error;
    }
  },
  
  clearLyrics: () => set({ currentLyrics: null }),
}));
