import { useState } from 'react';
import { LibraryBrowser } from '../library/LibraryBrowser';
import { PlaylistList } from '../playlist/PlaylistList';
import { PlaylistView } from '../playlist/PlaylistView';

interface MainContentProps {
  activeView: string;
}

export function MainContent({ activeView }: MainContentProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  const renderView = () => {
    switch (activeView) {
      case 'library':
        return <LibraryBrowser />;
      case 'playlists':
        if (selectedPlaylistId) {
          return (
            <PlaylistView 
              playlistId={selectedPlaylistId} 
              onBack={() => setSelectedPlaylistId(null)} 
            />
          );
        }
        return <PlaylistList selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} />;
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
