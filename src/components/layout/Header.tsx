import { useState, useEffect, useCallback } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  activeView?: string;
}

export function Header({ activeView: _activeView }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Library', view: 'library' },
    { label: 'Search', view: 'search' },
    { label: 'Playlists', view: 'playlists' },
    { label: 'Settings', view: 'settings' },
  ];

  return (
    <>
      <div
        className="glass-pill h-10 px-1.5 flex items-center justify-between animate-fade relative z-30 mx-auto w-max min-w-[200px]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {window.electronAPI && (
            <div className="flex items-center gap-1 pl-1.5 group/traffic">
              <button
                onClick={() => window.electronAPI?.close()}
                className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] flex items-center justify-center transition-all duration-200 hover:brightness-110 active:brightness-90"
                title="Close"
              >
                <svg width="4" height="4" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
                  <path d="M1 1l5 5M6 1L1 6" stroke="#4a0002" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => window.electronAPI?.minimize()}
                className="w-2.5 h-2.5 rounded-full bg-[#febc2e] flex items-center justify-center transition-all duration-200 hover:brightness-110 active:brightness-90"
                title="Minimize"
              >
                <svg width="4" height="4" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
                  <path d="M1 3.5h5" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => window.electronAPI?.maximize()}
                className="w-2.5 h-2.5 rounded-full bg-[#28c840] flex items-center justify-center transition-all duration-200 hover:brightness-110 active:brightness-90"
                title="Fullscreen"
              >
                <svg width="4" height="4" viewBox="0 0 7 7" className="opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150">
                  <path d="M1 5.5L3.5 1 6 5.5" stroke="#006500" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>
              <div className="w-px h-3 bg-[rgba(255,255,255,0.06)] mx-1" />
            </div>
          )}

          <button
            onClick={toggleMenu}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all duration-[350ms] ease-spring"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="relative w-3 h-3 flex flex-col items-center justify-center gap-[3px]">
              <span
                className={`block w-3 h-[1.5px] bg-current rounded-full transition-all duration-[400ms] ease-spring origin-center ${
                  isMenuOpen ? 'translate-y-[4.5px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-3 h-[1.5px] bg-current rounded-full transition-all duration-[400ms] ease-spring ${
                  isMenuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block w-3 h-[1.5px] bg-current rounded-full transition-all duration-[400ms] ease-spring origin-center ${
                  isMenuOpen ? '-translate-y-[4.5px] -rotate-45' : ''
                }`}
              />
            </div>
          </button>

          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="font-semibold text-[9px] text-[var(--text-primary)] tracking-widest uppercase">Mini Spotify</span>
        </div>

        <div className="flex items-center gap-1 pr-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] transition-all duration-[350ms] ease-spring"
          >
            {theme === 'dark' ? <FiSun size={11} /> : <FiMoon size={11} />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-all duration-[600ms] ease-spring pointer-events-none ${
          isMenuOpen ? 'pointer-events-auto' : ''
        }`}
      >
        <div
          className={`absolute inset-0 transition-all duration-[600ms] ease-spring ${
            isMenuOpen ? 'bg-black/70' : 'bg-black/0'
          }`}
          style={{ backdropFilter: isMenuOpen ? 'blur(48px)' : 'blur(0px)', WebkitBackdropFilter: isMenuOpen ? 'blur(48px)' : 'blur(0px)' }}
          onClick={() => setIsMenuOpen(false)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            {navLinks.map((link, i) => (
              <button
                key={link.view}
                onClick={() => { setIsMenuOpen(false); }}
                className={`text-[var(--text-primary)] text-2xl font-light tracking-wide transition-all duration-[500ms] ease-spring hover:opacity-60 ${
                  isMenuOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${100 + i * 60}ms` : '0ms',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
