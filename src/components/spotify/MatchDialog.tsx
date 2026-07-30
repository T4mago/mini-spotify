import { useState } from 'react';
import { useSpotify } from '../../hooks/useSpotify';
import { SpotifyTrack } from '../../types';
import { FiMusic, FiX } from 'react-icons/fi';

interface MatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  playlistName: string;
  tracks: SpotifyTrack[];
}

export function MatchDialog({ isOpen, onClose, onComplete, playlistName, tracks }: MatchDialogProps) {
  const { createPlaylist } = useSpotify();
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const toggle = (i: number) => {
    setExcluded(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const selectedTracks = tracks.filter((_, i) => !excluded.has(i));
  const formatDuration = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createPlaylist(playlistName, undefined, selectedTracks);
      onComplete();
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="double-bezel w-[660px] max-h-[80vh] rounded-[calc(2rem+2px)] flex flex-col overflow-hidden animate-slide-up">
        <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.03)]">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Import Tracks</h3>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Click to exclude tracks from import</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all"><FiX size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-1.5">
          {tracks.map((track: SpotifyTrack, i: number) => {
            const isExcl = excluded.has(i);
            return (
              <div key={i} onClick={() => toggle(i)}
                className={`flex items-center gap-3 p-3 rounded-[calc(2rem-0.5rem)] cursor-pointer transition-all duration-[400ms] ease-spring
                  ${isExcl ? 'opacity-40 bg-[rgba(255,255,255,0.02)]' : 'bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)]'}`}>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[rgba(0,0,0,0.04)] flex-shrink-0 flex items-center justify-center">
                  {track.album.images[0] ? (
                    <img src={track.album.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : <FiMusic size={14} className="text-[var(--text-tertiary)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{track.name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">{track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">{formatDuration(track.duration_ms)}</span>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.03)] flex justify-between items-center">
          <p className="text-[11px] text-[var(--text-secondary)]"><span className="font-bold text-[var(--text-primary)]">{selectedTracks.length}</span> of {tracks.length} tracks</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[350ms] ease-spring">Cancel</button>
            <button onClick={handleCreate} disabled={selectedTracks.length === 0 || creating}
              className="bg-[var(--accent)] text-black px-5 py-2.5 rounded-full text-xs font-bold disabled:opacity-40 hover:scale-105 transition-all duration-[400ms] ease-spring active:scale-95 flex items-center gap-1.5">
              {creating ? <><div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Creating...</> : `Import (${selectedTracks.length})`}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
