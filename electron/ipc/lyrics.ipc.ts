import { ipcMain } from 'electron';
import { store } from '../store/index.js';
import { Lyrics } from '../types.js';

export function registerLyricsIPC() {
  ipcMain.handle('lyrics:get', (_, songId: string) => {
    return store.getLyricsForSong(songId);
  });
  
  ipcMain.handle('lyrics:save', (_, lyrics: Lyrics) => {
    store.saveLyrics(lyrics);
    return true;
  });
}
