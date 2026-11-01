import React, { useState } from 'react';
import { ShieldCheck, X, Check, Clock, Sparkles, AlertCircle, Play, Star } from 'lucide-react';
import { AutoDeleteDuration, AutoDeleteSettings, HistoryItem } from '../types';
import { HistoryStorageService } from '../services/historyStorage';

interface AutoDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AutoDeleteSettings;
  onSaveSettings: (settings: AutoDeleteSettings) => void;
  onRunImmediateCleanup: () => void;
  items: HistoryItem[];
}

export const AutoDeleteModal: React.FC<AutoDeleteModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
  onRunImmediateCleanup,
  items,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<AutoDeleteDuration>(currentSettings.duration);
  const [isEnabled, setIsEnabled] = useState<boolean>(currentSettings.enabled);
  const [excludeFavorites, setExcludeFavorites] = useState<boolean>(currentSettings.excludeFavorites);
  const [notifyOnPurge, setNotifyOnPurge] = useState<boolean>(currentSettings.notifyOnPurge);

  if (!isOpen) return null;

  const durationOptions: { id: AutoDeleteDuration; label: string; sublabel: string; badge?: string }[] = [
    { id: '1d', label: '24 Hours', sublabel: 'Strict daily privacy' },
    { id: '7d', label: '7 Days', sublabel: 'Weekly cleanup cycle' },
    { id: '15d', label: '15 Days', sublabel: 'Half-month retention', badge: 'Popular' },
    { id: '30d', label: '30 Days', sublabel: 'Monthly retention (Default)', badge: 'Recommended' },
    { id: '60d', label: '60 Days', sublabel: 'Bi-monthly archive' },
    { id: '90d', label: '90 Days', sublabel: 'Quarterly review' },
    { id: 'never', label: 'Never (Off)', sublabel: 'Keep history until manually deleted' },
  ];

  // Calculate live preview of items that would be affected right now
  const previewPurged = HistoryStorageService.previewAutoDelete(
    isEnabled ? selectedDuration : 'never',
    excludeFavorites
  );

  const handleSave = () => {
    const newSettings: AutoDeleteSettings = {
      ...currentSettings,
      enabled: isEnabled,
      duration: selectedDuration,
      excludeFavorites,
      notifyOnPurge,
    };
    onSaveSettings(newSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col">
        {/* Mobile grab bar */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Auto-Delete Settings</h2>
              <p className="text-xs text-slate-400">Automated privacy and retention policy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Enable Auto-Delete</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically prune history older than your selected timeframe
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Retention Duration Grid */}
          <div className={isEnabled ? 'space-y-2' : 'opacity-40 pointer-events-none space-y-2'}>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Keep Activity For
            </label>

            <div className="grid grid-cols-1 gap-2">
              {durationOptions.map((opt) => {
                const isSelected = selectedDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl text-left transition-all border ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm shadow-cyan-950'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                            : 'border-slate-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {opt.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.sublabel}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Preferences */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div className="flex items-center gap-2.5 text-left">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Protect Starred Items
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Never auto-delete entries marked as favorite
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={excludeFavorites}
                onChange={(e) => setExcludeFavorites(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>
          </div>

          {/* Live Impact Preview Card */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-cyan-300">Live Retention Preview</h4>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  {isEnabled && selectedDuration !== 'never' ? (
                    previewPurged.length > 0 ? (
                      <>
                        <strong className="text-cyan-200">{previewPurged.length} items</strong> older than{' '}
                        <strong className="text-cyan-200">{selectedDuration}</strong> qualify for immediate cleanup.
                      </>
                    ) : (
                      <>
                        No items currently older than <strong className="text-cyan-200">{selectedDuration}</strong>. Your log is up to date!
                      </>
                    )
                  ) : (
                    'Auto-delete is currently disabled. No items will be automatically pruned.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={() => {
              onRunImmediateCleanup();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 rounded-xl transition-all"
            title="Clean eligible old items now"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Clean Now</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apply Policy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
