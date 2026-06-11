import { ipcMain } from 'electron';
import { store } from '../store';
import { Lyrics } from '../types';

export function registerLyricsIPC() {
  ipcMain.handle('lyrics:get', (_, songId: string) => {
    return store.getLyricsForSong(songId);
  });
  
  ipcMain.handle('lyrics:save', (_, lyrics: Lyrics) => {
    store.saveLyrics(lyrics);
    return true;
  });
}
