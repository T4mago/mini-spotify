import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-panel w-96 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Create Playlist</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-glass-hover)] rounded">
            <FiX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] focus:border-[var(--accent-color)] outline-none"
              placeholder="My Playlist"
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border-glass)] focus:border-[var(--accent-color)] outline-none resize-none"
              rows={3}
              placeholder="Add an optional description"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
