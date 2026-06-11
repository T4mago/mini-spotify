import { useAudio } from '../../hooks/useAudio';

export function ProgressBar() {
  const { currentTime, duration, seek } = useAudio();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      <span className="text-xs text-[var(--text-secondary)] w-10 text-right">
        {formatTime(currentTime)}
      </span>
      
      <div 
        className="flex-1 h-1 bg-[var(--bg-glass)] rounded-full cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          seek(percentage * duration);
        }}
      >
        <div 
          className="h-full bg-[var(--text-primary)] rounded-full relative group-hover:bg-[var(--accent-color)] transition-colors"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--text-primary)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <span className="text-xs text-[var(--text-secondary)] w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
}
