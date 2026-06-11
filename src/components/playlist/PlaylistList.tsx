import { useEffect, useState } from 'react';
import { usePlaylist } from '../../hooks/usePlaylist';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import { FiPlus, FiMusic } from 'react-icons/fi';

interface PlaylistListProps {
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
}

export function PlaylistList({ selectedPlaylistId, onSelectPlaylist }: PlaylistListProps) {
  const { playlists, loadPlaylists, createPlaylist } = usePlaylist();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);
  
  const handleCreate = async (name: string, description?: string) => {
    const playlist = await createPlaylist(name, description);
    onSelectPlaylist(playlist.id);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
        <h2 className="text-xl font-bold">Playlists</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:opacity-90 transition-opacity"
        >
          <FiPlus />
          <span>New</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
            <FiMusic size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No playlists yet</p>
            <p className="text-sm">Click "New" to create one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`w-full text-left p-4 rounded-lg transition-all
                  ${selectedPlaylistId === playlist.id
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]'}`}
              >
                <p className="font-medium">{playlist.name}</p>
                <p className="text-sm opacity-70">{playlist.songIds.length} songs</p>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
