import { ipcMain } from 'electron';
import { SpotifyService } from '../spotify/spotifyAuth';
import { store } from '../store';
import { Song, SpotifyTrack, ImportMatch } from '../types';
import { v4 as uuidv4 } from 'uuid';

let spotifyService: SpotifyService | null = null;

function getSpotifyService(): SpotifyService | null {
  const settings = store.getSettings();
  const clientId = settings.spotifyClientId || '';
  const clientSecret = settings.spotifyClientSecret || '';

  if (!spotifyService && clientId && clientSecret) {
    spotifyService = new SpotifyService(clientId, clientSecret);
  }

  return spotifyService;
}

export function registerSpotifyIPC() {
  ipcMain.handle('spotify:isConnected', () => {
    const service = getSpotifyService();
    return service?.isConnected() ?? false;
  });

  ipcMain.handle('spotify:login', async () => {
    const service = getSpotifyService();
    if (service) {
      await service.login();
    }
  });

  ipcMain.handle('spotify:setCredentials', (_, { clientId, clientSecret }: { clientId: string; clientSecret: string }) => {
    spotifyService = new SpotifyService(clientId, clientSecret);
    store.saveSettings({ spotifyClientId: clientId, spotifyClientSecret: clientSecret });
  });

  ipcMain.handle('spotify:import', async (_, url: string) => {
    const service = getSpotifyService();
    if (!service) throw new Error('Spotify not configured');

    const playlistId = service.parsePlaylistId(url);
    if (!playlistId) throw new Error('Invalid Spotify playlist URL');

    const playlist = await service.getPlaylist(playlistId);
    const tracks = await service.getPlaylistTracks(playlistId);

    return { playlist, tracks };
  });

  ipcMain.handle('spotify:matchTracks', async (_, { tracks }: { tracks: SpotifyTrack[] }) => {
    const songs = store.getSongs();
    const matches: ImportMatch[] = [];

    for (const track of tracks) {
      let bestMatch: ImportMatch = { spotifyTrack: track, confidence: 0 };

      for (const song of songs) {
        const score = calculateMatchScore(track, song);
        if (score > bestMatch.confidence) {
          bestMatch = { spotifyTrack: track, matchedSongId: song.id, confidence: score };
        }
      }

      matches.push(bestMatch);
    }

    return matches;
  });

  ipcMain.handle('spotify:createPlaylist', async (_, { name, description, songIds, spotifyUrl }: {
    name: string;
    description?: string;
    songIds: string[];
    spotifyUrl?: string;
  }) => {
    const playlist = {
      id: uuidv4(),
      name,
      description,
      songIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spotifyUrl,
    };

    store.addPlaylist(playlist);
    return playlist;
  });
}

function calculateMatchScore(spotify: SpotifyTrack, local: Song): number {
  let score = 0;

  const spotifyName = spotify.name.toLowerCase();
  const localTitle = local.title.toLowerCase();
  if (spotifyName === localTitle) {
    score += 40;
  } else if (fuzzyMatch(spotifyName, localTitle) > 0.8) {
    score += 25;
  }

  const spotifyArtist = spotify.artists[0]?.name.toLowerCase() || '';
  const localArtist = local.artist.toLowerCase();
  if (spotifyArtist === localArtist) {
    score += 40;
  } else if (fuzzyMatch(spotifyArtist, localArtist) > 0.8) {
    score += 25;
  }

  const spotifyAlbum = spotify.album.name.toLowerCase();
  const localAlbum = local.album.toLowerCase();
  if (spotifyAlbum === localAlbum) {
    score += 15;
  }

  const spotifyDuration = spotify.duration_ms / 1000;
  const durationDiff = Math.abs(spotifyDuration - local.duration);
  if (durationDiff < 5) {
    score += 5;
  }

  return score;
}

function fuzzyMatch(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 1;

  let matches = 0;
  const maxLength = Math.max(aLower.length, bLower.length);

  for (let i = 0; i < aLower.length; i++) {
    if (bLower.includes(aLower[i])) matches++;
  }

  return matches / maxLength;
}
