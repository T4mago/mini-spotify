import { useAudio } from '../../hooks/useAudio';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { FiX, FiList, FiMusic, FiTrash2, FiPlay, FiArrowUp } from 'react-icons/fi';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
  const { currentSong, queue, upNext, removeFromUpNext, clearUpNext, play } = useAudio();
  const { ref: lenisRef } = useLenisScroll();

  const currentIndex = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;
  const defaultQueue = currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue;

  if (!isOpen) return null;

  return (
    <div className="double-bezel w-72 hidden md:flex rounded-[calc(2rem+2px)] flex-col m-0 ml-3 animate-slide-left overflow-hidden">
      <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.03)]">
        <div className="flex items-center gap-2">
          <FiList size={13} className="text-[var(--accent)]" />
          <h3 className="font-bold text-xs text-[var(--text-primary)]">Queue</h3>
        </div>
        <div className="flex gap-1">
          {upNext.length > 0 && (
            <button
              onClick={clearUpNext}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all"
              title="Clear up next"
            >
              <FiTrash2 size={11} />
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all">
            <FiX size={12} />
          </button>
        </div>
      </div>

      <div ref={lenisRef} className="flex-1 scroll-smooth p-3" style={{ scrollbarWidth: 'none' }}>
        {!currentSong && queue.length === 0 && upNext.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiList size={20} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-secondary)]">Queue is empty</p>
            <p className="text-[9px] text-[var(--text-tertiary)] mt-1">Click + on any song to add it</p>
          </div>
        ) : (
          <>
            {/* Now Playing */}
            {currentSong && (
              <div className="mb-3">
                <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest px-2 mb-2">Now Playing</p>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[rgba(29,185,84,0.08)] border border-[var(--accent)]/10">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(0,0,0,0.04)]">
                    {currentSong.coverArt ? (
                      <img src={currentSong.coverArt} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiMusic size={12} className="text-[var(--text-tertiary)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--accent)] truncate">{currentSong.title}</p>
                    <p className="text-[9px] text-[var(--text-secondary)] truncate">{currentSong.artist}</p>
                  </div>
                  <FiPlay size={10} className="text-[var(--accent)] flex-shrink-0" fill="currentColor" />
                </div>
              </div>
            )}

            {/* Up Next (user-added skip songs) */}
            <div className="mb-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1">
                  <FiArrowUp size={9} />
                  Up Next
                </p>
                {upNext.length > 0 && (
                  <span className="text-[9px] text-[var(--accent)] font-semibold">{upNext.length} song{upNext.length !== 1 ? 's' : ''}</span>
                )}
              </div>
              {upNext.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <FiArrowUp size={14} className="text-[var(--text-tertiary)] mb-1 opacity-40" />
                  <p className="text-[9px] text-[var(--text-tertiary)]">No skip songs queued</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {upNext.map((song, i) => (
                    <div
                      key={`upnext-${song.id}-${i}`}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-all duration-[400ms] ease-spring group cursor-pointer"
                      onClick={() => play(song)}
                    >
                      <span className="text-[9px] text-[var(--accent)] w-3 text-center font-bold flex-shrink-0">{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(0,0,0,0.04)]">
                        {song.coverArt ? (
                          <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiMusic size={12} className="text-[var(--text-tertiary)]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{song.title}</p>
                        <p className="text-[9px] text-[var(--text-secondary)] truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromUpNext(i);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.06)] text-[var(--text-tertiary)] hover:text-red-400 transition-all"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Default Queue */}
            {defaultQueue.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest px-2 mb-2">Default Queue</p>
                <div className="space-y-1">
                  {defaultQueue.map((song, i) => {
                    const realIndex = currentIndex + 1 + i;
                    return (
                      <div
                        key={`default-${song.id}-${realIndex}`}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-all duration-[400ms] ease-spring group cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() => play(song)}
                      >
                        <span className="text-[9px] text-[var(--text-tertiary)] w-3 text-center tabular-nums flex-shrink-0">{i + 1}</span>
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(0,0,0,0.04)]">
                          {song.coverArt ? (
                            <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiMusic size={12} className="text-[var(--text-tertiary)]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{song.title}</p>
                          <p className="text-[9px] text-[var(--text-secondary)] truncate">{song.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
