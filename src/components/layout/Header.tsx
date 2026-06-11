import { FiMinus, FiSquare, FiX } from 'react-icons/fi';

export function Header() {
  return (
    <div className="h-12 flex items-center justify-between px-4 bg-[var(--bg-secondary)] backdrop-blur-lg border-b border-[var(--border-glass)]">
      {/* App Title */}
      <div className="flex items-center gap-2">
        <span className="font-semibold">Mini Spotify</span>
      </div>
      
      {/* Window Controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => window.electronAPI.minimize()}
          className="p-2 hover:bg-[var(--bg-glass-hover)] rounded transition-colors"
        >
          <FiMinus size={14} />
        </button>
        <button 
          onClick={() => window.electronAPI.maximize()}
          className="p-2 hover:bg-[var(--bg-glass-hover)] rounded transition-colors"
        >
          <FiSquare size={12} />
        </button>
        <button 
          onClick={() => window.electronAPI.close()}
          className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  );
}
