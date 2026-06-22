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
      <Toaster position="bottom-center" toastOptions={{ style: { background: 'rgba(30,30,30,0.9)', color: '#fff', fontSize: '12px', borderRadius: '12px', backdropFilter: 'blur(12px)' } }} />
      <div className="h-screen flex flex-col relative">
        {/* Wallpaper background */}
        <div className="wallpaper-bg" />
        
        {/* App layout */}
        <div className="relative z-10 h-full flex flex-col p-3 gap-3">
          {/* Top bar */}
          <Header activeView={activeView} />
          
          {/* Main area with sidebar */}
          <div className="flex-1 flex gap-3 overflow-hidden">
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
          
          {/* Floating player */}
          <div className="flex justify-center">
            <PlayerBar
              isLyricsOpen={isLyricsOpen}
              onToggleLyrics={toggleLyrics}
              isQueueOpen={isQueueOpen}
              onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
            />
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
