import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  
  // Generic invoke wrapper
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  
  // Generic send wrapper
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  
  // Listen for events
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    return () => ipcRenderer.removeAllListeners(channel);
  },
});