import { useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { useAudio } from '../../hooks/useAudio';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { SongRow } from './SongRow';
import { FiFolder, FiMusic } from 'react-icons/fi';

function ShimmerRow() {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <div className="w-10 h-4 rounded bg-[rgba(0,0,0,0.06)] animate-pulse" />
      <div className="w-10 h-10 rounded-xl bg-[rgba(0,0,0,0.06)] animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-32 h-3.5 rounded bg-[rgba(0,0,0,0.06)] animate-pulse" />
        <div className="w-20 h-2.5 rounded bg-[rgba(0,0,0,0.04)] animate-pulse" />
      </div>
      <div className="w-12 h-3 rounded bg-[rgba(0,0,0,0.04)] animate-pulse" />
    </div>
  );
}

export function LibraryBrowser() {
  const { songs, isLoading, loadSongs, scanFolder } = useLibrary();
  const { containerRef, refresh } = useScrollReveal();
  
  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  // Re-observe when songs list changes
  useEffect(() => {
    if (songs.length > 0) {
      refresh();
    }
  }, [songs, refresh]);
  
  if (isLoading) {
    return (
      <div className="glass-strong flex-1 rounded-3xl flex flex-col overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-end gap-6">
            <div className="w-40 h-40 rounded-3xl bg-[rgba(0,0,0,0.06)] animate-pulse flex-shrink-0" />
            <div className="flex-1 pb-2 space-y-3">
              <div className="w-16 h-3 rounded bg-[rgba(0,0,0,0.06)] animate-pulse" />
              <div className="w-48 h-10 rounded bg-[rgba(0,0,0,0.06)] animate-pulse" />
              <div className="w-28 h-4 rounded bg-[rgba(0,0,0,0.04)] animate-pulse" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-4 space-y-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerRow key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-strong flex-1 rounded-3xl flex flex-col overflow-hidden animate-fade">
      {/* Artist Header */}
      <div className="relative px-8 pt-8 pb-6">
        <div className="flex items-end gap-6">
          {/* Cover / Avatar */}
          <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[rgba(0,0,0,0.04)] to-[rgba(0,0,0,0.08)] flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
            {songs.length > 0 && songs[0].coverArt ? (
              <img src={songs[0].coverArt} alt="" className="w-full h-full object-cover" />
            ) : (
              <FiMusic size={40} className="text-[var(--text-tertiary)]" />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0 pb-2">
            <p className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase mb-1">Library</p>
            <h1 className="text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
              My Music
            </h1>
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
              <FiMusic size={13} />
              {songs.length} song{songs.length !== 1 ? 's' : ''} Total
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={scanFolder}
                className="glass-interactive px-5 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)]"
              >
                Add Music
              </button>
            {songs.length > 0 && (
                <button 
                  onClick={() => {
                    useAudio.getState().setQueue(songs);
                    useAudio.getState().play(songs[0]);
                  }}
                  className="glass-interactive px-5 py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Play all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Song List */}
      <div ref={containerRef} className="flex-1 scroll-container px-6 pb-4">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(0,0,0,0.04)] flex items-center justify-center mb-4">
              <FiMusic size={28} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">No music yet</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Add your music folder to get started</p>
            <button
              onClick={scanFolder}
              className="glass-interactive px-5 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)]"
            >
              <FiFolder size={13} className="inline mr-1.5" />
              Browse Folders
            </button>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center px-2 py-2 text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest border-b border-[rgba(0,0,0,0.04)] mb-1">
              <span className="w-10">#</span>
              <span className="flex-1">Title</span>
              <span className="w-20 text-center hidden md:block">Tag</span>
              <span className="w-28 text-center hidden lg:block">Listened</span>
              <span className="w-16 text-right">Duration</span>
              <span className="w-24" />
            </div>
            
            {songs.map((song, index) => (
              <div key={song.id} className="scroll-reveal-item content-auto">
                <SongRow 
                  song={song} 
                  index={index + 1} 
                  onPlay={() => useAudio.getState().play(song)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
