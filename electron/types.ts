export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  filePath: string;
  coverArt?: string;
  addedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  coverArt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lyrics {
  songId: string;
  lyrics: string;
  source: string;
  fetchedAt: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  accentColor: string;
  volume: number;
}