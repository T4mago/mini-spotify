import { create } from 'zustand';
import { ipc } from '../lib/ipc';
import { Settings } from '../types';

interface ThemeState {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  
  loadTheme: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: 'dark',
  accentColor: '#1db954',
  
  loadTheme: async () => {
    const settings = await ipc.invoke<Settings>('settings:get');
    set({ theme: settings.theme, accentColor: settings.accentColor });
    applyTheme(settings.theme, settings.accentColor);
  },
  
  setTheme: async (theme) => {
    await ipc.invoke('settings:save', { theme });
    set({ theme });
    applyTheme(theme, useTheme.getState().accentColor);
  },
  
  setAccentColor: async (color) => {
    await ipc.invoke('settings:save', { accentColor: color });
    set({ accentColor: color });
    applyTheme(useTheme.getState().theme, color);
  },
}));

function applyTheme(theme: 'dark' | 'light' | 'system', accentColor: string) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
  
  root.style.setProperty('--accent-color', accentColor);
  
  const r = parseInt(accentColor.slice(1, 3), 16);
  const g = parseInt(accentColor.slice(3, 5), 16);
  const b = parseInt(accentColor.slice(5, 7), 16);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.3)`);
}
