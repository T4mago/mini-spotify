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

let mediaQuery: MediaQueryList | null = null;
let themeChangeCallback: (() => void) | null = null;

export const useTheme = create<ThemeState>((set) => ({
  theme: 'dark',
  accentColor: '#1db954',
  
  loadTheme: async () => {
    const settings = await ipc.invoke<Settings>('settings:get');
    set({ theme: settings.theme, accentColor: settings.accentColor });
    applyTheme(settings.theme, settings.accentColor);
    
    if (themeChangeCallback) {
      mediaQuery?.removeEventListener('change', themeChangeCallback);
    }
    
    if (settings.theme === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      themeChangeCallback = () => {
        const currentTheme = useTheme.getState().theme;
        if (currentTheme === 'system') {
          applyTheme('system', useTheme.getState().accentColor);
        }
      };
      mediaQuery.addEventListener('change', themeChangeCallback);
    }
  },
  
  setTheme: async (theme) => {
    await ipc.invoke('settings:save', { theme });
    set({ theme });
    applyTheme(theme, useTheme.getState().accentColor);
    
    if (themeChangeCallback) {
      mediaQuery?.removeEventListener('change', themeChangeCallback);
      themeChangeCallback = null;
    }
    
    if (theme === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      themeChangeCallback = () => {
        const currentTheme = useTheme.getState().theme;
        if (currentTheme === 'system') {
          applyTheme('system', useTheme.getState().accentColor);
        }
      };
      mediaQuery.addEventListener('change', themeChangeCallback);
    }
  },
  
  setAccentColor: async (color) => {
    await ipc.invoke('settings:save', { accentColor: color });
    set({ accentColor: color });
    applyTheme(useTheme.getState().theme, color);
  },
}));

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateBackgroundPalette(accent: string) {
  const [h, s, l] = hexToHsl(accent);
  
  const deep = hslToHex(h, Math.min(s + 10, 90), Math.max(l - 25, 15));
  const mid = hslToHex((h + 30) % 360, Math.min(s + 5, 85), Math.min(l + 10, 75));
  const light = hslToHex((h + 60) % 360, Math.min(s, 70), Math.min(l + 25, 85));
  const glow = hslToHex(h, Math.min(s + 15, 95), Math.min(l + 5, 70));
  const soft = hslToHex((h + 180) % 360, Math.min(s - 20, 50), Math.min(l + 30, 88));
  
  return { deep, mid, light, glow, soft };
}

function applyTheme(theme: 'dark' | 'light' | 'system', accentColor: string) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
  
  root.style.setProperty('--accent', accentColor);
  
  const r = parseInt(accentColor.slice(1, 3), 16);
  const g = parseInt(accentColor.slice(3, 5), 16);
  const b = parseInt(accentColor.slice(5, 7), 16);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.3)`);
  
  const isDark = root.getAttribute('data-theme') === 'dark';
  const pal = generateBackgroundPalette(accentColor);
  
  if (isDark) {
    root.style.setProperty('--bg-gradient', 
      `linear-gradient(135deg, ${pal.deep} 0%, ${pal.mid} 35%, ${pal.glow} 65%, ${pal.deep} 100%)`);
    root.style.setProperty('--bg-tint', `rgba(${r}, ${g}, ${b}, 0.08)`);
  } else {
    root.style.setProperty('--bg-gradient', 
      `linear-gradient(135deg, ${pal.soft} 0%, ${pal.light} 30%, ${pal.mid} 60%, ${pal.glow} 100%)`);
    root.style.setProperty('--bg-tint', `rgba(${r}, ${g}, ${b}, 0.06)`);
  }
}
