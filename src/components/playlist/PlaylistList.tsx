import { useEffect, useState } from 'react';
import { usePlaylist } from '../../hooks/usePlaylist';
import { useSpotify } from '../../hooks/useSpotify';
import { useLibrary } from '../../hooks/useLibrary';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import { ImportModal } from '../spotify/ImportModal';
import { MatchDialog } from '../spotify/MatchDialog';
import { SpotifyTrack } from '../../types';
import { FiPlus, FiMusic, FiDownload } from 'react-icons/fi';

interface PlaylistListProps {
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
}

export function PlaylistList({ selectedPlaylistId, onSelectPlaylist }: PlaylistListProps) {
  const { playlists, loadPlaylists, createPlaylist } = usePlaylist();
  const { checkConnection } = useSpotify();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [importedTracks, setImportedTracks] = useState<SpotifyTrack[]>([]);
  const [importedPlaylistName, setImportedPlaylistName] = useState('');
  const { ref: lenisRef } = useLenisScroll();
  
  useEffect(() => { loadPlaylists(); checkConnection(); }, [loadPlaylists, checkConnection]);
  
  const handleCreate = async (name: string, description?: string) => {
    const playlist = await createPlaylist(name, description);
    onSelectPlaylist(playlist.id);
  };

  const handleImportComplete = () => {
    const spotifyState = useSpotify.getState();
    setIsImportModalOpen(false);
    setImportedTracks(spotifyState.matchedTracks.map(m => m.spotifyTrack));
    setImportedPlaylistName(spotifyState.playlistName);
    setIsMatchDialogOpen(true);
  };

  const handleMatchComplete = () => {
    setIsMatchDialogOpen(false);
    loadPlaylists();
    useLibrary.getState().loadSongs();
  };
  
  return (
    <div className="double-bezel flex-1 rounded-[calc(2rem+2px)] flex flex-col overflow-hidden animate-fade">
      <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Playlists</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {playlists.length > 0 ? `${playlists.length} playlist${playlists.length !== 1 ? 's' : ''}` : 'Create your first playlist'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiDownload size={14} />
            Import
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
          >
            <FiPlus size={14} />
            New
          </button>
        </div>
      </div>
      
      <div ref={lenisRef} className="flex-1 scroll-container px-6 pb-4">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl glass-solid flex items-center justify-center mb-4">
              <FiMusic size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">No playlists yet</p>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Create a playlist to organize your music</p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="relative px-5 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiDownload size={13} className="inline mr-1.5" />
                Import from Spotify
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="relative px-5 py-2 rounded-full text-xs font-semibold text-[var(--text-primary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiPlus size={13} className="inline mr-1.5" />
                Create Playlist
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {playlists.map((playlist, i) => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className={`relative p-5 text-left rounded-[2rem] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] ring-1 ring-white/5 transition-all duration-[400ms] ease-spring animate-fade stagger-${Math.min(i + 1, 6)}
                  ${selectedPlaylistId === playlist.id ? 'ring-2 ring-[var(--accent)]' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgba(0,0,0,0.04)] to-[rgba(0,0,0,0.08)] flex items-center justify-center mb-3">
                  <FiMusic size={18} className="text-[var(--text-tertiary)]" />
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{playlist.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {playlist.songIds.length} song{playlist.songIds.length !== 1 ? 's' : ''}
                </p>
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

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onComplete={handleImportComplete}
      />

      <MatchDialog
        isOpen={isMatchDialogOpen}
        onClose={() => setIsMatchDialogOpen(false)}
        onComplete={handleMatchComplete}
        playlistName={importedPlaylistName}
        tracks={importedTracks}
      />
      </div>
    </div>
  );
}
