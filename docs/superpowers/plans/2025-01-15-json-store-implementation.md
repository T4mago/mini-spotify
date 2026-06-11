# JSON Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a JSON store system using electron-store to persist library, playlists, lyrics, and settings data, with IPC handlers for settings operations.

**Architecture:** Create a centralized store module that wraps electron-store for different data domains (library, playlists, lyrics, settings). Implement IPC handlers for settings operations and register them in the main process.

**Tech Stack:** TypeScript, Electron, electron-store, IPC

---

## File Structure

**Create:**
- `electron/store/index.ts` - Central store module with typed interfaces for all data domains
- `electron/ipc/settings.ipc.ts` - IPC handlers for settings get/save operations

**Modify:**
- `electron/main.ts` - Register settings IPC handlers

---

### Task 1: Create Store Types and Interfaces

**Files:**
- Create: `electron/store/index.ts`

- [ ] **Step 1: Create store directory and base store module**

```typescript
// electron/store/index.ts
import Store from 'electron-store';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  path: string;
  addedAt: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Lyrics {
  songId: string;
  content: string;
  source: string;
  fetchedAt: string;
}

interface Settings {
  theme: 'light' | 'dark' | 'system';
  libraryPath: string;
  volume: number;
  lastPlayedSongId?: string;
  lastPlayedPosition?: number;
}

interface StoreSchema {
  library: Song[];
  playlists: Playlist[];
  lyrics: Lyrics[];
  settings: Settings;
}

const store = new Store<StoreSchema>({
  defaults: {
    library: [],
    playlists: [],
    lyrics: [],
    settings: {
      theme: 'system',
      libraryPath: '',
      volume: 0.8,
    },
  },
});

export default store;
export type { Song, Playlist, Lyrics, Settings, StoreSchema };
```

- [ ] **Step 2: Verify store module compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit`
Expected: No errors

---

### Task 2: Create Settings IPC Handlers

**Files:**
- Create: `electron/ipc/settings.ipc.ts`

- [ ] **Step 1: Create ipc directory and settings handlers**

```typescript
// electron/ipc/settings.ipc.ts
import { ipcMain } from 'electron';
import store, { Settings } from '../store';

export function registerSettingsIPC(): void {
  ipcMain.handle('settings:get', () => {
    return store.get('settings');
  });

  ipcMain.handle('settings:save', (_event, settings: Partial<Settings>) => {
    const currentSettings = store.get('settings');
    const updatedSettings = { ...currentSettings, ...settings };
    store.set('settings', updatedSettings);
    return updatedSettings;
  });
}
```

- [ ] **Step 2: Verify IPC module compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit`
Expected: No errors

---

### Task 3: Register IPC Handlers in Main Process

**Files:**
- Modify: `electron/main.ts`

- [ ] **Step 1: Import and register settings IPC**

Add import at top of file:
```typescript
import { registerSettingsIPC } from './ipc/settings.ipc';
```

Add registration after app.whenReady().then(createWindow):
```typescript
app.whenReady().then(() => {
  createWindow();
  registerSettingsIPC();
});
```

Remove the old app.whenReady().then(createWindow) line and replace with the new code above.

- [ ] **Step 2: Verify main.ts compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit`
Expected: No errors

---

### Task 4: Test Store Functionality

**Files:**
- Create: `electron/store/__tests__/store.test.ts` (optional for manual testing)

- [ ] **Step 1: Manual verification**

1. Run the app: `npm run dev`
2. Open DevTools in the Electron window
3. Test via renderer process:
   ```javascript
   // In DevTools console
   await window.electronAPI.invoke('settings:get');
   await window.electronAPI.invoke('settings:save', { theme: 'dark' });
   await window.electronAPI.invoke('settings:get');
   ```

- [ ] **Step 2: Verify persistence**

1. Close and reopen the app
2. Check that settings persist between sessions

---

### Task 5: Commit Changes

- [ ] **Step 1: Stage all changes**

```bash
git add electron/store/index.ts electron/ipc/settings.ipc.ts electron/main.ts
```

- [ ] **Step 2: Commit with descriptive message**

```bash
git commit -m "feat: implement JSON store with electron-store and settings IPC

- Create centralized store module with typed interfaces
- Add IPC handlers for settings get/save operations
- Register handlers in main process
- Support for library, playlists, lyrics, and settings persistence"
```

---

## Self-Review

After implementation, verify:

1. **Type Safety:** All store operations use proper TypeScript interfaces
2. **Error Handling:** IPC handlers include basic error handling
3. **Default Values:** Store has sensible defaults for all settings
4. **Integration:** IPC handlers are properly registered in main.ts
5. **Persistence:** Settings persist between app sessions

**Potential Issues to Check:**
- Ensure electron-store is compatible with the current Electron version
- Verify IPC channels match those defined in preload.ts (lines 13-14)
- Check that store file is created in correct location (userData directory)
