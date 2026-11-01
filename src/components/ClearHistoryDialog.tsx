import React, { useState } from 'react';
import { Trash2, X, Clock, AlertTriangle, Check } from 'lucide-react';
import { HistoryCategory } from '../types';

interface ClearHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: (
    range: '15m' | '1h' | '24h' | '7d' | '4w' | 'all',
    categories: HistoryCategory[]
  ) => void;
  totalItems: number;
}

export const ClearHistoryDialog: React.FC<ClearHistoryDialogProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  totalItems,
}) => {
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h' | '7d' | '4w' | 'all'>('24h');
  const [clearWeb, setClearWeb] = useState(true);
  const [clearVideo, setClearVideo] = useState(true);
  const [clearSearch, setClearSearch] = useState(true);
  const [clearSocial, setClearSocial] = useState(true);

  if (!isOpen) return null;

  const handleClear = () => {
    const categories: HistoryCategory[] = [];
    if (clearWeb) {
      categories.push('web', 'article', 'download');
    }
    if (clearVideo) {
      categories.push('video');
    }
    if (clearSearch) {
      categories.push('search');
    }
    if (clearSocial) {
      categories.push('social');
    }

    onConfirmClear(timeRange, categories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Drag handle affordance */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Dialog Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Clear Browsing Data</h2>
              <p className="text-xs text-slate-400">Permanently remove selected activity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-5">
          {/* Time Range Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Time Range
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full bg-slate-950 text-slate-100 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:border-cyan-500 focus:outline-none"
              >
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="4w">Last 4 weeks</option>
                <option value="all">All time (Full Wipe)</option>
              </select>
            </div>
          </div>

          {/* Data Types Checkboxes */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Types of Data
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="text-left">
                <span className="text-sm font-medium text-slate-200 block">Webpages & Articles</span>
                <span className="text-xs text-slate-500">Browsed sites, articles, and documentation</span>
              </div>
              <input
                type="checkbox"
                checked={clearWeb}
                onChange={(e) => setClearWeb(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="text-left">
                <span className="text-sm font-medium text-slate-200 block">Videos & Media</span>
                <span className="text-xs text-slate-500">YouTube clips, tutorials, and music streams</span>
              </div>
              <input
                type="checkbox"
                checked={clearVideo}
                onChange={(e) => setClearVideo(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="text-left">
                <span className="text-sm font-medium text-slate-200 block">Search Queries</span>
                <span className="text-xs text-slate-500">Google and internal keyword lookups</span>
              </div>
              <input
                type="checkbox"
                checked={clearSearch}
                onChange={(e) => setClearSearch(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <div className="text-left">
                <span className="text-sm font-medium text-slate-200 block">Social Posts & Threads</span>
                <span className="text-xs text-slate-500">Reddit, forum posts, and feeds</span>
              </div>
              <input
                type="checkbox"
                checked={clearSocial}
                onChange={(e) => setClearSocial(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>
          </div>

          {/* Warning notice */}
          {timeRange === 'all' && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                Selecting <strong>All time</strong> will wipe all history items in the selected categories.
              </span>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950/60 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md shadow-rose-900/30 active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
