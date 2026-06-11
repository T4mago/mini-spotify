import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { PlayerBar } from './components/player/PlayerBar';
import { useTheme } from './hooks/useTheme';
import { useKeyboard } from './hooks/useKeyboard';

function App() {
  const [activeView, setActiveView] = useState('library');
  const { loadTheme } = useTheme();
  
  useKeyboard();
  
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);
  
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <MainContent activeView={activeView} />
      </div>
      <PlayerBar />
    </div>
  );
}

export default App;
