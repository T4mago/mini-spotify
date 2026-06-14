# Mini Spotify

A desktop music player built with Electron, React, TypeScript, and Vite. Features Spotify playlist import, local library management, lyrics display, and YouTube audio playback.

## Features

- 🎵 **Music Playback** - Play local files and YouTube audio via play-dl
- 📚 **Library Management** - Organize tracks, albums, and artists
- 🎧 **Playlist Support** - Create, edit, and import playlists
- 🔗 **Spotify Import** - Import playlists and liked songs from Spotify
- 📝 **Lyrics Display** - View and edit synchronized lyrics
- 🎨 **Modern UI** - Built with Tailwind CSS and Framer Motion
- ⌨️ **Keyboard Shortcuts** - Media keys and custom hotkeys support
- 🌙 **Theme Support** - Light/dark mode with system detection

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Desktop**: Electron 31
- **Styling**: Tailwind CSS, Framer Motion
- **State**: Zustand
- **Audio**: play-dl, yt-search, @distube/ytdl-core
- **Metadata**: music-metadata
- **Storage**: electron-store

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mini-spotify.git
cd mini-spotify

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build for current platform
npm run build

# Build for Windows
npm run build:win

# Build portable version (no installer)
npm run build:portable
```

## Project Structure

```
mini-spotify/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── layout/         # Layout components (Sidebar, Header, MainContent)
│   │   ├── player/         # Player controls (ProgressBar, VolumeControl, etc.)
│   │   ├── library/        # Library browser components
│   │   ├── playlist/       # Playlist components
│   │   ├── lyrics/         # Lyrics display and editor
│   │   ├── search/         # Search functionality
│   │   ├── settings/       # Settings panel
│   │   └── spotify/        # Spotify import components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   └── lib/                # Utility functions
├── electron/               # Electron main process
│   ├── main.ts             # Main entry point
│   ├── preload.ts          # Preload script
│   ├── ipc/                # IPC handlers
│   ├── spotify/            # Spotify authentication
│   └── store/              # Electron store configuration
├── dist/                   # Build output
└── electron-builder.json   # Electron builder config
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:win` | Build Windows installer |
| `npm run build:portable` | Build portable Windows app |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run electron:dev` | Run Electron only (requires built frontend) |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `←/→` | Seek backward/forward 10s |
| `↑/↓` | Volume up/down |
| `M` | Mute toggle |
| `N` | Next track |
| `P` | Previous track |
| `L` | Toggle lyrics panel |
| `Ctrl/Cmd + P` | Open command palette |

## Spotify Integration

To import playlists from Spotify:

1. Open Settings → Spotify
2. Click "Connect to Spotify"
3. Authorize the application
4. Select playlists to import

The app uses Spotify's Web API with PKCE authentication flow.

## License

MIT License - feel free to use this project for learning or personal use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## Acknowledgments

- [play-dl](https://github.com/play-dl/play-dl) for YouTube audio streaming
- [music-metadata](https://github.com/Borewit/music-metadata) for audio metadata parsing
- [electron-store](https://github.com/sindresorhus/electron-store) for persistent storage
- [framer-motion](https://www.framer.com/motion/) for animations