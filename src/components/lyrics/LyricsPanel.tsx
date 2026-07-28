import { useEffect, useRef, useMemo } from 'react';
import { useLyrics, parseLRC } from '../../hooks/useLyrics';
import { useAudio } from '../../hooks/useAudio';
import { FiEdit2, FiX, FiMusic, FiSliders } from 'react-icons/fi';

import { Song } from '../../types';

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEditLyrics: (song: Song) => void;
}

export function LyricsPanel({ isOpen, onClose, onEditLyrics }: LyricsPanelProps) {
  const { currentSong, currentTime, seek } = useAudio();
  const { currentLyrics, loadLyrics, isLoading, syncOffset, setSyncOffset } = useLyrics();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => { 
    if (currentSong && isOpen) loadLyrics(currentSong); 
  }, [currentSong, isOpen, loadLyrics]);
  
  // Clear refs when song/lyrics change
  useEffect(() => {
    lineRefs.current = [];
  }, [currentSong, currentLyrics]);

  const adjustOffset = (amount: number) => {
    setSyncOffset(Math.round((syncOffset + amount) * 10) / 10);
  };

  const lyricsContent = currentLyrics?.content || '';
  
  // Parse synchronized lyrics or fallback to estimated plain lyrics
  const syncedLines = useMemo(() => {
    if (!lyricsContent) return [];
    const isSynced = /\[\d{1,2}:\d{2}[.,:]\d{2,3}\]/.test(lyricsContent);
    if (isSynced) {
      return parseLRC(lyricsContent);
    } else {
      // Estimate timings for plain lyrics
      const plainLines = lyricsContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
        
      if (plainLines.length === 0) return [];
      
      const songDuration = currentSong?.duration || 180;
      // Heuristic: Intro is usually ~12s, Outro is ~15s
      const startOffset = Math.min(15, songDuration * 0.08); // Max 15s or 8% of song duration
      const endOffset = Math.min(20, songDuration * 0.1);    // Max 20s or 10% of song duration
      const activeDuration = Math.max(30, songDuration - startOffset - endOffset);
      const durationPerLine = activeDuration / plainLines.length;
      
      return plainLines.map((text, idx) => ({
        time: startOffset + idx * durationPerLine,
        text
      }));
    }
  }, [lyricsContent, currentSong?.duration]);

  // Find active line index
  const activeLineIndex = useMemo(() => {
    if (syncedLines.length === 0) return -1;
    const adjustedTime = currentTime + syncOffset;
    return syncedLines.findIndex((line, idx) => {
      const nextLine = syncedLines[idx + 1];
      return adjustedTime >= line.time && (!nextLine || adjustedTime < nextLine.time);
    });
  }, [syncedLines, currentTime, syncOffset]);

  // Auto-scroll active line to center of container
  useEffect(() => {
    if (activeLineIndex !== -1 && containerRef.current) {
      const container = containerRef.current;
      const activeElement = lineRefs.current[activeLineIndex];
      if (activeElement) {
        const containerHeight = container.clientHeight;
        const elementTop = activeElement.offsetTop;
        const elementHeight = activeElement.clientHeight;
        
        container.scrollTo({
          top: elementTop - containerHeight / 2 + elementHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLineIndex]);

  if (!isOpen) return null;
  
  return (
    <div className="glass-strong w-72 rounded-3xl flex flex-col m-0 ml-3 animate-slide-left overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <FiMusic size={13} className="text-[var(--accent)]" />
          <h3 className="font-bold text-xs text-[var(--text-primary)]">Lyrics</h3>
        </div>
        <div className="flex gap-1">
          {currentSong && (
            <button onClick={() => onEditLyrics(currentSong)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all">
              <FiEdit2 size={12} />
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all">
            <FiX size={12} />
          </button>
        </div>
      </div>
      
      {/* Scrollable lyrics area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 scroll-smooth select-none"
        style={{ 
          scrollbarWidth: 'none',
          maskImage: 'linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%)'
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[var(--text-secondary)]">Searching lyrics online...</p>
          </div>
        ) : !currentSong ? (
          <div className="flex flex-col items-center justify-center py-8 text-center h-full">
            <FiMusic size={20} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-secondary)]">No song playing</p>
          </div>
        ) : !currentLyrics ? (
          <div className="flex flex-col items-center justify-center py-8 text-center h-full gap-3">
            <div className="text-center">
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">No lyrics found online</p>
              <p className="text-[10px] text-[var(--text-tertiary)] max-w-[180px] mx-auto leading-normal">We couldn't retrieve lyrics automatically. You can add them manually.</p>
            </div>
            <button 
              onClick={() => onEditLyrics(currentSong)} 
              className="bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-black px-4 py-2 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              Add Lyrics
            </button>
          </div>
        ) : syncedLines.length > 0 ? (
          <div className="flex flex-col gap-2.5 py-[50%]">
            {syncedLines.map((line, index) => {
              const isActive = index === activeLineIndex;
              return (
                <p
                  key={index}
                  ref={(el) => { lineRefs.current[index] = el; }}
                  onClick={() => seek(line.time)}
                  title={`Jump to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}`}
                  className={`py-2 px-3 cursor-pointer text-center transition-all duration-300 ease-out ${
                    isActive 
                      ? 'text-[13px] font-bold text-[var(--accent)] scale-105 opacity-100 drop-shadow-[0_2px_8px_rgba(29,185,84,0.25)]' 
                      : 'text-xs text-[var(--lyrics-inactive)] opacity-35 hover:opacity-95 hover:scale-[1.02]'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-center leading-relaxed text-xs text-[var(--lyrics-inactive)] py-4">
            {currentLyrics.content}
          </div>
        )}
      </div>

      {/* Offset Sync Control */}
      {currentLyrics && (
        <div className="flex items-center justify-between px-5 py-2.5 bg-[rgba(0,0,0,0.08)] border-t border-[rgba(255,255,255,0.04)] text-[10px]">
          <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
            <FiSliders size={11} className="text-[var(--accent)]" />
            Sync Offset
          </span>
          <div className="flex items-center gap-2 select-none">
            <button 
              onClick={() => adjustOffset(-0.5)}
              className="w-5 h-5 rounded-full glass-solid flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] active:scale-90 transition-all font-bold text-xs"
              title="Delay lyrics (show later)"
            >
              -
            </button>
            <span className={`font-mono font-bold ${syncOffset === 0 ? 'text-[var(--text-tertiary)]' : 'text-[var(--accent)]'}`}>
              {syncOffset > 0 ? `+${syncOffset.toFixed(1)}` : syncOffset.toFixed(1)}s
            </span>
            <button 
              onClick={() => adjustOffset(0.5)}
              className="w-5 h-5 rounded-full glass-solid flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)] active:scale-90 transition-all font-bold text-xs"
              title="Speed up lyrics (show earlier)"
            >
              +
            </button>
            {syncOffset !== 0 && (
              <button 
                onClick={() => setSyncOffset(0)}
                className="text-[var(--text-tertiary)] hover:text-white ml-1 font-semibold transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
