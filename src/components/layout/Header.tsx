import { FiChevronLeft, FiChevronRight, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  activeView?: string;
}

export function Header({ activeView: _activeView }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="glass-pill h-12 px-2 flex items-center justify-between animate-fade">
      {/* macOS Traffic Light Controls */}
      <div className="flex items-center gap-2 pl-3 group/traffic">
        {/* Close */}
        <button 
          onClick={() => window.electronAPI.close()}
          className="w-[13px] h-[13px] rounded-full bg-[#ff5f57] flex items-center justify-center transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_6px_rgba(255,95,87,0.5)] active:brightness-90"
          title="Close"
        >
          <svg width="7" height="7" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
            <path d="M1 1l5 5M6 1L1 6" stroke="#4a0002" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        {/* Minimize */}
        <button 
          onClick={() => window.electronAPI.minimize()}
          className="w-[13px] h-[13px] rounded-full bg-[#febc2e] flex items-center justify-center transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_6px_rgba(254,188,46,0.5)] active:brightness-90"
          title="Minimize"
        >
          <svg width="7" height="7" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
            <path d="M1 3.5h5" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        {/* Maximize */}
        <button 
          onClick={() => window.electronAPI.maximize()}
          className="w-[13px] h-[13px] rounded-full bg-[#28c840] flex items-center justify-center transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_6px_rgba(40,200,64,0.5)] active:brightness-90"
          title="Fullscreen"
        >
          <svg width="7" height="7" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
            <path d="M1 5.5L3.5 1 6 5.5" stroke="#006500" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        <div className="w-px h-4 bg-[var(--glass-border)] mx-1" />

        {/* Back/Forward */}
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
          <FiChevronLeft size={16} />
        </button>
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
          <FiChevronRight size={16} />
        </button>
      </div>
      
      {/* Center title */}
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className="font-semibold text-sm text-[var(--text-primary)]">Mini Spotify</span>
      </div>
      
      {/* Theme toggle */}
      <div className="flex items-center pr-3">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all"
        >
          {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>
      </div>
    </div>
  );
}
