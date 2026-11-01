import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, EyeOff } from 'lucide-react';

interface AndroidStatusBarProps {
  isIncognito?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isIncognito }) => {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Format 12-hour or 24-hour style
      setTime(`${hours.toString().padStart(2, '0')}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full px-5 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 select-none bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50 z-20">
      {/* Left: Clock & Incognito Indicator */}
      <div className="flex items-center gap-2">
        <span className="tracking-tight text-[13px] text-slate-200 font-mono">{time}</span>
        {isIncognito && (
          <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
            <EyeOff className="w-3 h-3" />
            <span className="hidden sm:inline">Incognito</span>
          </div>
        )}
      </div>

      {/* Center: Punch Hole Camera Mock (Android Style) */}
      <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
      </div>

      {/* Right: Connectivity & Battery Icons */}
      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-[10px] font-mono tracking-wider text-slate-400">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-slate-400">89%</span>
          <Battery className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
