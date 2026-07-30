import { useAudio } from '../../hooks/useAudio';

export function PlaybackControls() {
  const { isPlaying, togglePlay, next, previous, shuffle, repeat, toggleShuffle, toggleRepeat } = useAudio();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleShuffle}
        className={`transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-95 ${
          shuffle ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      </button>

      <button
        onClick={previous}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-90"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M19 20L9 12l10-8v16zM5 19V5h2v14H5z" />
        </svg>
      </button>

      <button
        onClick={togglePlay}
        className="group relative w-9 h-9 rounded-full transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 group-hover:opacity-30 transition-opacity duration-[400ms] ease-spring" />
        <div className="relative w-full h-full rounded-full flex items-center justify-center transition-all duration-[400ms] ease-spring">
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </button>

      <button
        onClick={next}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-90"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M5 4l10 8-10 8V4zM19 5v14h-2V5h2z" />
        </svg>
      </button>

      <button
        onClick={toggleRepeat}
        className={`transition-all duration-[400ms] ease-spring hover:scale-105 active:scale-95 ${
          repeat !== 'off' ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <div className="relative">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 014-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          {repeat === 'one' && (
            <span className="absolute -top-1 -right-1 text-[7px] font-bold text-[var(--accent)]">1</span>
          )}
        </div>
      </button>
    </div>
  );
}
