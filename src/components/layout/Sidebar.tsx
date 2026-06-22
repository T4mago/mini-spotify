import { FiHome, FiMusic, FiClock, FiSettings, FiSearch } from 'react-icons/fi';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'library', icon: FiHome },
    { id: 'search', icon: FiSearch },
    { id: 'playlists', icon: FiMusic },
    { id: 'history', icon: FiClock },
    { id: 'settings', icon: FiSettings },
  ];
  
  return (
    <div className="glass-strong w-16 rounded-3xl flex flex-col items-center py-4 gap-2 animate-slide-left">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isActive 
                ? 'glass-strong text-[var(--accent)] border-[var(--accent)]/30 shadow-[0_0_15px_rgba(29,185,84,0.15)] scale-105' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]'}`}
          >
            <item.icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
          </button>
        );
      })}
    </div>
  );
}
