import { useEffect, useCallback } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { useAudio } from '../../hooks/useAudio';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { SongRow } from './SongRow';
import { FiFolder, FiMusic } from 'react-icons/fi';

function ShimmerRow() {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <div className="w-10 h-4 rounded bg-[rgba(255,255,255,0.03)] animate-pulse" />
      <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-32 h-3.5 rounded bg-[rgba(255,255,255,0.03)] animate-pulse" />
        <div className="w-20 h-2.5 rounded bg-[rgba(255,255,255,0.02)] animate-pulse" />
      </div>
      <div className="w-12 h-3 rounded bg-[rgba(255,255,255,0.02)] animate-pulse" />
    </div>
  );
}

export function LibraryBrowser() {
  const { songs, isLoading, loadSongs, scanFolder } = useLibrary();
  const { containerRef: scrollRef, refresh } = useScrollReveal();
  const { ref: lenisRef } = useLenisScroll();

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (lenisRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  useEffect(() => {
    if (songs.length > 0) {
      refresh();
    }
  }, [songs, refresh]);

  if (isLoading) {
    return (
      <div className="double-bezel flex-1 rounded-[calc(2rem+2px)] flex flex-col overflow-hidden">
        <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
          <div className="md:px-8 px-4 md:pt-8 pt-5 md:pb-6 pb-3">
            <div className="flex items-center md:items-end gap-3 md:gap-6">
              <div className="w-16 h-16 md:w-40 md:h-40 rounded-[2rem] bg-[rgba(255,255,255,0.03)] animate-pulse flex-shrink-0" />
              <div className="flex-1 md:pb-2 space-y-2 md:space-y-3">
                <div className="w-12 md:w-16 h-2 md:h-3 rounded bg-[rgba(255,255,255,0.03)] animate-pulse" />
                <div className="w-32 md:w-48 h-6 md:h-10 rounded bg-[rgba(255,255,255,0.03)] animate-pulse" />
                <div className="w-20 md:w-28 h-3 md:h-4 rounded bg-[rgba(255,255,255,0.02)] animate-pulse" />
              </div>
            </div>
          </div>
          <div className="md:px-6 px-3 pb-4 space-y-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ShimmerRow key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="double-bezel flex-1 rounded-[calc(2rem+2px)] flex flex-col overflow-hidden animate-fade">
      <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
        <div className="md:px-8 px-4 md:pt-8 pt-5 md:pb-6 pb-3">
          <div className="flex items-center md:items-end gap-3 md:gap-6">
            <div className="w-16 h-16 md:w-40 md:h-40 rounded-[2rem] bg-[rgba(255,255,255,0.03)] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg ring-1 ring-white/5">
              {songs.length > 0 && songs[0].coverArt ? (
                <img src={songs[0].coverArt} alt="" className="w-full h-full object-cover" />
              ) : (
                <FiMusic size={36} className="text-[var(--text-tertiary)]" />
              )}
            </div>

            <div className="flex-1 min-w-0 md:pb-2">
              <p className="text-[8px] md:text-[10px] font-semibold text-[var(--text-tertiary)] tracking-[0.2em] uppercase md:mb-1">Library</p>
              <h1 className="text-2xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight md:mb-2 leading-none">
                My Music
              </h1>
              <p className="text-[11px] md:text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                <FiMusic size={10} className="md:hidden" />
                <FiMusic size={12} className="hidden md:block" />
                {songs.length} song{songs.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2 md:gap-3 mt-3 md:mt-5">
                <button
                  onClick={scanFolder}
                  className="relative px-5 py-2.5 rounded-full text-[10px] font-semibold text-[var(--text-primary)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add Music
                </button>
                {songs.length > 0 && (
                  <button
                    onClick={() => {
                      useAudio.getState().setQueue(songs);
                      useAudio.getState().play(songs[0]);
                    }}
                    className="relative px-5 py-2.5 rounded-full text-[10px] font-semibold text-[var(--accent)] bg-[rgba(29,185,84,0.08)] hover:bg-[rgba(29,185,84,0.15)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Play all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 scroll-container md:px-6 px-3 pb-4">
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-16">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[2rem] bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-3 md:mb-4">
                <FiMusic size={20} className="md:hidden text-[var(--text-tertiary)]" />
                <FiMusic size={24} className="hidden md:block text-[var(--text-tertiary)]" />
              </div>
              <p className="text-xs md:text-sm font-semibold text-[var(--text-primary)] mb-0.5 md:mb-1">No music yet</p>
              <p className="text-[10px] md:text-xs text-[var(--text-secondary)] mb-3 md:mb-4">Add your music folder to get started</p>
              <button
                onClick={scanFolder}
                className="relative md:px-5 px-3 md:py-2.5 py-2 rounded-full text-[9px] md:text-[10px] font-semibold text-[var(--text-primary)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiFolder size={10} className="md:hidden inline mr-1" />
                <FiFolder size={12} className="hidden md:inline mr-1.5" />
                Browse Folders
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center md:px-2 px-1 py-2 text-[8px] md:text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] border-b border-[rgba(255,255,255,0.03)] mb-1">
                <span className="w-10">#</span>
                <span className="flex-1">Title</span>
                <span className="w-20 text-center hidden md:block">Tag</span>
                <span className="w-28 text-center hidden lg:block">Listened</span>
                <span className="w-14 md:w-16 text-right flex-shrink-0">Duration</span>
              </div>

              {songs.map((song, index) => (
                <div key={song.id} className="scroll-reveal-item content-auto">
                  <SongRow
                    song={song}
                    index={index + 1}
                    onPlay={() => {
                      const state = useAudio.getState();
                      state.setQueue(songs);
                      state.play(song);
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
