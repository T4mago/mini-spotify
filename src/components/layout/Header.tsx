import { FiChevronLeft, FiChevronRight, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  activeView?: string;
}

export function Header({ activeView: _activeView }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="glass-pill h-11 px-1.5 flex items-center justify-between animate-fade" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {window.electronAPI && (
      <div className="flex items-center gap-2 pl-3 group/traffic" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button 
          onClick={() => window.electronAPI?.close()}
          className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center transition-all duration-200 hover:brightness-110 active:brightness-90"
          title="Close"
        >
          <svg width="6" height="6" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
            <path d="M1 1l5 5M6 1L1 6" stroke="#4a0002" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <button 
          onClick={() => window.electronAPI?.minimize()}
          className="w-3 h-3 rounded-full bg-[#febc2e] flex items-center justify-center transition-all duration-200 hover:brightness-110 active:brightness-90"
          title="Minimize"
        >
          <svg width="6" height="6" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
            <path d="M1 3.5h5" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <button 
          onClick={() => window.electronAPI?.maximize()}
          className="w-3 h-3 rounded-full bg-[#28c840] flex items-center justify-center transition-all duration-200 hover:brightness-110 active:brightness-90"
          title="Fullscreen"
        >
          <svg width="6" height="6" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
            <path d="M1 5.5L3.5 1 6 5.5" stroke="#006500" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        <div className="w-px h-3.5 bg-[var(--glass-border)] mx-1.5" />

        <button className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
          <FiChevronLeft size={14} />
        </button>
        <button className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all">
          <FiChevronRight size={14} />
        </button>
      </div>
      )}
      
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className="font-semibold text-xs text-[var(--text-primary)] tracking-wide">Mini Spotify</span>
      </div>
      
      <div className="flex items-center pr-2.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all"
        >
          {theme === 'dark' ? <FiSun size={14} /> : <FiMoon size={14} />}
        </button>
      </div>
    </div>
  );
}
