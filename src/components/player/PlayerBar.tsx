import { useEffect, useRef } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { FiMusic } from 'react-icons/fi';

export function PlayerBar() {
  const { currentSong, isPlaying, volume, setCurrentTime, setDuration } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = `file://${currentSong.filePath}`;
      audioRef.current.play().catch(console.error);
    }
  }, [currentSong]);
  
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleEnded = () => {
    useAudio.getState().next();
  };
  
  return (
    <div className="glass-panel mx-4 mb-4 p-4 flex items-center gap-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      {/* Now Playing */}
      <div className="flex items-center gap-3 w-64">
        {currentSong?.coverArt ? (
          <img src={currentSong.coverArt} alt="" className="w-12 h-12 rounded" />
        ) : (
          <div className="w-12 h-12 rounded bg-[var(--bg-glass)] flex items-center justify-center">
            <FiMusic className="text-[var(--text-secondary)]" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{currentSong?.title || 'No track'}</p>
          <p className="text-sm text-[var(--text-secondary)] truncate">
            {currentSong?.artist || 'Select a song'}
          </p>
        </div>
      </div>
      
      {/* Playback Controls + Progress */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <PlaybackControls />
        <ProgressBar />
      </div>
      
      {/* Volume */}
      <div className="w-48 flex justify-end">
        <VolumeControl />
      </div>
    </div>
  );
}
