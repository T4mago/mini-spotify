import { FiMusic, FiList, FiSettings, FiSearch, FiDisc } from 'react-icons/fi';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'library', label: 'Library', icon: FiMusic },
    { id: 'playlists', label: 'Playlists', icon: FiList },
    { id: 'search', label: 'Search', icon: FiSearch },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];
  
  return (
    <div className="w-64 h-full glass-panel m-4 mr-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center">
            <FiDisc className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold">Mini Spotify</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all
              ${activeView === item.id 
                ? 'bg-[var(--accent-color)] text-white' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]'}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
