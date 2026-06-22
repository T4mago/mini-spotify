import { useState } from 'react';
import { useSpotify } from '../../hooks/useSpotify';
import { FiX, FiExternalLink, FiMusic } from 'react-icons/fi';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ImportModal({ isOpen, onClose, onComplete }: ImportModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { importPlaylist, isImporting } = useSpotify();

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!url.trim()) { setError('Please enter a URL'); return; }
    if (!url.match(/playlist\/([a-zA-Z0-9]+)/)) { setError('Invalid Spotify URL'); return; }
    try {
      setError('');
      await importPlaylist(url);
      onComplete();
    } catch (err: any) { setError(err.message || 'Failed'); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade">
      <div className="glass-strong w-[420px] rounded-3xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1db954] flex items-center justify-center"><FiMusic size={16} className="text-white" /></div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Import from Spotify</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all"><FiX size={16} /></button>
        </div>
        <div className="p-6">
          <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Playlist URL</label>
          <input type="text" value={url} onChange={(e) => { setUrl(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-2xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none text-sm transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="https://open.spotify.com/playlist/..." autoFocus />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={onClose} className="glass-interactive px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-secondary)]">Cancel</button>
            <button onClick={handleImport} disabled={isImporting || !url.trim()}
              className="bg-[var(--text-primary)] text-white px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 hover:scale-105 transition-transform shadow-md">
              {isImporting ? <><div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Importing...</> : <><FiExternalLink size={13} /> Import</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
