import { useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { SongRow } from './SongRow';
import { FiFolder, FiMusic } from 'react-icons/fi';

export function LibraryBrowser() {
  const { songs, isLoading, loadSongs, scanFolder } = useLibrary();
  
  useEffect(() => {
    loadSongs();
  }, [loadSongs]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full w-8 h-8 border-2 border-[var(--accent-color)] border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
        <h2 className="text-xl font-bold">Library</h2>
        <button
          onClick={scanFolder}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:opacity-90 transition-opacity"
        >
          <FiFolder />
          <span>Add Music</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
            <FiMusic size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No music in library</p>
            <p className="text-sm">Click "Add Music" to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
