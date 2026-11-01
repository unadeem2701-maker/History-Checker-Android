import React from 'react';
import { Video, Globe, FileText, MessageSquare, Search, Trash2, Star, ExternalLink, Clock, Check } from 'lucide-react';
import { HistoryItem, HistoryCategory } from '../types';

interface HistoryCardProps {
  item: HistoryItem;
  searchQuery?: string;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: HistoryItem) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  item,
  searchQuery = '',
  isMultiSelectMode,
  isSelected,
  onToggleSelect,
  onDelete,
  onToggleFavorite,
  onOpenDetail,
}) => {
  // Category icon mapping
  const getCategoryIcon = (category: HistoryCategory) => {
    switch (category) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'article':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'social':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'search':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'web':
      default:
        return <Globe className="w-4 h-4 text-cyan-400" />;
    }
  };

  // Format relative timestamp
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (3600 * 1000));
    const days = Math.floor(diff / (24 * 3600 * 1000));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;

    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Highlight matching search query
  const renderHighlightedTitle = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-cyan-400/30 text-cyan-200 px-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      onClick={() => {
        if (isMultiSelectMode) {
          onToggleSelect(item.id);
        } else {
          onOpenDetail(item);
        }
      }}
      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl transition-all cursor-pointer border ${
        isSelected
          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm shadow-cyan-900/20'
          : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Multi-Select Checkbox or Category Icon */}
      <div className="pt-0.5 shrink-0">
        {isMultiSelectMode ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(item.id);
            }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
              isSelected
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm'
                : 'bg-slate-800/90 border-slate-700 text-transparent hover:border-slate-500'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            {getCategoryIcon(item.category)}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
          {renderHighlightedTitle(item.title, searchQuery)}
        </h3>

        {/* Clean Unboxed Metadata with · separator */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-slate-400 mt-1">
          <span className="font-medium text-slate-300 truncate max-w-[140px]">{item.domain}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono text-[11px] text-slate-400">{formatTime(item.timestamp)}</span>
          {item.visitCount > 1 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] text-cyan-400/90 font-mono">{item.visitCount} visits</span>
            </>
          )}
          {item.durationSeconds && item.durationSeconds > 60 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-slate-500" />
                {Math.round(item.durationSeconds / 60)}m
              </span>
            </>
          )}
        </div>

        {/* Snippet / Description Preview if exists */}
        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-normal">
            {item.description}
          </p>
        )}
      </div>

      {/* Quick Actions (Open link, Star, Delete) */}
      {!isMultiSelectMode && (
        <div className="flex items-center gap-1 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          {/* Favorite Star */}
          <button
            onClick={() => onToggleFavorite(item.id)}
            title={item.isFavorite ? 'Unstar' : 'Star (Protected from auto-delete)'}
            className={`p-1.5 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
              item.isFavorite
                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40'
                : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400 stroke-amber-400' : ''}`} />
          </button>

          {/* Delete Single Item */}
          <button
            onClick={() => onDelete(item.id)}
            title="Delete this history entry"
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
