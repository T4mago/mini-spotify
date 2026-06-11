import { useAudio } from '../../hooks/useAudio';

export function PlayerBar() {
  const { currentSong, isPlaying, pause, resume } = useAudio();
  
  if (!currentSong) {
    return (
      <div className="h-20 bg-[var(--bg-glass)] border-t border-[var(--border-glass)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">No song playing</p>
      </div>
    );
  }
  
  return (
    <div className="h-20 bg-[var(--bg-glass)] border-t border-[var(--border-glass)] flex items-center px-4 gap-4">
      <div className="w-12 h-12 rounded bg-[var(--bg-glass)] flex items-center justify-center">
        {currentSong.coverArt ? (
          <img src={currentSong.coverArt} alt="" className="w-full h-full object-cover rounded" />
        ) : (
          <span className="text-[var(--text-secondary)]">♪</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{currentSong.title}</p>
        <p className="text-sm text-[var(--text-secondary)] truncate">{currentSong.artist}</p>
      </div>
      
      <button 
        onClick={isPlaying ? pause : resume}
        className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center hover:opacity-90"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}
