import { useAudio } from '../../hooks/useAudio';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle, FiRepeat } from 'react-icons/fi';

export function PlaybackControls() {
  const { isPlaying, togglePlay, next, previous, shuffle, repeat, toggleShuffle, toggleRepeat } = useAudio();
  
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleShuffle}
        className={`p-2 rounded-full transition-colors ${shuffle ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
      >
        <FiShuffle size={18} />
      </button>
      
      <button
        onClick={previous}
        className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <FiSkipBack size={20} />
      </button>
      
      <button
        onClick={togglePlay}
        className="p-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-105 transition-transform"
      >
        {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} className="ml-1" />}
      </button>
      
      <button
        onClick={next}
        className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <FiSkipForward size={20} />
      </button>
      
      <button
        onClick={toggleRepeat}
        className={`p-2 rounded-full transition-colors ${repeat !== 'off' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
      >
        <FiRepeat size={18} />
      </button>
    </div>
  );
}
