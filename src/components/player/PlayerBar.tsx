import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { useSpotifyPlayer } from '../../hooks/useSpotifyPlayer';
import { useSpotify } from '../../hooks/useSpotify';
import { useLyrics } from '../../hooks/useLyrics';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { FiMusic, FiMic, FiList } from 'react-icons/fi';

interface PlayerBarProps {
  isLyricsOpen: boolean;
  onToggleLyrics: () => void;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
}

export function PlayerBar({ isLyricsOpen, onToggleLyrics, isQueueOpen, onToggleQueue }: PlayerBarProps) {
  const { currentSong, isPlaying, volume, seekRequest, currentTime, duration, setCurrentTime, setDuration, seek } = useAudio();
  const spotify = useSpotifyPlayer();
  const { isConnected } = useSpotify();
  const { loadLyrics } = useLyrics();
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTimeUpdate = useRef(0);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSpotifyMode = !!currentSong?.streamingUri;

  // Auto-load lyrics in the background when active song changes
  useEffect(() => {
    if (currentSong) {
      loadLyrics(currentSong);
    }
  }, [currentSong, loadLyrics]);

  // Initialize YouTube player fallback
  useEffect(() => {
    spotify.initPlayer();
  }, []);

  // Local audio volume
  useEffect(() => {
    if (audioRef.current && !isSpotifyMode) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isSpotifyMode]);

  // Spotify volume
  useEffect(() => {
    if (isSpotifyMode) {
      spotify.setVolume(volume);
    }
  }, [volume, isSpotifyMode]);

  // Play song - local or Spotify
  useEffect(() => {
    if (!currentSong) return;

    if (currentSong.streamingUri) {
      // Spotify mode
      spotify.playUri([currentSong.streamingUri], currentSong);
    } else if (audioRef.current) {
      // Local mode
      const filePath = currentSong.filePath.replace(/\\/g, '/');
      audioRef.current.src = `file:///${filePath}`;
      audioRef.current.play().catch(console.error);
    }
  }, [currentSong]);

  // Play/pause - local
  useEffect(() => {
    if (isSpotifyMode) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isSpotifyMode]);

  // Play/pause - Spotify
  useEffect(() => {
    if (!isSpotifyMode) return;
    if (isPlaying) {
      spotify.play();
    } else {
      spotify.pause();
    }
  }, [isPlaying, isSpotifyMode]);

  // Seek - local
  useEffect(() => {
    if (seekRequest !== null && !isSpotifyMode && audioRef.current) {
      audioRef.current.currentTime = seekRequest;
      useAudio.setState({ seekRequest: null });
    }
  }, [seekRequest, isSpotifyMode]);

  // Seek - Spotify
  useEffect(() => {
    if (seekRequest !== null && isSpotifyMode) {
      spotify.seek(seekRequest * 1000);
      useAudio.setState({ seekRequest: null });
    }
  }, [seekRequest, isSpotifyMode]);

  // Sync Spotify state to useAudio
  useEffect(() => {
    if (isSpotifyMode && spotify.isReady) {
      syncInterval.current = setInterval(async () => {
        const state = await spotify.getState();
        if (state) {
          useAudio.setState({
            currentTime: state.position / 1000,
            duration: state.duration / 1000,
            isPlaying: !state.paused,
          });
        }
      }, 250);
    }
    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [isSpotifyMode, spotify.isReady]);

  // Local audio callbacks
  const handleTimeUpdate = useCallback(() => {
    const now = performance.now();
    if (now - lastTimeUpdate.current < 100) return;
    lastTimeUpdate.current = now;
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [setCurrentTime]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    useAudio.getState().next();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-pill px-5 py-2.5 flex items-center gap-4 w-[700px] animate-slide-up">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Now Playing Info */}
      <div className="flex items-center gap-3 w-48 min-w-0">
        {currentSong?.coverArt ? (
          <img src={currentSong.coverArt} alt="" className="w-10 h-10 rounded-lg object-cover shadow-lg ring-1 ring-black/10" />
        ) : (
          <div className="w-10 h-10 rounded-lg glass-solid flex items-center justify-center">
            <FiMusic size={15} className="text-[var(--text-tertiary)]" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[var(--text-primary)] truncate leading-tight">
            {currentSong?.title || 'No track'}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] truncate leading-tight mt-0.5">
            {currentSong?.artist || 'Select a song'}
          </p>
        </div>
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <PlaybackControls />
        <div className="flex items-center gap-2 w-full max-w-xs">
          <span className="text-[9px] text-[var(--text-tertiary)] w-7 text-right tabular-nums font-medium">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-[3px] bg-[var(--text-tertiary)]/15 rounded-full cursor-pointer relative group transition-all hover:h-1"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div className="h-full bg-[var(--accent)] rounded-full relative transition-all" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ring-1 ring-black/10" />
            </div>
          </div>
          <span className="text-[9px] text-[var(--text-tertiary)] w-7 tabular-nums font-medium">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Lyrics & Queue */}
      <div className="w-44 flex items-center justify-end gap-1.5">
        <button
          onClick={onToggleQueue}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isQueueOpen
              ? 'text-[var(--accent)] bg-[var(--accent)]/10'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
          }`}
          title="Queue"
        >
          <FiList size={13} />
        </button>
        <button
          onClick={onToggleLyrics}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isLyricsOpen 
              ? 'text-[var(--accent)] bg-[var(--accent)]/10' 
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
          }`}
          title="Lyrics"
        >
          <FiMic size={13} />
        </button>
        <VolumeControl />
      </div>
    </div>
  );
}
