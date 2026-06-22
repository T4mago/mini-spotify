import { create } from 'zustand';
import { Lyrics, Song } from '../types';
import { ipc } from '../lib/ipc';

interface LyricsState {
  currentLyrics: Lyrics | null;
  isLoading: boolean;
  syncOffset: number;
  isLyricsOpen: boolean;
  
  loadLyrics: (song: Song) => Promise<void>;
  saveLyrics: (songId: string, content: string) => Promise<void>;
  clearLyrics: () => void;
  setSyncOffset: (offset: number) => void;
  setLyricsOpen: (open: boolean) => void;
  toggleLyrics: () => void;
}

export const useLyrics = create<LyricsState>((set) => ({
  currentLyrics: null,
  isLoading: false,
  syncOffset: 0,
  isLyricsOpen: false,
  loadLyrics: async (song) => {
    set({ isLoading: true });
    try {
      // Helper to clean search strings (removes (Remastered), [Live], feat., etc.)
      const cleanSearchString = (str: string): string => {
        if (!str) return '';
        return str
          .replace(/\s*-\s*.*$/, '') // Remove everything after a hyphen (e.g. - Remastered)
          .replace(/\s*\[.*\]/g, '') // Remove square brackets content
          .replace(/\s*\(.*\)/g, '') // Remove parenthesis content
          .replace(/feat\..*$/i, '') // Remove "feat. artist"
          .replace(/ft\..*$/i, '') // Remove "ft. artist"
          .trim();
      };

      // 1. Try local cache first
      let cachedLyrics = await ipc.invoke<Lyrics | undefined>('lyrics:get', song.id);
      
      const isContentSynced = (text: string) => /\[\d{1,2}:\d{2}[.,:]\d{2,3}\]/.test(text);
      const isPlain = cachedLyrics && cachedLyrics.content && !isContentSynced(cachedLyrics.content);
      
      // If we have cached synced lyrics, use them directly (zero network cost!)
      if (cachedLyrics && cachedLyrics.content && cachedLyrics.content.trim() !== '' && !isPlain) {
        set({ currentLyrics: cachedLyrics, isLoading: false });
        return;
      }
      
      // We either don't have lyrics, or the cached lyrics are plain (unsynced).
      // Let's attempt to fetch/upgrade to synced lyrics from LRCLIB.
      let fetchedLyrics: Lyrics | null = null;
      const cleanArtist = cleanSearchString(song.artist);
      const cleanTitle = cleanSearchString(song.title);
      
      // Try precise match first
      const durationParam = song.duration ? `&duration=${Math.round(song.duration)}` : '';
      const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}${durationParam}`;
      
      let fetchedContent: string | null = null;
      
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'MiniSpotify/1.0.0 (https://github.com/mini-spotify)'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          fetchedContent = data.syncedLyrics || data.plainLyrics;
          if (!fetchedContent && data.instrumental) {
            fetchedContent = "[Instrumental]";
          }
        }
      } catch (apiError) {
        console.warn('LRCLIB precise fetch failed:', apiError);
      }
      
      // If precise fetch failed to find lyrics, try relaxed search endpoint
      if (!fetchedContent) {
        const searchQuery = encodeURIComponent(`${cleanArtist} ${cleanTitle}`);
        const searchUrl = `https://lrclib.net/api/search?q=${searchQuery}`;
        
        try {
          const res = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'MiniSpotify/1.0.0 (https://github.com/mini-spotify)'
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              // Find best matching track based on duration if we have it
              let bestMatch = null;
              if (song.duration) {
                let minDiff = Infinity;
                for (const item of data) {
                  if (item.syncedLyrics || item.plainLyrics || item.instrumental) {
                    const diff = Math.abs(item.duration - song.duration);
                    if (diff < minDiff) {
                      minDiff = diff;
                      bestMatch = item;
                    }
                  }
                }
              }
              
              // Fallback to first search result with lyrics if no duration match
              if (!bestMatch) {
                bestMatch = data.find(item => item.syncedLyrics || item.plainLyrics || item.instrumental);
              }
              
              if (bestMatch) {
                fetchedContent = bestMatch.syncedLyrics || bestMatch.plainLyrics;
                if (!fetchedContent && bestMatch.instrumental) {
                  fetchedContent = "[Instrumental]";
                }
              }
            }
          }
        } catch (searchError) {
          console.error('LRCLIB search fallback failed:', searchError);
        }
      }
      
      if (fetchedContent) {
        fetchedLyrics = {
          songId: song.id,
          content: fetchedContent,
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Determine final lyrics to use and save:
      let finalLyrics: Lyrics | null = null;
      
      if (fetchedLyrics) {
        const isFetchedSynced = isContentSynced(fetchedLyrics.content);
        // Save and upgrade if we found synced lyrics or didn't have any cached version
        if (isFetchedSynced || !cachedLyrics) {
          finalLyrics = fetchedLyrics;
          await ipc.invoke('lyrics:save', finalLyrics);
        } else {
          // If fetched is also plain, keep our existing cached plain lyrics
          finalLyrics = cachedLyrics;
        }
      } else if (cachedLyrics) {
        // Fall back to cached plain lyrics if fetch failed/returned nothing
        finalLyrics = cachedLyrics;
      }
      
      set({ currentLyrics: finalLyrics, isLoading: false });
    } catch (error) {
      console.error('Failed to load lyrics:', error);
      set({ isLoading: false });
    }
  },
  
  saveLyrics: async (songId, content) => {
    const lyrics: Lyrics = {
      songId,
      content,
      updatedAt: new Date().toISOString(),
    };
    try {
      await ipc.invoke('lyrics:save', lyrics);
      set({ currentLyrics: lyrics });
    } catch (error) {
      console.error('Failed to save lyrics:', error);
      throw error;
    }
  },
  
  clearLyrics: () => set({ currentLyrics: null }),
  setSyncOffset: (offset) => set({ syncOffset: offset }),
  setLyricsOpen: (open) => set({ isLyricsOpen: open }),
  toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
}));

export interface SyncedLine {
  time: number;
  text: string;
}

export function parseLRC(lrcText: string): SyncedLine[] {
  const lines = lrcText.split('\n');
  const result: SyncedLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})[.,:](\d{2,3})\]/;
  
  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);
      const msFactor = match[3].length === 2 ? 10 : 1;
      const time = minutes * 60 + seconds + (milliseconds * msFactor) / 1000;
      const text = line.replace(timeRegex, '').trim();
      
      if (!text.startsWith('[') && !text.endsWith(']')) {
        result.push({ time, text });
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}
