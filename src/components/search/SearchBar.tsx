import { useState, useMemo } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { SongRow } from '../library/SongRow';
import { FiSearch } from 'react-icons/fi';

export function SearchBar() {
  const { songs } = useLibrary();
  const [query, setQuery] = useState('');
  
  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.album.toLowerCase().includes(q)
    );
  }, [songs, query]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border-glass)]">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] focus:border-[var(--accent-color)] outline-none"
            placeholder="Search songs, artists, albums..."
            autoFocus
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
            <FiSearch size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Search your library</p>
            <p className="text-sm">Type to search by title, artist, or album</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
            <p className="text-lg">No results found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSongs.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}