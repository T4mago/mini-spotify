import { useMemo } from 'react';
import { Song } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import { useLyrics, parseLRC } from '../../hooks/useLyrics';
import toast from 'react-hot-toast';
import { FiMusic, FiHeart, FiMoreHorizontal, FiPlusCircle } from 'react-icons/fi';

interface SongRowProps {
  song: Song;
  index?: number;
  onPlay?: () => void;
}

const TAGS = ['#Choice', '#Abdomien', '#Desire', '#Inspired', '#Vibes', '#Chill'];

export function SongRow({ song, index, onPlay }: SongRowProps) {
  const { play, currentSong, isPlaying, currentTime } = useAudio();
  const { currentLyrics, syncOffset, setLyricsOpen } = useLyrics();
  const isActive = currentSong?.id === song.id;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Parse synced lyrics or fallback to estimated plain lyrics
  const syncedLines = useMemo(() => {
    if (!isActive || !currentLyrics) return [];
    
    // Prevent showing old song's lyrics during transition
    if (currentLyrics.songId !== song.id) return [];
    
    const lyricsContent = currentLyrics.content;
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
      
      const songDuration = song.duration || 180;
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
  }, [isActive, currentLyrics, song.id, song.duration]);

  // Find active line index for this row
  const activeLine = useMemo(() => {
    if (syncedLines.length === 0) return null;
    const adjustedTime = currentTime + syncOffset;
    const idx = syncedLines.findIndex((line, index) => {
      const nextLine = syncedLines[index + 1];
      return adjustedTime >= line.time && (!nextLine || adjustedTime < nextLine.time);
    });
    return idx !== -1 ? syncedLines[idx] : null;
  }, [syncedLines, currentTime, syncOffset]);
  
  // Deterministic tag based on song id
  const tag = TAGS[song.id.charCodeAt(0) % TAGS.length];
  // Simulated listened count
  const listened = Math.floor((song.id.charCodeAt(1) || 1) * 347 + 1000);
  
  return (
    <div 
      className={`flex items-center gap-3 px-2 py-2.5 rounded-2xl cursor-pointer transition-[background,box-shadow,border-color] duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group will-change-[background]
        ${isActive 
          ? 'glass-strong !border-[var(--accent)]/25 !shadow-[0_4px_24px_rgba(29,185,84,0.12),inset_0_1px_0_rgba(255,255,255,0.4)]' 
          : 'hover:bg-[rgba(255,255,255,0.25)]'}`}
      onClick={() => {
        if (onPlay) onPlay();
        else play(song);
      }}
    >
      {/* Index or playing indicator */}
      <div className="w-10 flex items-center justify-center">
        {isActive && isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5">
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
          </div>
        ) : (
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums group-hover:hidden">{index}</span>
        )}
        {!(isActive && isPlaying) && (
          <FiMusic size={12} className="text-[var(--text-tertiary)] hidden group-hover:block" />
        )}
      </div>
      
      {/* Cover */}
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[rgba(0,0,0,0.04)]">
        {song.coverArt ? (
          <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiMusic size={14} className="text-[var(--text-tertiary)]" />
          </div>
        )}
      </div>
      
      {/* Title & Artist & Lyrics (takes up the flex-1 space) */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        {/* Title & Artist Info */}
        <div className="min-w-0 flex-shrink-0 w-40 sm:w-48 lg:w-56">
          <p className={`text-sm font-semibold truncate transition-colors
            ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
            {song.title}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] truncate">
            {song.artist}
          </p>
        </div>

        {/* Real-time Lyrics in the middle */}
        <div className="flex-1 min-w-0 hidden md:flex items-center">
          {isActive && activeLine && (
            <p 
              key={activeLine.text} 
              onClick={(e) => {
                e.stopPropagation();
                setLyricsOpen(true);
              }}
              title="Click to view full lyrics panel"
              className="text-[11px] font-semibold text-[var(--accent)] select-none truncate animate-slide-up cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-[0.98] max-w-[95%] tracking-wide"
            >
              {activeLine.text}
            </p>
          )}
        </div>
      </div>
      
      {/* Tag */}
      <div className="w-20 hidden md:flex justify-center">
        <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[rgba(0,0,0,0.04)] px-2.5 py-1 rounded-full">
          {tag}
        </span>
      </div>
      
      {/* Listened count */}
      <div className="w-28 hidden lg:flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
          {listened.toLocaleString()} Listened
        </span>
      </div>
      
      {/* Duration */}
      <span className="text-[11px] text-[var(--text-secondary)] w-16 text-right tabular-nums font-medium">
        {formatTime(song.duration)} sec
      </span>
      
      {/* Actions */}
      <div className="w-24 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            useAudio.getState().playNext(song);
            toast.success(`"${song.title}" will play next`, { duration: 1500 });
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
          title="Play next"
        >
          <FiPlusCircle size={14} />
        </button>
        <button 
          onClick={(e) => e.stopPropagation()}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
        >
          <FiHeart size={14} />
        </button>
        <button 
          onClick={(e) => e.stopPropagation()}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
        >
          <FiMoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
