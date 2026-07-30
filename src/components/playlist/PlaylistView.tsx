import { usePlaylist } from '../../hooks/usePlaylist';
import { useLibrary } from '../../hooks/useLibrary';
import { useAudio } from '../../hooks/useAudio';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { SongRow } from '../library/SongRow';
import { FiArrowLeft, FiPlay, FiMusic, FiTrash2 } from 'react-icons/fi';

interface PlaylistViewProps {
  playlistId: string;
  onBack: () => void;
}

export function PlaylistView({ playlistId, onBack }: PlaylistViewProps) {
  const { playlists, deletePlaylist, removeSongFromPlaylist } = usePlaylist();
  const { songs } = useLibrary();
  const { setQueue } = useAudio();
  const { ref: lenisRef } = useLenisScroll();
  
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return <div className="glass-strong flex-1 rounded-3xl flex items-center justify-center"><p className="text-[var(--text-secondary)]">Not found</p></div>;
  
  const playlistSongs = playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as typeof songs;
  
  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      setQueue(playlistSongs);
      useAudio.getState().play(playlistSongs[0]);
    }
  };
  
  return (
    <div className="double-bezel flex-1 rounded-[calc(2rem+2px)] flex flex-col overflow-hidden animate-fade">
      <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-5">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-5 transition-all duration-[350ms] ease-spring text-xs font-medium">
          <FiArrowLeft size={14} />
          Back
        </button>
        
        <div className="flex items-end gap-6">
          <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[rgba(0,0,0,0.04)] to-[rgba(0,0,0,0.08)] flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
            {playlist.coverArt ? (
              <img src={playlist.coverArt} alt="" className="w-full h-full object-cover" />
            ) : (
              <FiMusic size={36} className="text-[var(--text-tertiary)]" />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <p className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase mb-1">Playlist</p>
            <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight truncate">{playlist.name}</h1>
            {playlist.description && <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{playlist.description}</p>}
            <p className="text-xs text-[var(--text-secondary)] mt-2">{playlistSongs.length} songs</p>
            <div className="flex gap-3 mt-4">
              <button onClick={handlePlayAll} disabled={playlistSongs.length === 0} className="relative px-5 py-2 rounded-full text-xs font-semibold text-[var(--accent)] bg-[rgba(29,185,84,0.08)] hover:bg-[rgba(29,185,84,0.15)] transition-all duration-[400ms] ease-spring hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40">
                <FiPlay size={12} className="inline mr-1.5" fill="currentColor" />
                Play all
              </button>
              <button onClick={() => { if (window.confirm(`Delete "${playlist.name}"?`)) { deletePlaylist(playlistId); onBack(); } }} className="relative px-3 py-2 rounded-full text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-[rgba(255,0,0,0.08)] transition-all duration-[400ms] ease-spring active:scale-[0.98]">
                <FiTrash2 size={12} className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div ref={lenisRef} className="flex-1 scroll-container px-6 pb-4">
        {playlistSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-[var(--text-secondary)]">This playlist is empty</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {playlistSongs.map((song, i) => (
              <div key={song.id} className="flex items-center group">
                <div className="flex-1">
                  <SongRow 
                    song={song} 
                    index={i + 1} 
                    onPlay={() => {
                      const state = useAudio.getState();
                      state.setQueue(playlistSongs);
                      state.play(song);
                    }}
                  />
                </div>
                <button onClick={() => removeSongFromPlaylist(playlistId, song.id)} className="pr-4 text-[var(--text-tertiary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
