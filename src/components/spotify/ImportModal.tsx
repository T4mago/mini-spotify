import { useState } from 'react';
import { useSpotify } from '../../hooks/useSpotify';
import { FiX, FiExternalLink } from 'react-icons/fi';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ImportModal({ isOpen, onClose, onComplete }: ImportModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { importPlaylist, matchTracks, isImporting } = useSpotify();

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please enter a Spotify playlist URL');
      return;
    }

    const playlistIdMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!playlistIdMatch) {
      setError('Invalid Spotify playlist URL');
      return;
    }

    try {
      setError('');
      const { tracks } = await importPlaylist(url);
      await matchTracks(tracks);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to import playlist');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-panel w-96 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Import from Spotify</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-glass-hover)] rounded">
            <FiX />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Paste a Spotify playlist URL to import its metadata
          </p>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] focus:border-[var(--accent-color)] outline-none"
            placeholder="https://open.spotify.com/playlist/..."
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !url.trim()}
            className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <FiExternalLink />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
