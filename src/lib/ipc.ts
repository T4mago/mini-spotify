export const electronAPI = window.electronAPI ?? (() => {
  throw new Error('Electron API not available - preload script may have failed');
})();

export const ipc = {
  invoke: async <T>(channel: string, ...args: unknown[]): Promise<T> => {
    return electronAPI.invoke(channel, ...args) as Promise<T>;
  },
  send: (channel: string, ...args: unknown[]) => {
    electronAPI.send(channel, ...args);
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    return electronAPI.on(channel, callback);
  },
};
