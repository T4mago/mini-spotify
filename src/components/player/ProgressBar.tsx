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
    <div className="flex items-center gap-3 w-full max-w-lg">
      <span className="text-[11px] font-medium text-[var(--text-secondary)] w-10 text-right tabular-nums font-body">
        {formatTime(currentTime)}
      </span>
      
      <div 
        className="flex-1 h-1.5 progress-track rounded-full"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          seek(percentage * duration);
        }}
      >
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <span className="text-[11px] font-medium text-[var(--text-secondary)] w-10 tabular-nums font-body">
        {formatTime(duration)}
      </span>
    </div>
  );
}
