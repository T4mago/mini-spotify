import { useAudio } from '../../hooks/useAudio';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi';

export function PlaybackControls() {
  const { isPlaying, togglePlay, next, previous } = useAudio();
  
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={previous}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <FiSkipBack size={14} fill="currentColor" />
      </button>
      
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-[var(--accent)] text-black flex items-center justify-center hover:scale-105 transition-all shadow-[0_3px_10px_rgba(29,185,84,0.3)] hover:shadow-[0_4px_16px_rgba(29,185,84,0.5)] active:scale-95"
      >
        {isPlaying 
          ? <FiPause size={14} fill="currentColor" /> 
          : <FiPlay size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <button
        onClick={next}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <FiSkipForward size={14} fill="currentColor" />
      </button>
    </div>
  );
}
