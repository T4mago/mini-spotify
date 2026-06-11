import { LibraryBrowser } from '../library/LibraryBrowser';

interface MainContentProps {
  activeView: string;
}

export function MainContent({ activeView }: MainContentProps) {
  const renderView = () => {
    switch (activeView) {
      case 'library':
        return <LibraryBrowser />;
      case 'playlists':
        return <div className="p-4">Playlists (coming soon)</div>;
      case 'search':
        return <div className="p-4">Search (coming soon)</div>;
      case 'settings':
        return <div className="p-4">Settings (coming soon)</div>;
      default:
        return <LibraryBrowser />;
    }
  };
  
  return (
    <div className="flex-1 h-full overflow-hidden">
      {renderView()}
    </div>
  );
}
