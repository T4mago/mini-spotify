import { useState, useEffect } from 'react';
import { useLyrics } from '../../hooks/useLyrics';
import { FiX, FiSave } from 'react-icons/fi';

interface LyricsEditorProps {
  songId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsEditor({ songId, isOpen, onClose }: LyricsEditorProps) {
  const { currentLyrics, loadLyrics, saveLyrics } = useLyrics();
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      loadLyrics(songId);
    }
  }, [isOpen, songId, loadLyrics]);
  
  useEffect(() => {
    if (currentLyrics) {
      setContent(currentLyrics.content);
    } else {
      setContent('');
    }
  }, [currentLyrics]);
  
  if (!isOpen) return null;
  
  const handleSave = async () => {
    await saveLyrics(songId, content);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-panel w-[600px] h-[500px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
          <h3 className="text-lg font-bold">Edit Lyrics</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-glass-hover)] rounded">
            <FiX />
          </button>
        </div>
        
        <div className="flex-1 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full px-4 py-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] focus:border-[var(--accent-color)] outline-none resize-none font-mono text-sm"
            placeholder="Paste lyrics here..."
          />
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t border-[var(--border-glass)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <FiSave />
            Save Lyrics
          </button>
        </div>
      </div>
    </div>
  );
}
