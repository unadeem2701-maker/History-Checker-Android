import React from 'react';
import { HistoryItem, AutoDeleteSettings } from '../types';
import { BarChart3, Globe, Video, FileText, Search, ShieldCheck, HardDrive, Smartphone } from 'lucide-react';

interface AnalyticsViewProps {
  items: HistoryItem[];
  settings: AutoDeleteSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ items, settings }) => {
  // Domain breakdown
  const domainCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {
    web: 0,
    video: 0,
    article: 0,
    social: 0,
    search: 0,
    download: 0,
  };

  let totalVisits = 0;
  let totalDurationMinutes = 0;

  items.forEach((item) => {
    domainCounts[item.domain] = (domainCounts[item.domain] || 0) + item.visitCount;
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    totalVisits += item.visitCount;
    if (item.durationSeconds) {
      totalDurationMinutes += Math.round(item.durationSeconds / 60);
    }
  });

  const sortedDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topDomainMax = sortedDomains.length > 0 ? sortedDomains[0][1] : 1;

  // Approximate storage calculation
  const storageBytes = new Blob([JSON.stringify(items)]).size;
  const storageKb = (storageBytes / 1024).toFixed(1);

  return (
    <div className="space-y-5 p-4 pb-24">
      {/* Title Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>Activity & Retention Insights</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Analytics of what you browse, watch, and search
        </p>
      </div>

      {/* 2x2 Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Total Logged</span>
          <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block tabular-nums">
            {items.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{totalVisits} total visits</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Auto-Purged</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block tabular-nums">
            {settings.totalPurgedCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Policy: {settings.duration}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Screen Time Logged</span>
          <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block tabular-nums">
            {totalDurationMinutes}m
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Estimated duration</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Storage Used</span>
          <span className="text-2xl font-bold font-mono text-slate-200 mt-1 block tabular-nums">
            {storageKb} KB
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">On-device cache</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Content Types
        </h3>

        <div className="space-y-2.5">
          {[
            { label: 'Websites', key: 'web', count: categoryCounts.web, color: 'bg-cyan-500' },
            { label: 'Videos & Media', key: 'video', count: categoryCounts.video, color: 'bg-rose-500' },
            { label: 'Articles & Blogs', key: 'article', count: categoryCounts.article, color: 'bg-emerald-500' },
            { label: 'Searches', key: 'search', count: categoryCounts.search, color: 'bg-amber-500' },
            { label: 'Social Feeds', key: 'social', count: categoryCounts.social, color: 'bg-indigo-500' },
          ].map((cat) => {
            const percent = items.length > 0 ? Math.round((cat.count / items.length) * 100) : 0;
            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{cat.label}</span>
                  <span className="font-mono text-slate-400">
                    {cat.count} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Visited Domains */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Most Visited Domains
        </h3>

        <div className="space-y-2">
          {sortedDomains.map(([domain, count], index) => {
            const barWidth = Math.round((count / topDomainMax) * 100);
            return (
              <div key={domain} className="flex items-center gap-3 text-xs">
                <span className="w-4 font-mono text-slate-500 text-right">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-200 truncate">{domain}</span>
                    <span className="font-mono text-cyan-400 shrink-0">{count} visits</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500/80 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
