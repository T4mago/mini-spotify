import { useState } from 'react';
import { LibraryBrowser } from '../library/LibraryBrowser';
import { PlaylistList } from '../playlist/PlaylistList';
import { PlaylistView } from '../playlist/PlaylistView';
import { SearchBar } from '../search/SearchBar';
import { SettingsPanel } from '../settings/SettingsPanel';

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
        return <SearchBar />;
      case 'settings':
        return <SettingsPanel />;
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
