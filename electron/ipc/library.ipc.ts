import { ipcMain, dialog, BrowserWindow } from 'electron';
import { parseFile } from 'music-metadata';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import { Song } from '../types';
import path from 'path';

export function registerLibraryIPC() {
  // Scan folder for audio files
  ipcMain.handle('library:scan', async () => {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow()!, {
      properties: ['openDirectory'],
      title: 'Select Music Folder',
    });
    
    if (result.canceled) return [];
    
    const folderPath = result.filePaths[0];
    const audioExtensions = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'];
    const songs: Song[] = [];
    
    const scanDir = async (dir: string) => {
      const fs = await import('fs');
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          await scanDir(fullPath);
        } else if (audioExtensions.includes(path.extname(file).toLowerCase())) {
          try {
            const metadata = await parseFile(fullPath);
            const song: Song = {
              id: uuidv4(),
              title: metadata.common.title || path.basename(file, path.extname(file)),
              artist: metadata.common.artist || 'Unknown Artist',
              album: metadata.common.album || 'Unknown Album',
              duration: metadata.format.duration || 0,
              filePath: fullPath,
              coverArt: metadata.common.picture?.[0]
                ? `data:${metadata.common.picture[0].format};base64,${metadata.common.picture[0].data.toString('base64')}`
                : undefined,
              year: metadata.common.year,
              genre: metadata.common.genre?.[0],
              addedAt: new Date().toISOString(),
            };
            songs.push(song);
          } catch (error) {
            console.error(`Error parsing ${fullPath}:`, error);
          }
        }
      }
    };
    
    await scanDir(folderPath);
    
    // Save to store
    const existingSongs = store.getSongs();
    const existingPaths = new Set(existingSongs.map(s => s.filePath));
    const newSongs = songs.filter(s => !existingPaths.has(s.filePath));
    
    store.saveSongs([...existingSongs, ...newSongs]);
    return newSongs;
  });
  
  // Get all songs
  ipcMain.handle('library:songs', () => {
    return store.getSongs();
  });
  
  // Remove song
  ipcMain.handle('library:removeSong', (_, id: string) => {
    store.removeSong(id);
    return true;
  });
}
