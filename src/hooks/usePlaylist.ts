import { create } from 'zustand';
import { Playlist } from '../types';
import { ipc } from '../lib/ipc';

interface PlaylistState {
  playlists: Playlist[];
  isLoading: boolean;
  selectedPlaylistId: string | null;
  
  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  selectPlaylist: (id: string | null) => void;
}

export const usePlaylist = create<PlaylistState>((set) => ({
  playlists: [],
  isLoading: false,
  selectedPlaylistId: null,
  
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
    const playlist = await ipc.invoke<Playlist>('playlist:create', { name, description });
    set((state) => ({ playlists: [...state.playlists, playlist] }));
    return playlist;
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
    await ipc.invoke('playlist:delete', id);
    set((state) => ({
      playlists: state.playlists.filter(p => p.id !== id),
      selectedPlaylistId: state.selectedPlaylistId === id ? null : state.selectedPlaylistId,
    }));
  },
  
  addSongToPlaylist: async (playlistId, songId) => {
    await ipc.invoke('playlist:addSong', { playlistId, songId });
    set((state) => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId && !p.songIds.includes(songId)
          ? { ...p, songIds: [...p.songIds, songId] }
          : p
      ),
    }));
  },
  
  removeSongFromPlaylist: async (playlistId, songId) => {
    await ipc.invoke('playlist:removeSong', { playlistId, songId });
    set((state) => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
          : p
      ),
    }));
  },
  
  selectPlaylist: (id) => set({ selectedPlaylistId: id }),
}));
