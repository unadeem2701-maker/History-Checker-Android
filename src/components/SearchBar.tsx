import React from 'react';
import { Search, X, Video, Globe, FileText, MessageSquare, Search as SearchIcon, ArrowDownUp, Calendar } from 'lucide-react';
import { HistoryCategory, HistoryFilterState } from '../types';

interface SearchBarProps {
  filterState: HistoryFilterState;
  onFilterChange: (updates: Partial<HistoryFilterState>) => void;
  totalFilteredCount: number;
  totalItemsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filterState,
  onFilterChange,
  totalFilteredCount,
  totalItemsCount,
}) => {
  const categories: { id: HistoryCategory | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'web', label: 'Web', icon: Globe },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'social', label: 'Social', icon: MessageSquare },
    { id: 'search', label: 'Searches', icon: SearchIcon },
  ];

  return (
    <div className="space-y-3 px-4 pt-3 pb-3 bg-slate-950/90 border-b border-slate-800/80">
      {/* Search Input Field with High Contrast and Clear Affordance */}
      <div className="relative flex items-center group">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
        <input
          type="text"
          value={filterState.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search history by title, URL or keyword..."
          className="w-full bg-slate-900 text-sm text-slate-100 placeholder-slate-400 rounded-2xl pl-10 pr-9 py-2.5 border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
        />
        {filterState.searchQuery && (
          <button
            onClick={() => onFilterChange({ searchQuery: '' })}
            className="absolute right-3 p-1 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = filterState.category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all min-h-[34px] ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Filters: Count, Date Range & Sort Dropdowns */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-300 font-medium">
            {totalFilteredCount} of {totalItemsCount} items
          </span>
          {filterState.searchQuery && (
            <span className="text-[11px] text-cyan-400 font-semibold">· matching "{filterState.searchQuery}"</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <div className="relative">
            <select
              value={filterState.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
              className="bg-slate-900 text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 border border-slate-700/80 hover:border-slate-600 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filterState.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-slate-900 text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 border border-slate-700/80 hover:border-slate-600 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_visited">Most Visited</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
