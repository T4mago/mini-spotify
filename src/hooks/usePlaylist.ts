import { create } from 'zustand';
import { Playlist } from '../types';
import { ipc } from '../lib/ipc';

interface PlaylistState {
  playlists: Playlist[];
  isLoading: boolean;
  
  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Omit<Partial<Playlist>, 'id'>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

export const usePlaylist = create<PlaylistState>((set) => ({
  playlists: [],
  isLoading: false,
  
  loadPlaylists: async () => {
    set({ isLoading: true });
    try {
      const playlists = await ipc.invoke<Playlist[]>('playlist:getAll');
      set({ playlists, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  
  createPlaylist: async (name, description) => {
    try {
      const playlist = await ipc.invoke<Playlist>('playlist:create', { name, description });
      set((state) => ({ playlists: [...state.playlists, playlist] }));
      return playlist;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  },
  
  updatePlaylist: async (id, updates) => {
    await ipc.invoke('playlist:update', { id, updates });
    set((state) => ({
      playlists: state.playlists.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },
  
  deletePlaylist: async (id) => {
    try {
      await ipc.invoke('playlist:delete', id);
      set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error;
    }
  },
  
  addSongToPlaylist: async (playlistId, songId) => {
    try {
      await ipc.invoke('playlist:addSong', { playlistId, songId });
      set((state) => ({
        playlists: state.playlists.map(p =>
          p.id === playlistId && !p.songIds.includes(songId)
            ? { ...p, songIds: [...p.songIds, songId] }
            : p
        ),
      }));
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      throw error;
    }
  },
  
  removeSongFromPlaylist: async (playlistId, songId) => {
    try {
      await ipc.invoke('playlist:removeSong', { playlistId, songId });
      set((state) => ({
        playlists: state.playlists.map(p =>
          p.id === playlistId
            ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
            : p
        ),
      }));
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
      throw error;
    }
  },
}));
