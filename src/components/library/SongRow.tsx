import { useMemo } from 'react';
import { Song } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import { useLyrics, parseLRC } from '../../hooks/useLyrics';
import toast from 'react-hot-toast';

interface SongRowProps {
  song: Song;
  index?: number;
  onPlay?: () => void;
}

const TAGS = ['#Choice', '#Abdomien', '#Desire', '#Inspired', '#Vibes', '#Chill'];

function ActiveLyricsLine({ song, onClick }: { song: Song; onClick: () => void }) {
  const currentTime = useAudio(s => s.currentTime);
  const currentLyrics = useLyrics(s => s.currentLyrics);
  const syncOffset = useLyrics(s => s.syncOffset);

  const syncedLines = useMemo(() => {
    if (!currentLyrics || currentLyrics.songId !== song.id) return [];
    const lyricsContent = currentLyrics.content;
    const isSynced = /\[\d{1,2}:\d{2}[.,:]\d{2,3}\]/.test(lyricsContent);
    if (isSynced) {
      return parseLRC(lyricsContent);
    }
    const plainLines = lyricsContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (plainLines.length === 0) return [];
    const songDuration = song.duration || 180;
    const startOffset = Math.min(15, songDuration * 0.08);
    const endOffset = Math.min(20, songDuration * 0.1);
    const activeDuration = Math.max(30, songDuration - startOffset - endOffset);
    const durationPerLine = activeDuration / plainLines.length;
    return plainLines.map((text, idx) => ({
      time: startOffset + idx * durationPerLine,
      text
    }));
  }, [currentLyrics, song.id, song.duration]);

  const activeLine = useMemo(() => {
    if (syncedLines.length === 0) return null;
    const adjustedTime = currentTime + syncOffset;
    const idx = syncedLines.findIndex((line, index) => {
      const nextLine = syncedLines[index + 1];
      return adjustedTime >= line.time && (!nextLine || adjustedTime < nextLine.time);
    });
    return idx !== -1 ? syncedLines[idx] : null;
  }, [syncedLines, currentTime, syncOffset]);

  if (!activeLine) return <div className="flex-1 min-w-0 hidden md:flex items-center" />;

  return (
    <div className="flex-1 min-w-0 hidden md:flex items-center">
      <p
        key={activeLine.text}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title="Click to view full lyrics panel"
        className="text-[11px] font-semibold text-[var(--accent)] select-none truncate cursor-pointer transition-all duration-[400ms] ease-spring hover:opacity-80 active:scale-[0.98] max-w-[95%] tracking-wide"
      >
        {activeLine.text}
      </p>
    </div>
  );
}

export function SongRow({ song, index, onPlay }: SongRowProps) {
  const play = useAudio(s => s.play);
  const currentSong = useAudio(s => s.currentSong);
  const isPlaying = useAudio(s => s.isPlaying);
  const setLyricsOpen = useLyrics(s => s.setLyricsOpen);
  const isActive = currentSong?.id === song.id;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tag = TAGS[song.id.charCodeAt(0) % TAGS.length];
  const listened = Math.floor((song.id.charCodeAt(1) || 1) * 347 + 1000);

  return (
    <div
      className={`flex items-center gap-3 px-2 py-2.5 rounded-[calc(2rem-0.5rem)] cursor-pointer transition-all duration-[400ms] ease-spring group will-change-transform ${
        isActive
          ? 'bg-[rgba(29,185,84,0.06)] ring-1 ring-[rgba(29,185,84,0.15)]'
          : 'hover:bg-[rgba(255,255,255,0.03)]'
      }`}
      onClick={() => {
        if (onPlay) onPlay();
        else play(song);
      }}
    >
      <div className="w-10 flex items-center justify-center flex-shrink-0">
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)] hidden group-hover:block">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </div>

      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[rgba(255,255,255,0.03)] ring-1 ring-white/5">
        {song.coverArt ? (
          <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center md:gap-4 gap-2">
        <div className="min-w-0 flex-1 md:flex-shrink-0 md:w-40 lg:w-48 xl:w-56">
          <p className={`text-sm font-semibold truncate transition-colors duration-[400ms] ease-spring
            ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
            {song.title}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] truncate">
            {song.artist}
          </p>
        </div>

        {isActive && <ActiveLyricsLine song={song} onClick={() => setLyricsOpen(true)} />}
        {!isActive && <div className="flex-1 min-w-0 hidden md:flex items-center" />}
      </div>

      <div className="w-20 hidden md:flex justify-center">
        <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 rounded-full">
          {tag}
        </span>
      </div>

      <div className="w-28 hidden lg:flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-50" />
        <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
          {listened.toLocaleString()} Listened
        </span>
      </div>

      <span className="text-[10px] md:text-[11px] text-[var(--text-secondary)] w-12 md:w-16 text-right tabular-nums font-medium">
        {formatTime(song.duration)} sec
      </span>

      <div className="flex items-center justify-end pr-1 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            useAudio.getState().playNext(song);
            toast.success(`"${song.title}" will play next`, { duration: 1500 });
          }}
          className="md:opacity-0 md:group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[rgba(255,255,255,0.03)] transition-all duration-[400ms] ease-spring"
          title="Play next"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
