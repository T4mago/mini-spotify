import { useState, useEffect } from 'react';
import { useLyrics } from '../../hooks/useLyrics';
import { FiX, FiSave } from 'react-icons/fi';

import { Song } from '../../types';

interface LyricsEditorProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsEditor({ song, isOpen, onClose }: LyricsEditorProps) {
  const { currentLyrics, loadLyrics, saveLyrics } = useLyrics();
  const [content, setContent] = useState('');
  
  useEffect(() => { if (isOpen) loadLyrics(song); }, [isOpen, song, loadLyrics]);
  useEffect(() => { setContent(currentLyrics?.content || ''); }, [currentLyrics]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="double-bezel w-[560px] h-[460px] rounded-[calc(2rem+2px)] flex flex-col overflow-hidden animate-slide-up">
        <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.03)]">
          <h3 className="font-bold text-sm text-[var(--text-primary)]">Edit Lyrics</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all">
            <FiX size={16} />
          </button>
        </div>
        <div className="flex-1 p-5">
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full h-full px-5 py-4 rounded-2xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-none text-sm transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="Paste your lyrics here..." />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(255,255,255,0.03)]">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[350ms] ease-spring">Cancel</button>
          <button onClick={async () => { await saveLyrics(song.id, content); onClose(); }}
            className="bg-[var(--accent)] text-black px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-all duration-[400ms] ease-spring active:scale-95">
            <FiSave size={12} fill="currentColor" /> Save
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
