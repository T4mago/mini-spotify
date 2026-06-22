import { useState } from 'react';
import { FiX, FiMusic } from 'react-icons/fi';

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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade">
      <div className="glass-strong w-[400px] rounded-3xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(0,0,0,0.06)] flex items-center justify-center">
              <FiMusic size={16} className="text-[var(--text-secondary)]" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)]">New Playlist</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] transition-all">
            <FiX size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none text-sm transition-all placeholder:text-[var(--text-tertiary)]"
              placeholder="My playlist" autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-solid border-none focus:ring-2 focus:ring-[var(--accent)]/30 outline-none text-sm transition-all resize-none placeholder:text-[var(--text-tertiary)]"
              rows={3} placeholder="Optional..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="glass-interactive px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-secondary)]">Cancel</button>
            <button type="submit" disabled={!name.trim()} className="bg-[var(--text-primary)] text-white px-5 py-2.5 rounded-full text-xs font-semibold disabled:opacity-40 hover:scale-105 transition-transform shadow-md">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
