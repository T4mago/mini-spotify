import { useAudio } from '../../hooks/useAudio';

export function VolumeControl() {
  const { volume, setVolume } = useAudio();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setVolume(volume === 0 ? 80 : 0)}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-[400ms] ease-spring"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {volume === 0 ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : volume < 33 ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </>
          ) : volume < 66 ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
            </>
          ) : (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
            </>
          )}
        </svg>
      </button>

      <div
        className="w-16 h-[2px] progress-track group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setVolume(Math.round(pct * 100));
        }}
      >
        <div className="progress-fill" style={{ width: `${volume}%`, background: 'var(--text-primary)' }} />
      </div>
    </div>
  );
}
