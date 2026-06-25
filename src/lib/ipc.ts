import { browserIpc } from './browser-ipc';

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

const electronIpc = isElectron
  ? {
      invoke: async <T>(channel: string, ...args: unknown[]): Promise<T> => {
        return window.electronAPI!.invoke(channel, ...args) as Promise<T>;
      },
      send: (channel: string, ...args: unknown[]) => {
        window.electronAPI!.send(channel, ...args);
      },
      on: (channel: string, callback: (...args: unknown[]) => void) => {
        return window.electronAPI!.on(channel, callback);
      },
    }
  : null;

export const ipc = electronIpc ?? browserIpc;

export const electronAPI = isElectron ? window.electronAPI : null;
