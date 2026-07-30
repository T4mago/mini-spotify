import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { useSpotifyPlayer } from '../../hooks/useSpotifyPlayer';
import { useLyrics } from '../../hooks/useLyrics';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { FiMic, FiList } from 'react-icons/fi';

interface PlayerBarProps {
  isLyricsOpen: boolean;
  onToggleLyrics: () => void;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
}

function MusicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function PlayerBar({ isLyricsOpen, onToggleLyrics, isQueueOpen, onToggleQueue }: PlayerBarProps) {
  const { currentSong, isPlaying, volume, seekRequest, currentTime, duration, setCurrentTime, setDuration, seek } = useAudio();
  const spotify = useSpotifyPlayer();
  const { loadLyrics } = useLyrics();
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTimeUpdate = useRef(0);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSpotifyMode = !!currentSong?.streamingUri;

  useEffect(() => {
    if (currentSong) {
      loadLyrics(currentSong);
    }
  }, [currentSong, loadLyrics]);

  useEffect(() => {
    spotify.initPlayer();
  }, []);

  useEffect(() => {
    if (audioRef.current && !isSpotifyMode) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, isSpotifyMode]);

  useEffect(() => {
    if (isSpotifyMode) {
      spotify.setVolume(volume);
    }
  }, [volume, isSpotifyMode]);

  useEffect(() => {
    if (!currentSong) return;
    if (currentSong.streamingUri) {
      spotify.playUri([currentSong.streamingUri], currentSong);
    } else if (audioRef.current) {
      const filePath = currentSong.filePath.replace(/\\/g, '/');
      audioRef.current.src = `file:///${filePath}`;
      audioRef.current.play().catch(console.error);
    }
  }, [currentSong]);

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

  useEffect(() => {
    if (!isSpotifyMode) return;
    if (isPlaying) {
      spotify.play();
    } else {
      spotify.pause();
    }
  }, [isPlaying, isSpotifyMode]);

  useEffect(() => {
    if (seekRequest !== null && !isSpotifyMode && audioRef.current) {
      audioRef.current.currentTime = seekRequest;
      useAudio.setState({ seekRequest: null });
    }
  }, [seekRequest, isSpotifyMode]);

  useEffect(() => {
    if (seekRequest !== null && isSpotifyMode) {
      spotify.seek(seekRequest * 1000);
      useAudio.setState({ seekRequest: null });
    }
  }, [seekRequest, isSpotifyMode]);

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
    <div className="double-bezel rounded-full md:px-1.5 px-1 w-full md:w-auto">
      <div className="double-bezel-inner rounded-full md:px-4 px-3 py-2 flex items-center md:gap-4 gap-2 w-full max-w-[720px]">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="hidden sm:flex items-center gap-3 w-40 min-w-0">
          {currentSong?.coverArt ? (
            <img src={currentSong.coverArt} alt="" className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/5" />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <MusicIcon size={14} />
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

        <div className="flex-1 flex flex-col items-center gap-1">
          <PlaybackControls />
          <div className="flex items-center gap-2 w-full max-w-full md:max-w-[260px]">
            <span className="text-[9px] text-[var(--text-tertiary)] w-7 text-right tabular-nums font-medium">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-[2px] progress-track group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
            >
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] text-[var(--text-tertiary)] w-7 tabular-nums font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden sm:flex w-44 items-center justify-end gap-0.5">
          <button
            onClick={onToggleQueue}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-90 ${
              isQueueOpen
                ? 'text-[var(--accent)] bg-[rgba(29,185,84,0.08)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
            }`}
            title="Queue"
          >
            <FiList size={12} />
          </button>
          <button
            onClick={onToggleLyrics}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-90 ${
              isLyricsOpen
                ? 'text-[var(--accent)] bg-[rgba(29,185,84,0.08)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
            }`}
            title="Lyrics"
          >
            <FiMic size={12} />
          </button>
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
