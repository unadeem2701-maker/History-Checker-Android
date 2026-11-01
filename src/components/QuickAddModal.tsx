import React, { useState } from 'react';
import { Plus, X, Globe, Video, FileText, MessageSquare, Search, Sparkles } from 'lucide-react';
import { HistoryCategory, HistoryItem } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<HistoryCategory>('web');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !url.trim()) return;

    let finalUrl = url.trim();
    let finalTitle = title.trim();
    let domain = 'custom.link';

    if (finalUrl) {
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      try {
        domain = new URL(finalUrl).hostname.replace('www.', '');
      } catch {
        domain = 'link.com';
      }
    } else {
      domain = 'note.local';
      finalUrl = `https://history.internal/${encodeURIComponent(finalTitle.toLowerCase().replace(/\s+/g, '-'))}`;
    }

    if (!finalTitle) {
      finalTitle = `Visited ${domain}`;
    }

    onAdd({
      title: finalTitle,
      url: finalUrl,
      domain,
      category,
      description: description.trim() || undefined,
      device: 'Android Phone (Quick Capture)',
      durationSeconds: 60,
    });

    setTitle('');
    setUrl('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="flex items-center justify-between px-6 pt-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Save to History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title or Content Viewed *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Watched React 19 Crash Course"
              className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL or Source (Optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. youtube.com/watch?v=..."
              className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'web', label: 'Webpage' },
                { id: 'video', label: 'Video' },
                { id: 'article', label: 'Article' },
                { id: 'social', label: 'Social' },
                { id: 'search', label: 'Search' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as HistoryCategory)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    category === c.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes or Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you learn or find interesting?"
              className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-3.5 py-2 border border-slate-800 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md shadow-cyan-500/20 active:scale-95"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
