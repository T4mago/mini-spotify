interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'library', icon: LibraryIcon, label: 'Library' },
    { id: 'search', icon: SearchIcon, label: 'Search' },
    { id: 'playlists', icon: PlaylistIcon, label: 'Playlists' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="double-bezel w-[72px] hidden md:flex flex-col items-center py-2 gap-0.5 flex-shrink-0">
      <div className="double-bezel-inner w-full h-full flex flex-col items-center py-2.5 gap-0.5 px-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`group relative w-full py-2 rounded-[calc(2rem-0.5rem)] flex flex-col items-center justify-center gap-1 transition-all duration-[400ms] ease-spring ${
                isActive
                  ? 'bg-[rgba(29,185,84,0.08)] text-[var(--accent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'
              }`}
            >
              <div className="relative">
                <item.icon
                  size={15}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={`transition-all duration-[400ms] ease-spring ${
                    isActive ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                />
              </div>
              <span className={`text-[8px] font-medium leading-none tracking-wider uppercase ${
                isActive ? 'text-[var(--accent)]' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--accent)] shadow-accent-sm" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LibraryIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3h5v18H3z" />
      <path d="M11 3h5v18h-5z" />
      <path d="M19 3h2v18h-2z" />
    </svg>
  );
}

function SearchIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function PlaylistIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h12" />
      <circle cx="19" cy="16" r="3" />
      <path d="M19 13v3" />
    </svg>
  );
}

function SettingsIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
