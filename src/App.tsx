import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { PlayerBar } from './components/player/PlayerBar';
import { QueuePanel } from './components/player/QueuePanel';
import { LyricsPanel } from './components/lyrics/LyricsPanel';
import { LyricsEditor } from './components/lyrics/LyricsEditor';
import { useTheme } from './hooks/useTheme';
import { useKeyboard } from './hooks/useKeyboard';
import { useLyrics } from './hooks/useLyrics';
import { Song } from './types';

function LibraryIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3h5v18H3z" /><path d="M11 3h5v18h-5z" /><path d="M19 3h2v18h-2z" />
    </svg>
  );
}
function SearchIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function PlaylistIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h12" /><circle cx="19" cy="16" r="3" /><path d="M19 13v3" />
    </svg>
  );
}
function SettingsIcon({ size, strokeWidth, className }: { size: number; strokeWidth: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function App() {
  const [activeView, setActiveView] = useState('library');
  const { isLyricsOpen, setLyricsOpen, toggleLyrics } = useLyrics();
  const [isLyricsEditorOpen, setIsLyricsEditorOpen] = useState(false);
  const [editingLyricsSong, setEditingLyricsSong] = useState<Song | null>(null);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const { loadTheme } = useTheme();

  useKeyboard();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return (
    <ErrorBoundary>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: 'rgba(5,5,5,0.9)',
          color: '#f5f5fa',
          fontSize: '11px',
          borderRadius: '9999px',
          backdropFilter: 'blur(32px)',
          border: '0.5px solid rgba(255,255,255,0.06)',
          padding: '10px 16px',
        }
      }} />
      <div className="h-screen flex flex-col relative" style={{ height: '100dvh' }}>
        <div className="wallpaper-bg" />

        <div className="relative z-10 flex-1 flex flex-col md:p-4 p-3 md:gap-3 gap-2 min-h-0">
          <div className="flex justify-center">
            <Header activeView={activeView} />
          </div>

          <div className="flex-1 flex md:gap-3 gap-0 overflow-hidden min-h-0">
            <Sidebar activeView={activeView} onViewChange={setActiveView} />
            <MainContent activeView={activeView} />
            <QueuePanel
              isOpen={isQueueOpen}
              onClose={() => setIsQueueOpen(false)}
            />
            <LyricsPanel
              isOpen={isLyricsOpen}
              onClose={() => setLyricsOpen(false)}
              onEditLyrics={(song) => {
                setEditingLyricsSong(song);
                setIsLyricsEditorOpen(true);
              }}
            />
          </div>

          <div className="flex justify-center md:px-0 px-2">
            <PlayerBar
              isLyricsOpen={isLyricsOpen}
              onToggleLyrics={toggleLyrics}
              isQueueOpen={isQueueOpen}
              onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
            />
          </div>

          <div className="md:hidden flex items-center justify-around px-6 py-2 bg-[rgba(0,0,0,0.6)] backdrop-blur-2xl rounded-2xl border border-[rgba(255,255,255,0.04)] mx-2">
            {[
              { id: 'library', icon: LibraryIcon },
              { id: 'search', icon: SearchIcon },
              { id: 'playlists', icon: PlaylistIcon },
              { id: 'settings', icon: SettingsIcon },
            ].map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-[400ms] ease-spring ${
                    isActive
                      ? 'text-[var(--accent)] bg-[rgba(29,185,84,0.08)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                </button>
              );
            })}
          </div>
        </div>

        {editingLyricsSong && (
          <LyricsEditor
            song={editingLyricsSong}
            isOpen={isLyricsEditorOpen}
            onClose={() => {
              setIsLyricsEditorOpen(false);
              setEditingLyricsSong(null);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
