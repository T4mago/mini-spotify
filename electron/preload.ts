import { contextBridge, ipcRenderer } from 'electron';

const ALLOWED_INVOKE_CHANNELS = [
  'library:scan',
  'library:songs',
  'library:removeSong',
  'playlist:getAll',
  'playlist:create',
  'playlist:update',
  'playlist:delete',
  'playlist:addSong',
  'playlist:removeSong',
  'settings:get',
  'settings:save',
  'lyrics:get',
  'lyrics:save',
  'spotify:isConnected',
  'spotify:login',
  'spotify:setCredentials',
  'spotify:handleCallback',
  'spotify:import',
  'spotify:matchTracks',
  'spotify:createPlaylist',
  'spotify:accessToken',
  'spotify:playTracks',
  'spotify:disconnect',
  'youtube:search',
  'audio:getSettings',
  'audio:savePosition',
  'audio:saveVolume',
];

const ALLOWED_SEND_CHANNELS = [
  'window:minimize',
  'window:maximize',
  'window:close',
];

const ALLOWED_ON_CHANNELS = [
  'spotify:callback',
  'spotify:loginStatus',
];

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  invoke: (channel: string, ...args: unknown[]) => {
    if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
      throw new Error(`IPC channel not allowed: ${channel}`);
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  send: (channel: string, ...args: unknown[]) => {
    if (!ALLOWED_SEND_CHANNELS.includes(channel)) {
      throw new Error(`IPC channel not allowed: ${channel}`);
    }
    ipcRenderer.send(channel, ...args);
  },

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    if (!ALLOWED_ON_CHANNELS.includes(channel)) {
      throw new Error(`IPC on channel not allowed: ${channel}`);
    }
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    return () => ipcRenderer.removeAllListeners(channel);
  },
});
