import { ipcMain } from 'electron';
import { store } from '../store';

export function registerAudioIPC() {
  ipcMain.handle('audio:getSettings', () => {
    return store.getSettings();
  });
  
  ipcMain.handle('audio:savePosition', (_, songId: string, position: number) => {
    store.saveSettings({ lastPlayedSong: songId, lastPlayedPosition: position });
  });
  
  ipcMain.handle('audio:saveVolume', (_, volume: number) => {
    store.saveSettings({ volume });
  });
}
