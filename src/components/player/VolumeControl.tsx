import { useAudio } from '../../hooks/useAudio';
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi';

export function VolumeControl() {
  const { volume, setVolume } = useAudio();
  
  const VolumeIcon = volume === 0 ? FiVolumeX : volume < 33 ? FiVolume : volume < 66 ? FiVolume1 : FiVolume2;
  
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setVolume(volume === 0 ? 80 : 0)}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <VolumeIcon size={14} />
      </button>
      
      <div 
        className="w-20 h-1 bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.12)] rounded-full cursor-pointer relative group transition-all hover:h-1.5"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setVolume(Math.round(pct * 100));
        }}
      >
        <div 
          className="h-full bg-[var(--accent)] rounded-full relative"
          style={{ width: `${volume}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-[var(--accent)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
        </div>
      </div>
    </div>
  );
}
