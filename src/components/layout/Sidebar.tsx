import { FiHome, FiMusic, FiClock, FiSettings, FiSearch } from 'react-icons/fi';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'library', icon: FiHome, label: 'Library' },
    { id: 'search', icon: FiSearch, label: 'Search' },
    { id: 'playlists', icon: FiMusic, label: 'Playlists' },
    { id: 'history', icon: FiClock, label: 'History' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
  ];
  
  return (
    <div className="glass-strong w-[72px] rounded-3xl flex flex-col items-center py-3 gap-0.5 animate-slide-left">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-14 py-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300
              ${isActive 
                ? 'glass-strong text-[var(--accent)] border-[var(--accent)]/20 shadow-[0_0_12px_rgba(29,185,84,0.12)]' 
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'}`}
          >
            <item.icon size={17} strokeWidth={isActive ? 2.2 : 1.7} />
            <span className={`text-[9px] font-medium leading-none ${isActive ? 'text-[var(--accent)]' : ''}`}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
