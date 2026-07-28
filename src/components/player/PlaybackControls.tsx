import { useAudio } from '../../hooks/useAudio';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi';

export function PlaybackControls() {
  const { isPlaying, togglePlay, next, previous } = useAudio();
  
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={previous}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors active:scale-90"
      >
        <FiSkipBack size={13} fill="currentColor" />
      </button>
      
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-[var(--glass-bg-solid)] flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
      >
        {isPlaying 
          ? <FiPause size={13} fill="currentColor" /> 
          : <FiPlay size={13} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <button
        onClick={next}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors active:scale-90"
      >
        <FiSkipForward size={13} fill="currentColor" />
      </button>
    </div>
  );
}
