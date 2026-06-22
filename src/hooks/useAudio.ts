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
  upNext: Song[];
  history: Song[];
  seekRequest: number | null;
  
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
  playNext: (song: Song) => void;
  removeFromUpNext: (index: number) => void;
  clearUpNext: () => void;
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
  upNext: [],
  history: [],
  seekRequest: null,
  
  play: (song) => {
    const { currentSong } = get();
    if (currentSong) {
      set((state) => ({ history: [...state.history.slice(-49), currentSong] }));
    }
    set({ currentSong: song, isPlaying: true, currentTime: 0 });
  },
  
  pause: () => set({ isPlaying: false }),
  
  resume: () => set({ isPlaying: true }),
  
  togglePlay: () => {
    const { isPlaying, currentSong, queue, upNext } = get();
    if (!currentSong && (upNext.length > 0 || queue.length > 0)) {
      if (upNext.length > 0) get().play(upNext[0]);
      else get().play(queue[0]);
    } else {
      set({ isPlaying: !isPlaying });
    }
  },
  
  seek: (time) => set({ currentTime: time, seekRequest: time }),
  
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
  
  next: () => {
    const { queue, upNext, currentSong, shuffle, repeat } = get();
    
    if (repeat === 'one' && currentSong) {
      get().play(currentSong);
      return;
    }
    
    // Priority: upNext first, then queue
    if (upNext.length > 0) {
      const [nextSong, ...rest] = upNext;
      set({ upNext: rest });
      get().play(nextSong);
      return;
    }
    
    // Fall back to default queue
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    let nextIndex = currentIndex + 1;

    if (shuffle) {
      if (queue.length <= 1) {
        set({ isPlaying: false });
        return;
      }
      const availableIndices = queue
        .map((_, i) => i)
        .filter(i => i !== currentIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
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
    const { history, currentTime, currentSong } = get();
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
    } else if (currentSong) {
      set({ currentTime: 0 });
    }
  },
  
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  
  toggleRepeat: () => set((state) => ({
    repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
  })),
  
  setQueue: (songs) => set({ queue: songs }),
  
  playNext: (song) => {
    const { currentSong } = get();
    if (!currentSong) {
      get().play(song);
      return;
    }
    set((state) => ({ upNext: [...state.upNext, song] }));
  },
  
  removeFromUpNext: (index) => set((state) => {
    const newUpNext = [...state.upNext];
    newUpNext.splice(index, 1);
    return { upNext: newUpNext };
  }),
  
  clearUpNext: () => set({ upNext: [] }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
}));
