import { create } from 'zustand';
import { Song } from '../types';

interface AudioState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
}

export const useAudio = create<AudioState>((set) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  
  play: (song: Song) => {
    set({ currentSong: song, isPlaying: true, currentTime: 0 });
  },
  
  pause: () => {
    set({ isPlaying: false });
  },
  
  resume: () => {
    set({ isPlaying: true });
  },
  
  setVolume: (volume: number) => {
    set({ volume });
  },
  
  seek: (time: number) => {
    set({ currentTime: time });
  },
}));
