import React from 'react';
import { History, Compass, BarChart3, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../types';

interface AndroidNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
  autoDeleteActive: boolean;
  className?: string;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  onTabChange,
  historyCount,
  autoDeleteActive,
  className = '',
}) => {
  const tabs = [
    {
      id: 'history' as ActiveTab,
      label: 'History',
      icon: History,
      badge: historyCount > 0 ? (historyCount > 99 ? '99+' : historyCount) : null,
    },
    {
      id: 'browser' as ActiveTab,
      label: 'Smart Viewer',
      icon: Compass,
      sublabel: 'Auto-Logs',
    },
    {
      id: 'insights' as ActiveTab,
      label: 'Insights',
      icon: BarChart3,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Auto-Delete',
      icon: ShieldCheck,
      dot: autoDeleteActive,
    },
  ];

  return (
    <nav className={`w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shrink-0 z-40 ${className}`}>
      <div className="grid grid-cols-4 items-center h-16 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group active:scale-95"
            >
              {/* Material You Pill Indicator */}
              <div
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-3 text-[10px] font-bold bg-cyan-500 text-slate-950 rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                  {tab.dot && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  )}
                </div>
              </div>

              {/* Tab Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
