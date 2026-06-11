import { useAudio } from '../../hooks/useAudio';
import { FiVolume, FiVolume1, FiVolume2, FiVolumeX } from 'react-icons/fi';

export function VolumeControl() {
  const { volume, setVolume } = useAudio();
  
  const VolumeIcon = volume === 0 ? FiVolumeX : volume < 33 ? FiVolume : volume < 66 ? FiVolume1 : FiVolume2;
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setVolume(volume === 0 ? 80 : 0)}
        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <VolumeIcon size={20} />
      </button>
      
      <div 
        className="w-24 h-1 bg-[var(--bg-glass)] rounded-full cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          setVolume(Math.round(percentage));
        }}
      >
        <div 
          className="h-full bg-[var(--text-primary)] rounded-full relative group-hover:bg-[var(--accent-color)] transition-colors"
          style={{ width: `${volume}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--text-primary)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
