import { useSpotify } from '../../hooks/useSpotify';
import { useLibrary } from '../../hooks/useLibrary';
import { ImportMatch } from '../../types';
import { FiCheck, FiMusic } from 'react-icons/fi';

interface MatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  playlistName: string;
}

export function MatchDialog({ isOpen, onClose, onComplete, playlistName }: MatchDialogProps) {
  const { matchedTracks, createPlaylist } = useSpotify();
  const { songs } = useLibrary();
  const selectedMatches = new Map(matchedTracks.map((m: ImportMatch, i: number) => [i, m.matchedSongId || null]));

  if (!isOpen) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const handleCreatePlaylist = async () => {
    const songIds = Array.from(selectedMatches.values()).filter(Boolean) as string[];
    await createPlaylist(playlistName, undefined, songIds);
    onComplete();
  };

  const matchedCount = Array.from(selectedMatches.values()).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-panel w-[800px] max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-[var(--border-glass)]">
          <h3 className="text-xl font-bold">Match Tracks</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Match Spotify tracks with your local files
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {matchedTracks.map((match: ImportMatch, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-glass)]">
                <div className="w-12 h-12 rounded bg-[var(--bg-glass-hover)] flex items-center justify-center">
                  {match.spotifyTrack.album.images[0] ? (
                    <img
                      src={match.spotifyTrack.album.images[0].url}
                      alt=""
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <FiMusic className="text-[var(--text-secondary)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{match.spotifyTrack.name}</p>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {match.spotifyTrack.artists[0]?.name} • {match.spotifyTrack.album.name}
                  </p>
                </div>

                <div className={`text-sm font-medium ${getConfidenceColor(match.confidence)}`}>
                  {getConfidenceLabel(match.confidence)}
                </div>

                <div className="w-48">
                  {match.matchedSongId ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <FiCheck />
                      <span className="text-sm truncate">
                        {songs.find(s => s.id === match.matchedSongId)?.title || 'Matched'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">No match</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-glass)] flex justify-between items-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {matchedCount} of {matchedTracks.length} tracks matched
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePlaylist}
              disabled={matchedCount === 0}
              className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Create Playlist ({matchedCount} songs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
