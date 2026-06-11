import { usePlaylist } from '../../hooks/usePlaylist';
import { useLibrary } from '../../hooks/useLibrary';
import { useAudio } from '../../hooks/useAudio';
import { SongRow } from '../library/SongRow';
import { FiArrowLeft, FiPlay } from 'react-icons/fi';

interface PlaylistViewProps {
  playlistId: string;
  onBack: () => void;
}

export function PlaylistView({ playlistId, onBack }: PlaylistViewProps) {
  const { playlists, removeSongFromPlaylist } = usePlaylist();
  const { songs } = useLibrary();
  const { setQueue } = useAudio();
  
  const playlist = playlists.find(p => p.id === playlistId);
  
  if (!playlist) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Playlist not found</p>
      </div>
    );
  }
  
  const playlistSongs = playlist.songIds
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean) as typeof songs;
  
  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      setQueue(playlistSongs);
      useAudio.getState().play(playlistSongs[0]);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-glass)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
        >
          <FiArrowLeft />
          <span>Back to Playlists</span>
        </button>
        
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 rounded-lg bg-[var(--bg-glass)] flex items-center justify-center">
            {playlist.coverArt ? (
              <img src={playlist.coverArt} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-6xl opacity-30">♫</span>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm uppercase font-medium">Playlist</p>
            <h1 className="text-5xl font-bold mt-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-[var(--text-secondary)] mt-2">{playlist.description}</p>
            )}
            <p className="text-sm text-[var(--text-secondary)] mt-4">
              {playlistSongs.length} songs
            </p>
          </div>
        </div>
        
        <button
          onClick={handlePlayAll}
          disabled={playlistSongs.length === 0}
          className="mt-6 px-8 py-3 rounded-full bg-[var(--accent-color)] text-white font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <FiPlay className="inline mr-2" />
          Play All
        </button>
      </div>
      
      {/* Song List */}
      <div className="flex-1 overflow-y-auto p-4">
        {playlistSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
            <p>This playlist is empty</p>
            <p className="text-sm">Add songs from the library</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlistSongs.map((song, index) => (
              <div key={song.id} className="flex items-center gap-4">
                <span className="w-8 text-center text-[var(--text-secondary)]">{index + 1}</span>
                <div className="flex-1">
                  <SongRow song={song} />
                </div>
                <button
                  onClick={() => removeSongFromPlaylist(playlistId, song.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
