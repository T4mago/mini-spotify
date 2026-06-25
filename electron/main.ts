import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';

// Allow autoplay for hidden YouTube iframe fallback
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
import { fileURLToPath } from 'url';
import { registerSettingsIPC } from './ipc/settings.ipc.js';
import { registerLibraryIPC } from './ipc/library.ipc.js';
import { registerAudioIPC } from './ipc/audio.ipc.js';
import { registerPlaylistIPC } from './ipc/playlist.ipc.js';
import { registerSpotifyIPC } from './ipc/spotify.ipc.js';
import { registerLyricsIPC } from './ipc/lyrics.ipc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let pendingSpotifyCode: string | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5180');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register custom protocol
protocol.registerSchemesAsPrivileged([
  { scheme: 'mini-spotify', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

// Register IPC handlers
registerSettingsIPC();
registerLibraryIPC();
registerAudioIPC();
registerPlaylistIPC();
registerSpotifyIPC();
registerLyricsIPC();

app.whenReady().then(() => {
  protocol.handle('mini-spotify', (request) => {
    console.log(`[Main] Protocol handler triggered: ${request.url}`);
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    console.log(`[Main] Code: ${code ? code.substring(0, 10) + '...' : 'null'}, Error: ${error || 'none'}`);

    if (error) {
      console.error(`[Main] Spotify auth error: ${error}`);
    }

    if (code) {
      pendingSpotifyCode = code;
      console.log(`[Main] mainWindow exists: ${!!mainWindow}, destroyed: ${mainWindow?.isDestroyed()}`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        console.log('[Main] Sending spotify:loginStatus to renderer');
        mainWindow.webContents.send('spotify:loginStatus', code);
      } else {
        console.error('[Main] mainWindow not available, storing code as pending');
      }
    }

    return new Response('<html><body><h2>Authorization successful!</h2><p>You can close this tab and return to Mini Spotify.</p></body></html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());