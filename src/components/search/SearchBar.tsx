import { useState, useMemo, useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { useAudio } from '../../hooks/useAudio';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { SongRow } from '../library/SongRow';
import { FiSearch, FiX } from 'react-icons/fi';

export function SearchBar() {
  const { songs, loadSongs } = useLibrary();
  const [query, setQuery] = useState('');
  const { containerRef, refresh } = useScrollReveal();
  
  useEffect(() => {
    if (songs.length === 0) loadSongs();
  }, [songs.length, loadSongs]);
  
  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return songs.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    );
  }, [songs, query]);

  // Re-observe when results change
  useEffect(() => {
    if (filteredSongs.length > 0) {
      refresh();
    }
  }, [filteredSongs, refresh]);
  
  return (
    <div className="glass-strong flex-1 rounded-3xl flex flex-col overflow-hidden animate-fade">
      <div className="px-6 pt-6 pb-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none text-sm transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="Search songs, artists, albums..."
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <FiX size={14} />
            </button>
          )}
        </div>
        {query && (
          <p className="text-[10px] text-[var(--text-tertiary)] mt-2 ml-1">
            {filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div ref={containerRef} className="flex-1 scroll-container px-6 pb-4">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl glass-solid flex items-center justify-center mb-4">
              <FiSearch size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Search your library</p>
            <p className="text-xs text-[var(--text-secondary)]">Type to find songs, artists, or albums</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">No results</p>
            <p className="text-xs text-[var(--text-secondary)]">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredSongs.map((song, i) => (
              <div key={song.id} className="scroll-reveal-item content-auto">
                <SongRow 
                  song={song} 
                  index={i + 1} 
                  onPlay={() => {
                    const state = useAudio.getState();
                    state.setQueue(filteredSongs);
                    state.play(song);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
