import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { FiCheck } from 'react-icons/fi';

const PRESET_COLORS = [
  '#1db954',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
];

export function SettingsPanel() {
  const { theme, accentColor, loadTheme, setTheme, setAccentColor } = useTheme();
  const [customColor, setCustomColor] = useState(accentColor);
  
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);
  
  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="flex gap-4">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-6 py-3 rounded-lg border transition-all capitalize
                ${theme === t 
                  ? 'border-[var(--accent-color)] bg-[var(--accent-glow)]' 
                  : 'border-[var(--border-glass)] hover:border-[var(--text-secondary)]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
        <div className="flex gap-4 mb-4">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`w-10 h-10 rounded-full relative transition-transform hover:scale-110
                ${accentColor === color ? 'ring-2 ring-offset-2 ring-[var(--text-primary)]' : ''}`}
              style={{ backgroundColor: color }}
            >
              {accentColor === color && (
                <FiCheck className="absolute inset-0 m-auto text-white" size={16} />
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm text-[var(--text-secondary)]">Custom:</label>
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <button
            onClick={() => setAccentColor(customColor)}
            className="px-4 py-2 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)] transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div className="p-4 rounded-lg bg-[var(--bg-glass)]">
          <p className="font-medium">Mini Spotify</p>
          <p className="text-sm text-[var(--text-secondary)]">Version 1.0.0</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            A lightweight music player with Spotify playlist import
          </p>
        </div>
      </div>
    </div>
  );
}
