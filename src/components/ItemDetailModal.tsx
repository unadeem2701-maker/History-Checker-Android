import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Star, Trash2, Globe, Clock, Smartphone, Calendar, Share2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface ItemDetailModalProps {
  item: HistoryItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onDelete,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp max-h-[85vh] flex flex-col">
        {/* Top grab bar */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-2 pb-3 border-b border-slate-800">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            {item.category} Details
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <h2 className="text-base font-bold text-white leading-snug">{item.title}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{item.domain}</span>
            </p>
          </div>

          {/* URL box with copy button */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="truncate flex-1 font-mono text-slate-300">{item.url}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Description */}
          {item.description && (
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-200 block mb-1">Snippet:</span>
              {item.description}
            </div>
          )}

          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" /> Visited Date
              </span>
              <span className="font-semibold text-slate-200 block mt-1">{formattedDate}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Visits & Time
              </span>
              <span className="font-semibold text-slate-200 block mt-1">
                {item.visitCount} visits {item.durationSeconds ? `· ${Math.round(item.durationSeconds / 60)}m` : ''}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-cyan-400" /> Device Logged
              </span>
              <span className="font-semibold text-slate-200 block mt-1">
                {item.device || 'Android Smartphone'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                item.isFavorite
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300'
              }`}
            >
              <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{item.isFavorite ? 'Starred' : 'Star'}</span>
            </button>

            <button
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="p-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
