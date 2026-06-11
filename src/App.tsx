import { LibraryBrowser } from './components/library/LibraryBrowser';
import { PlayerBar } from './components/player/PlayerBar';

function App() {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex-1 overflow-hidden">
        <LibraryBrowser />
      </div>
      <PlayerBar />
    </div>
  );
}

export default App;
