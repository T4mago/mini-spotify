import { useEffect } from 'react';
import { useLyrics } from '../../hooks/useLyrics';
import { useAudio } from '../../hooks/useAudio';
import { FiEdit2, FiX } from 'react-icons/fi';

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEditLyrics: (songId: string) => void;
}

export function LyricsPanel({ isOpen, onClose, onEditLyrics }: LyricsPanelProps) {
  const { currentSong } = useAudio();
  const { currentLyrics, loadLyrics } = useLyrics();
  
  useEffect(() => {
    if (currentSong && isOpen) {
      loadLyrics(currentSong.id);
    }
  }, [currentSong, isOpen, loadLyrics]);
  
  if (!isOpen) return null;
  
  return (
    <div className="w-80 h-full glass-panel m-4 ml-0 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
        <h3 className="font-bold">Lyrics</h3>
        <div className="flex gap-2">
          {currentSong && (
            <button
              onClick={() => onEditLyrics(currentSong.id)}
              className="p-2 hover:bg-[var(--bg-glass-hover)] rounded"
            >
              <FiEdit2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-glass-hover)] rounded"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {!currentSong ? (
          <p className="text-[var(--text-secondary)] text-center mt-8">
            No song playing
          </p>
        ) : !currentLyrics ? (
          <div className="text-center mt-8">
            <p className="text-[var(--text-secondary)] mb-2">No lyrics available</p>
            <button
              onClick={() => onEditLyrics(currentSong.id)}
              className="text-sm text-[var(--accent-color)] hover:underline"
            >
              Add lyrics
            </button>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-center leading-relaxed">
            {currentLyrics.content}
          </div>
        )}
      </div>
    </div>
  );
}
