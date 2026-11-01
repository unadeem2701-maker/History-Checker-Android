import React, { useRef, useState } from 'react';
import { ShieldCheck, EyeOff, Download, Upload, RotateCcw, FileText, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { AutoDeleteSettings, HistoryItem } from '../types';
import { HistoryStorageService } from '../services/historyStorage';

interface SettingsViewProps {
  settings: AutoDeleteSettings;
  onOpenAutoDeleteModal: () => void;
  isIncognito: boolean;
  onToggleIncognito: () => void;
  onResetData: () => void;
  onRunImmediateCleanup: () => void;
  onImportSuccess: (message: string) => void;
  items: HistoryItem[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onOpenAutoDeleteModal,
  isIncognito,
  onToggleIncognito,
  onResetData,
  onRunImmediateCleanup,
  onImportSuccess,
  items,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExportJSON = () => {
    const data = HistoryStorageService.exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `android_history_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Exported backup JSON successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportCSV = () => {
    const data = HistoryStorageService.exportCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `android_history_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Exported spreadsheet CSV successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = HistoryStorageService.importJSON(content);
        if (result.success) {
          onImportSuccess(result.message);
        } else {
          alert(result.message);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 p-4 pb-28">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Auto-Delete & Privacy Controls</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure automated data pruning and storage retention
        </p>
      </div>

      {downloadSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Auto-Delete Primary Hero Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
              Retention Policy
            </span>
            <h3 className="text-base font-bold text-white mt-1.5">
              Auto-Delete:{' '}
              {settings.enabled && settings.duration !== 'never'
                ? `${settings.duration} Retention`
                : 'Disabled'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {settings.enabled && settings.duration !== 'never'
                ? `Activity older than ${settings.duration} is systematically purged to save memory.`
                : 'History is saved indefinitely until you manually delete it.'}
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onOpenAutoDeleteModal}
            className="flex-1 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Change Policy (15d / 30d)
          </button>
          <button
            onClick={onRunImmediateCleanup}
            className="py-2 px-3 text-xs font-medium text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            title="Scan and delete expired items right now"
          >
            Clean Now
          </button>
        </div>
      </div>

      {/* Pause Tracking / Incognito Toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isIncognito ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Pause Activity Tracking</h4>
            <p className="text-xs text-slate-400">
              {isIncognito ? 'Incognito active — no visits will be recorded' : 'Active — browsing is saved automatically'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isIncognito}
            onChange={onToggleIncognito}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* Export & Backup Section */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Backup & Data Portability
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Import JSON */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import History from JSON</span>
          </button>
        </div>
      </div>

      {/* Reset Demo Data */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-300">Restore Demo Timeline</h4>
            <p className="text-[11px] text-slate-500">
              Reset initial items (today up to 55 days ago) to re-test auto-delete
            </p>
          </div>
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
