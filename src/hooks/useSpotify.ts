import { create } from 'zustand';
import { SpotifyTrack, SpotifyPlaylist, ImportMatch } from '../types';
import { ipc } from '../lib/ipc';

interface SpotifyState {
  isConnected: boolean;
  isImporting: boolean;
  importProgress: number;
  matchedTracks: ImportMatch[];

  checkConnection: () => Promise<void>;
  login: () => Promise<void>;
  setCredentials: (clientId: string, clientSecret: string) => Promise<void>;
  importPlaylist: (url: string) => Promise<{ playlist: SpotifyPlaylist; tracks: SpotifyTrack[] }>;
  matchTracks: (tracks: SpotifyTrack[]) => Promise<ImportMatch[]>;
  createPlaylist: (name: string, description: string | undefined, songIds: string[], spotifyUrl?: string) => Promise<void>;
  setMatchedTracks: (matches: ImportMatch[]) => void;
  clearImport: () => void;
}

export const useSpotify = create<SpotifyState>((set) => ({
  isConnected: false,
  isImporting: false,
  importProgress: 0,
  matchedTracks: [],

  checkConnection: async () => {
    const connected = await ipc.invoke<boolean>('spotify:isConnected');
    set({ isConnected: connected });
  },

  login: async () => {
    await ipc.invoke('spotify:login');
  },

  setCredentials: async (clientId, clientSecret) => {
    await ipc.invoke('spotify:setCredentials', { clientId, clientSecret });
  },

  importPlaylist: async (url) => {
    set({ isImporting: true, importProgress: 0 });
    try {
      const result = await ipc.invoke<{ playlist: SpotifyPlaylist; tracks: SpotifyTrack[] }>('spotify:import', url);
      set({ importProgress: 50 });
      return result;
    } catch (error) {
      set({ isImporting: false });
      throw error;
    }
  },

  matchTracks: async (tracks) => {
    set({ importProgress: 75 });
    const matches = await ipc.invoke<ImportMatch[]>('spotify:matchTracks', { tracks });
    set({ matchedTracks: matches, importProgress: 100, isImporting: false });
    return matches;
  },

  createPlaylist: async (name, description, songIds, spotifyUrl) => {
    await ipc.invoke('spotify:createPlaylist', { name, description, songIds, spotifyUrl });
  },

  setMatchedTracks: (matches) => set({ matchedTracks: matches }),

  clearImport: () => set({ matchedTracks: [], importProgress: 0, isImporting: false }),
}));
