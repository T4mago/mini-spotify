import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import { Playlist } from '../types';

export function registerPlaylistIPC() {
  ipcMain.handle('playlist:getAll', () => {
    return store.getPlaylists();
  });
  
  ipcMain.handle('playlist:create', (_, { name, description }: { name: string; description?: string }) => {
    const playlist: Playlist = {
      id: uuidv4(),
      name,
      description,
      songIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addPlaylist(playlist);
    return playlist;
  });
  
  ipcMain.handle('playlist:update', (_, { id, updates }: { id: string; updates: Partial<Playlist> }) => {
    store.updatePlaylist(id, updates);
    return true;
  });
  
  ipcMain.handle('playlist:delete', (_, id: string) => {
    store.deletePlaylist(id);
    return true;
  });
  
  ipcMain.handle('playlist:addSong', (_, { playlistId, songId }: { playlistId: string; songId: string }) => {
    const playlists = store.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
      store.updatePlaylist(playlistId, { songIds: [...playlist.songIds, songId] });
    }
    return true;
  });
  
  ipcMain.handle('playlist:removeSong', (_, { playlistId, songId }: { playlistId: string; songId: string }) => {
    const playlists = store.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      store.updatePlaylist(playlistId, { 
        songIds: playlist.songIds.filter(id => id !== songId) 
      });
    }
    return true;
  });
}
