import { create } from 'zustand';
import { ipc } from '../lib/ipc';

interface SpotifyPlaybackState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      id: string;
      uri: string;
      name: string;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
      duration_ms: number;
    };
  };
}

interface SpotifyPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyPlaybackState['track_window']['current_track'] | null;
  position: number;
  duration: number;
  volume: number;
  error: string | null;
  sdkLoaded: boolean;

  initPlayer: () => Promise<void>;
  playUri: (uris: string[], trackMeta?: any) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  getState: () => Promise<SpotifyPlaybackState | null>;
}

let ytPlayer: any = null;
let positionInterval: ReturnType<typeof setInterval> | null = null;

const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if ((window as any).YT && (window as any).YT.Player) {
      resolve((window as any).YT);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.body.appendChild(tag);
    }
    (window as any).onYouTubeIframeAPIReady = () => {
      resolve((window as any).YT);
    };
  });
};

export const useSpotifyPlayer = create<SpotifyPlayerState>((set, get) => ({
  isReady: false,
  isPlaying: false,
  currentTrack: null,
  position: 0,
  duration: 0,
  volume: 80,
  error: null,
  sdkLoaded: true,

  initPlayer: async () => {
    if (ytPlayer) return;

    await loadYouTubeAPI();

    // Ensure the container exists
    if (!document.getElementById('youtube-player')) {
      const div = document.createElement('div');
      div.id = 'youtube-player';
      div.style.opacity = '0.01';
      div.style.position = 'fixed';
      div.style.top = '-1000px';
      div.style.left = '-1000px';
      div.style.width = '200px';
      div.style.height = '200px';
      div.style.pointerEvents = 'none';
      document.body.appendChild(div);
    }

    ytPlayer = new (window as any).YT.Player('youtube-player', {
      height: '200',
      width: '200',
      videoId: 'dQw4w9WgXcQ', // Dummy video to ensure onReady fires
      playerVars: {
        'playsinline': 1,
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'origin': window.location.origin
      },
      events: {
        'onReady': () => {
          console.log('[YoutubeFallback] Player is ready!');
          ytPlayer.setVolume(get().volume);
          set({ isReady: true });
        },
        'onStateChange': (event: any) => {
          console.log('[YoutubeFallback] State changed to:', event.data);
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3, CUED = 5
          if (event.data === 1 || event.data === 3) {
            set({ isPlaying: true });
            if (event.data === 1 && ytPlayer.getDuration) {
              set({ duration: ytPlayer.getDuration() * 1000 });
            }
            if (!positionInterval) {
              positionInterval = setInterval(() => {
                if (ytPlayer && ytPlayer.getCurrentTime) {
                  set({ position: ytPlayer.getCurrentTime() * 1000 });
                }
              }, 500);
            }
          } else if (event.data === 2 || event.data === 0) {
            set({ isPlaying: false });
            if (positionInterval) {
              clearInterval(positionInterval);
              positionInterval = null;
            }
            if (event.data === 0) {
              import('./useAudio').then(({ useAudio }) => {
                useAudio.getState().next();
              });
            }
          }
        },
        'onError': (event: any) => {
          console.error('[YoutubeFallback] Error from YT player:', event.data);
        }
      }
    });
  },

  playUri: async (uris: string[], trackMeta?: any) => {
    try {
      console.log('[YoutubeFallback] playUri called with meta:', trackMeta?.title);
      set({ error: null, isPlaying: true });
      let query = '';
      
      if (trackMeta) {
        query = `${trackMeta.artist || ''} ${trackMeta.title || ''} audio`;
        set({ currentTrack: {
          id: trackMeta.id,
          uri: trackMeta.streamingUri || uris[0],
          name: trackMeta.title,
          artists: [{ name: trackMeta.artist }],
          album: { name: trackMeta.album, images: [{ url: trackMeta.coverArt || '' }] },
          duration_ms: trackMeta.duration * 1000
        }});
      } else {
        set({ error: 'Track metadata required for YouTube fallback', isPlaying: false });
        return;
      }

      console.log('[YoutubeFallback] Searching YouTube for:', query);
      const videoId = await ipc.invoke('youtube:search', query);
      console.log('[YoutubeFallback] Search returned videoId:', videoId);
      
      let retries = 0;
      while ((!ytPlayer || !ytPlayer.loadVideoById) && retries < 20) {
        await new Promise(r => setTimeout(r, 100));
        retries++;
      }

      if (videoId && ytPlayer && ytPlayer.loadVideoById) {
        console.log('[YoutubeFallback] Loading video ID into player:', videoId);
        ytPlayer.loadVideoById(videoId);
        set({ isPlaying: true });
      } else {
        console.error('[YoutubeFallback] Failed to load video. ytPlayer status:', !!ytPlayer);
        set({ error: 'Failed to find audio on YouTube or player not ready', isPlaying: false });
      }
    } catch (err: any) {
      set({ error: err.message, isPlaying: false });
    }
  },

  play: async () => {
    if (!ytPlayer) return;
    set({ isPlaying: true });
    ytPlayer.playVideo();
  },

  pause: async () => {
    if (!ytPlayer) return;
    set({ isPlaying: false });
    ytPlayer.pauseVideo();
  },

  seek: async (positionMs: number) => {
    if (!ytPlayer) return;
    ytPlayer.seekTo(positionMs / 1000, true);
    set({ position: positionMs });
  },

  setVolume: async (volume: number) => {
    const v = Math.max(0, Math.min(100, volume));
    set({ volume: v });
    if (ytPlayer) {
      ytPlayer.setVolume(v);
    }
  },

  nextTrack: async () => {
    // Next track logic should be handled by the queue manager (useAudio/useLibrary)
    // We just emit an ended event or rely on useAudio to call playUri with the next track
  },

  previousTrack: async () => {
    // Previous track logic handled by queue manager
  },

  getState: async () => {
    const { isPlaying, position, duration, currentTrack } = get();
    if (!currentTrack) return null;
    return {
      paused: !isPlaying,
      position,
      duration,
      track_window: {
        current_track: currentTrack
      }
    };
  },
}));
