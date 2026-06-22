export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  filePath: string;
  coverArt?: string;
  year?: number;
  genre?: string;
  spotifyId?: string;
  streamingUri?: string;
  dateAdded: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
  spotifyUrl?: string;
}

export interface Lyrics {
  songId: string;
  content: string;
  language?: string;
  updatedAt: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  external_urls: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { items: { track: SpotifyTrack }[] };
  external_urls: { spotify: string };
}

export interface ImportMatch {
  spotifyTrack: SpotifyTrack;
  matchedSongId?: string;
  confidence: number;
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  volume: number;
  lastPlayedPlaylist?: string;
  lastPlayedSong?: string;
  lastPlayedPosition?: number;
  spotifyClientId?: string;
  spotifyClientSecret?: string;
}