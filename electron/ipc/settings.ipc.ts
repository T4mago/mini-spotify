import { ipcMain } from 'electron';
import { store } from '../store';

export function registerSettingsIPC() {
  ipcMain.handle('settings:get', () => {
    return store.getSettings();
  });
  
  ipcMain.handle('settings:save', (_, settings) => {
    store.saveSettings(settings);
    return true;
  });
}