import { create } from 'zustand';
import { SpotifyTrack, SpotifyPlaylist, ImportMatch } from '../types';
import { ipc } from '../lib/ipc';

interface SpotifyState {
  isConnected: boolean;
  isImporting: boolean;
  importProgress: number;
  matchedTracks: ImportMatch[];
  playlistName: string;

  checkConnection: () => Promise<void>;
  login: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  setCredentials: (clientId: string, clientSecret: string) => Promise<void>;
  importPlaylist: (url: string) => Promise<{ playlist: SpotifyPlaylist; tracks: SpotifyTrack[] }>;
  matchTracks: (tracks: SpotifyTrack[]) => Promise<ImportMatch[]>;
  createPlaylist: (name: string, description: string | undefined, tracks: SpotifyTrack[], spotifyUrl?: string) => Promise<void>;
  setMatchedTracks: (matches: ImportMatch[]) => void;
  setPlaylistName: (name: string) => void;
  clearImport: () => void;
  disconnect: () => Promise<void>;
}

export const useSpotify = create<SpotifyState>((set) => ({
  isConnected: false,
  isImporting: false,
  importProgress: 0,
  matchedTracks: [],
  playlistName: '',

  checkConnection: async () => {
    const connected = await ipc.invoke<boolean>('spotify:isConnected');
    set({ isConnected: connected });
  },

  login: async () => {
    const cleanup = ipc.on('spotify:loginStatus', async (code) => {
      cleanup();
      if (code && typeof code === 'string') {
        const success = await ipc.invoke<boolean>('spotify:handleCallback', code);
        set({ isConnected: success });
      } else {
        set({ isConnected: false });
      }
    });
    await ipc.invoke('spotify:login');
  },

  handleCallback: async (code) => {
    const success = await ipc.invoke<boolean>('spotify:handleCallback', code);
    set({ isConnected: success });
    return success;
  },

  setCredentials: async (clientId, clientSecret) => {
    await ipc.invoke('spotify:setCredentials', { clientId, clientSecret });
  },

  importPlaylist: async (url) => {
    set({ isImporting: true, importProgress: 0 });
    try {
      const result = await ipc.invoke<{ playlist: SpotifyPlaylist; tracks: SpotifyTrack[] }>('spotify:import', url);
      set({ 
        importProgress: 50, 
        playlistName: result.playlist.name,
        matchedTracks: result.tracks.map(t => ({ spotifyTrack: t, confidence: 100 })),
      });
      return result;
    } catch (error) {
      set({ isImporting: false });
      throw error;
    }
  },

  matchTracks: async (tracks) => {
    set({ importProgress: 75 });
    try {
      const matches = await ipc.invoke<ImportMatch[]>('spotify:matchTracks', { tracks });
      set({ matchedTracks: matches, importProgress: 100, isImporting: false });
      return matches;
    } catch (error) {
      set({ isImporting: false, importProgress: 0 });
      throw error;
    }
  },

  createPlaylist: async (name, description, tracks, spotifyUrl) => {
    await ipc.invoke('spotify:createPlaylist', { name, description, tracks, spotifyUrl });
  },

  setMatchedTracks: (matches) => set({ matchedTracks: matches }),

  setPlaylistName: (name) => set({ playlistName: name }),

  clearImport: () => set({ matchedTracks: [], importProgress: 0, isImporting: false, playlistName: '' }),

  disconnect: async () => {
    await ipc.invoke('spotify:disconnect');
    set({ isConnected: false });
  },
}));
