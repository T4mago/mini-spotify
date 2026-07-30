import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useSpotify } from '../../hooks/useSpotify';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { FiCheck, FiSun, FiMoon, FiMonitor, FiMusic, FiExternalLink, FiX } from 'react-icons/fi';

const PRESET_COLORS = ['#1db954', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];
const themeIcons = { dark: FiMoon, light: FiSun, system: FiMonitor };

export function SettingsPanel() {
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();
  const { isConnected, checkConnection, login, setCredentials, disconnect } = useSpotify();
  const { ref: lenisRef } = useLenisScroll();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { checkConnection(); }, [checkConnection]);

  const handleSaveCredentials = async () => {
    if (!clientId.trim() || !clientSecret.trim()) return;
    await setCredentials(clientId.trim(), clientSecret.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleConnect = async () => {
    await login();
  };
  
  return (
    <div className="double-bezel flex-1 rounded-[calc(2rem+2px)] overflow-hidden animate-fade flex flex-col">
      <div className="double-bezel-inner flex-1 flex flex-col overflow-hidden">
      <div className="md:px-8 px-4 md:pt-8 pt-5 md:pb-6 pb-3 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Settings</h2>
        <p className="text-[10px] md:text-xs text-[var(--text-secondary)] mt-0.5 md:mt-1">Customize your experience</p>
      </div>
      
      <div ref={lenisRef} className="md:px-8 px-4 md:pb-8 pb-4 space-y-3 md:space-y-5 scroll-container flex-1 min-h-0">
        {/* Theme */}
        <div className="bg-[rgba(255,255,255,0.02)] md:p-5 p-4 rounded-[2rem] ring-1 ring-white/5">
          <h3 className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] mb-3 md:mb-4 uppercase tracking-[0.2em]">Appearance</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['dark', 'light', 'system'] as const).map((t) => {
              const Icon = themeIcons[t];
              return (
                <button key={t} onClick={() => setTheme(t)}
                  className={`glass-interactive flex flex-col items-center gap-2 py-4 rounded-2xl
                    ${theme === t ? 'ring-2 ring-[var(--accent)] bg-[var(--accent-soft)]' : ''}`}>
                  <Icon size={18} className={theme === t ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'} />
                  <span className={`text-xs font-semibold capitalize ${theme === t ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{t}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Colors */}
        <div className="bg-[rgba(255,255,255,0.02)] md:p-5 p-4 rounded-[2rem] ring-1 ring-white/5">
          <h3 className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] mb-3 md:mb-4 uppercase tracking-[0.2em]">Accent Color</h3>
          <div className="flex gap-3 mb-4 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button key={color} onClick={() => setAccentColor(color)}
                className={`w-9 h-9 rounded-xl transition-all duration-[400ms] ease-spring hover:scale-110 ${accentColor === color ? 'ring-2 ring-offset-2 ring-offset-[#050505] scale-110' : ''}`}
                style={{ backgroundColor: color, boxShadow: accentColor === color ? `0 0 16px ${color}40` : undefined }}>
                {accentColor === color && <FiCheck className="m-auto text-white" size={14} strokeWidth={3} />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
              className="w-9 h-9 rounded-xl cursor-pointer border-2 border-[rgba(0,0,0,0.06)]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Custom</span>
          </div>
        </div>
        
        {/* Spotify Integration */}
        <div className="bg-[rgba(255,255,255,0.02)] md:p-5 p-4 rounded-[2rem] ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Spotify Integration</h3>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isConnected ? 'text-emerald-500' : 'text-[var(--text-tertiary)]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-[var(--text-tertiary)]'}`} />
              {isConnected ? 'Connected' : 'Not connected'}
            </div>
          </div>
          
          {!isConnected ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">Client ID</label>
                <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none text-xs transition-all placeholder:text-[var(--text-tertiary)]"
                  placeholder="From Spotify Developer Dashboard" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider">Client Secret</label>
                <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none text-xs transition-all placeholder:text-[var(--text-tertiary)]"
                  placeholder="From Spotify Developer Dashboard" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveCredentials} disabled={!clientId.trim() || !clientSecret.trim()}
                  className="flex-1 glass-interactive px-4 py-2.5 rounded-xl text-[10px] font-bold text-[var(--text-primary)] disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {saved ? <><FiCheck size={12} className="text-emerald-500" /> Saved</> : 'Save Credentials'}
                </button>
                <button onClick={handleConnect} disabled={!clientId.trim() || !clientSecret.trim()}
                  className="flex-1 bg-[var(--text-primary)] text-white px-4 py-2.5 rounded-xl text-[10px] font-bold disabled:opacity-40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5">
                  <FiExternalLink size={12} /> Connect Spotify
                </button>
              </div>
              <p className="text-[9px] text-[var(--text-tertiary)] leading-relaxed">
                Get credentials at <span className="text-[var(--accent)] font-semibold">developer.spotify.com/dashboard</span>. 
                Set redirect URI to <span className="font-semibold">mini-spotify://callback</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1db954] flex items-center justify-center">
                <FiMusic size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--text-primary)]">Spotify Connected</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Import playlists from Spotify</p>
              </div>
              <button onClick={disconnect} className="glass-interactive px-3 py-2 rounded-xl text-[10px] font-bold text-red-500 flex items-center gap-1">
                <FiX size={11} /> Disconnect
              </button>
            </div>
          )}
        </div>
        
        {/* About */}
        <div className="bg-[rgba(255,255,255,0.02)] md:p-5 p-4 rounded-[2rem] ring-1 ring-white/5">
          <h3 className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] mb-3 md:mb-4 uppercase tracking-[0.2em]">About</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#14803a] flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-primary)]">Mini Spotify</p>
              <p className="text-[11px] text-[var(--text-secondary)]">v1.0.0 • Lightweight music player</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
