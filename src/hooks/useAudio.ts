import { create } from 'zustand';
import { Song } from '../types';

interface AudioState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  queue: Song[];
  history: Song[];
  
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (songs: Song[]) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 80,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off',
  queue: [],
  history: [],
  
  play: (song) => {
    const { currentSong } = get();
    if (currentSong) {
      set((state) => ({ history: [...state.history, currentSong] }));
    }
    set({ currentSong: song, isPlaying: true, currentTime: 0 });
  },
  
  pause: () => set({ isPlaying: false }),
  
  resume: () => set({ isPlaying: true }),
  
  togglePlay: () => {
    const { isPlaying, currentSong, queue } = get();
    if (!currentSong && queue.length > 0) {
      get().play(queue[0]);
    } else {
      set({ isPlaying: !isPlaying });
    }
  },
  
  seek: (time) => set({ currentTime: time }),
  
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
  
  next: () => {
    const { queue, currentSong, shuffle, repeat } = get();
    if (!currentSong) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    let nextIndex = currentIndex + 1;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    
    get().play(queue[nextIndex]);
  },
  
  previous: () => {
    const { history, currentTime } = get();
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    
    if (history.length > 0) {
      const previousSong = history[history.length - 1];
      set((state) => ({ 
        history: state.history.slice(0, -1),
        currentSong: previousSong,
        currentTime: 0,
        isPlaying: true,
      }));
    }
  },
  
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  
  toggleRepeat: () => set((state) => ({
    repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
  })),
  
  setQueue: (songs) => set({ queue: songs }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
}));
