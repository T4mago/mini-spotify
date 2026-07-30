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
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="double-bezel w-[400px] rounded-[calc(2rem+2px)] overflow-hidden animate-slide-up">
        <div className="double-bezel-inner overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.03)]">
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
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[350ms] ease-spring">Cancel</button>
            <button type="submit" disabled={!name.trim()} className="bg-[var(--accent)] text-black px-5 py-2.5 rounded-full text-xs font-bold disabled:opacity-40 hover:scale-105 transition-all duration-[400ms] ease-spring active:scale-95">Create</button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
