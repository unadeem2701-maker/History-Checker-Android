import React from 'react';
import { X, ShieldCheck, Clock, Search, Trash2, Smartphone, Sparkles, Check } from 'lucide-react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp max-h-[85vh] flex flex-col">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="flex items-center justify-between px-6 pt-2 pb-3 border-b border-slate-800">
          <span className="text-xs font-mono uppercase text-cyan-400">About History App</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto text-center">
          {/* Logo Showcase with Neon Glow */}
          <div className="relative mx-auto w-24 h-24 rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 via-slate-800 to-indigo-500/30 ring-1 ring-cyan-500/40 shadow-xl shadow-cyan-500/10">
            <img
              src="/src/assets/images/history_app_icon_1793522592965.jpg"
              alt="History Logo"
              className="w-full h-full object-cover rounded-[22px]"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">History</h2>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">Android Smart Activity & Retention Engine</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Designed specifically to capture whatever you browse and watch in real-time, with instant search, granular deletion, and intelligent 15/30-day automated retention.
            </p>
          </div>

          {/* Key Capabilities List */}
          <div className="space-y-2 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Real-time Activity Capture:</strong>
                <span className="text-slate-400">Automatically logs viewed pages, articles, videos, and searches.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Automated Retention (15d / 30d):</strong>
                <span className="text-slate-400">Prunes aged logs automatically to preserve privacy and memory.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-900">
              <Search className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Instant Search & Highlighting:</strong>
                <span className="text-slate-400">Find any past link or search keyword instantly.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-900">
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Granular Clear & Multi-select:</strong>
                <span className="text-slate-400">Clear last 15 min, 24 hr, 4 weeks, or select batch items.</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
};
