export const electronAPI = window.electronAPI;

// Type-safe IPC wrapper
export const ipc = {
  invoke: async <T>(channel: string, ...args: unknown[]): Promise<T> => {
    return electronAPI.invoke(channel, ...args);
  },
  send: (channel: string, ...args: unknown[]) => {
    electronAPI.send(channel, ...args);
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    return electronAPI.on(channel, callback);
  },
};