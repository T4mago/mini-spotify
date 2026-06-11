import { Song } from '../../types';
import { useAudio } from '../../hooks/useAudio';
import { FiMusic } from 'react-icons/fi';

interface SongRowProps {
  song: Song;
  onRemove?: (id: string) => void;
}

export function SongRow({ song, onRemove }: SongRowProps) {
  const { play, currentSong, isPlaying } = useAudio();
  const isActive = currentSong?.id === song.id;
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div 
      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all
        ${isActive ? 'bg-[var(--accent-glow)]' : 'hover:bg-[var(--bg-glass-hover)]'}`}
      onClick={() => play(song)}
    >
      <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--bg-glass)]">
        {song.coverArt ? (
          <img src={song.coverArt} alt="" className="w-full h-full object-cover rounded" />
        ) : (
          <FiMusic className="text-[var(--text-secondary)]" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isActive ? 'text-[var(--accent-color)]' : ''}`}>
          {song.title}
        </p>
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {song.artist} • {song.album}
        </p>
      </div>
      
      <span className="text-sm text-[var(--text-secondary)]">
        {formatDuration(song.duration)}
      </span>
      
      {isActive && isPlaying && (
        <div className="flex gap-1">
          <div className="w-1 h-4 bg-[var(--accent-color)] animate-pulse" />
          <div className="w-1 h-4 bg-[var(--accent-color)] animate-pulse delay-75" />
          <div className="w-1 h-4 bg-[var(--accent-color)] animate-pulse delay-150" />
        </div>
      )}
      
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(song.id); }}
          className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500"
        >
          ×
        </button>
      )}
    </div>
  );
}
