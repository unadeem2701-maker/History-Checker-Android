import React from 'react';
import { Trash2, CheckSquare, Square, Info, ShieldCheck } from 'lucide-react';
import { AutoDeleteSettings } from '../types';

interface AndroidHeaderProps {
  onOpenClearDialog: () => void;
  onOpenAutoDeleteModal: () => void;
  isMultiSelectMode: boolean;
  onToggleMultiSelect: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  autoDeleteSettings: AutoDeleteSettings;
  isIncognito: boolean;
  onOpenAppInfo: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  onOpenClearDialog,
  onOpenAutoDeleteModal,
  isMultiSelectMode,
  onToggleMultiSelect,
  selectedCount,
  totalCount,
  onSelectAll,
  autoDeleteSettings,
  isIncognito,
  onOpenAppInfo,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      {isMultiSelectMode ? (
        // Android Multi-select Action Bar
        <div className="flex items-center justify-between animate-fadeIn h-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMultiSelect}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors active:scale-95"
            >
              Cancel
            </button>
            <span className="text-sm font-semibold text-cyan-400">
              {selectedCount} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors active:scale-95"
            >
              {selectedCount === totalCount ? (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select All ({totalCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Android Standard Top App Bar
        <div className="flex items-center justify-between h-11">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAppInfo}
              className="relative group p-0.5 rounded-xl transition-transform active:scale-95"
              title="About History App"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-cyan-500/40 shadow-sm shadow-cyan-500/20 bg-slate-900 flex items-center justify-center">
                <img
                  src="/src/assets/images/history_app_icon_1793522592965.jpg"
                  alt="History App Icon"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">History</h1>
                {isIncognito && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-800/40">
                    Paused
                  </span>
                )}
              </div>
              <button
                onClick={onOpenAutoDeleteModal}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors text-left font-medium"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>
                  {autoDeleteSettings.enabled && autoDeleteSettings.duration !== 'never'
                    ? `Auto-delete: ${autoDeleteSettings.duration}`
                    : 'Auto-delete: Off'}
                </span>
              </button>
            </div>
          </div>

          {/* Android Top Actions */}
          <div className="flex items-center gap-1">
            {/* Multi-Select Toggle */}
            <button
              onClick={onToggleMultiSelect}
              title="Select Multiple Items"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
            >
              <CheckSquare className="w-4 h-4" />
            </button>

            {/* Clear Browsing Data Dialog */}
            <button
              onClick={onOpenClearDialog}
              title="Clear Browsing Data"
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* App Info Dialog */}
            <button
              onClick={onOpenAppInfo}
              title="About App & Logo"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-all min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
