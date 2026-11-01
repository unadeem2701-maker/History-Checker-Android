import React, { useState, useEffect } from 'react';
import { Compass, Globe, Video, FileText, Search, Play, ExternalLink, ArrowRight, CheckCircle2, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { HistoryCategory, HistoryItem } from '../types';

interface SmartBrowserProps {
  onLogHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>) => void;
  isIncognito: boolean;
}

interface SampleContent {
  title: string;
  url: string;
  domain: string;
  category: HistoryCategory;
  description: string;
  thumbnail?: string;
  tags: string[];
}

const SAMPLE_CHANNELS: SampleContent[] = [
  {
    title: 'MKBHD: The Future of Android Smartphones in 2026',
    url: 'https://youtube.com/watch?v=mkbhd-android-future',
    domain: 'youtube.com',
    category: 'video',
    description: 'Deep dive into silicon efficiency, foldables, and on-device neural processing units.',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    tags: ['Tech', 'YouTube', 'Android'],
  },
  {
    title: 'James Webb Space Telescope Reveals Ancient Galaxy Halo',
    url: 'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope',
    domain: 'wikipedia.org',
    category: 'web',
    description: 'Astronomers detect unprecedented details of cosmological star formation epochs.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    tags: ['Space', 'Science', 'NASA'],
  },
  {
    title: 'Mastering Modern Tailwind CSS v4 in 15 Minutes',
    url: 'https://dev.to/frontend/tailwind-v4-complete-walkthrough',
    domain: 'dev.to',
    category: 'article',
    description: 'A practical reference to CSS-first configuration, lightning-fast compilation, and container queries.',
    tags: ['Dev', 'CSS', 'Tailwind'],
  },
  {
    title: 'reddit: What Android features do you use every single day?',
    url: 'https://reddit.com/r/Android/comments/daily_features_discussion',
    domain: 'reddit.com',
    category: 'social',
    description: 'Over 1,200 users share their favorite automation routines, split-screen workflows, and gesture shortcuts.',
    tags: ['Reddit', 'Android', 'Discussion'],
  },
  {
    title: 'Lahori Chicken Karahi - Authentic Restaurant Recipe',
    url: 'https://pakistanicooking.com/recipes/lahori-chicken-karahi',
    domain: 'pakistanicooking.com',
    category: 'article',
    description: 'Tender chicken cooked with fresh tomatoes, ginger juliennes, green chilies, and black pepper.',
    tags: ['Cooking', 'Pakistani Food', 'Recipe'],
  },
  {
    title: 'google search: best battery life settings android 15',
    url: 'https://google.com/search?q=best+battery+life+settings+android+15',
    domain: 'google.com',
    category: 'search',
    description: 'Google search query results for extending smartphone battery standby and screen-on time.',
    tags: ['Search', 'Battery'],
  },
];

export const SmartBrowser: React.FC<SmartBrowserProps> = ({ onLogHistory, isIncognito }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [activeContent, setActiveContent] = useState<SampleContent | null>(SAMPLE_CHANNELS[0]);
  const [viewTimeSeconds, setViewTimeSeconds] = useState(0);
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);
  const [isSimulatingLiveStream, setIsSimulatingLiveStream] = useState(false);

  // Timer for active viewing session
  useEffect(() => {
    setViewTimeSeconds(0);
    const interval = setInterval(() => {
      setViewTimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeContent]);

  // Trigger history log when content is viewed
  const handleViewContent = (content: SampleContent) => {
    setActiveContent(content);
    if (!isIncognito) {
      onLogHistory({
        title: content.title,
        url: content.url,
        domain: content.domain,
        category: content.category,
        description: content.description,
        thumbnail: content.thumbnail,
        tags: content.tags,
        device: 'Android Phone (Real-time capture)',
        durationSeconds: 45,
      });

      setLoggedNotification(`Logged: "${content.title.substring(0, 32)}..."`);
      setTimeout(() => setLoggedNotification(null), 3500);
    }
  };

  // Custom URL or Search submission
  const handleCustomNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    let targetUrl = inputUrl.trim();
    let isSearch = false;
    let domain = 'web.com';
    let title = targetUrl;
    let category: HistoryCategory = 'web';

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      try {
        const parsed = new URL(targetUrl);
        domain = parsed.hostname.replace('www.', '');
        title = `Browsed ${domain}`;
      } catch {
        domain = 'custom-site.com';
      }
    } else if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
      domain = targetUrl.replace('www.', '');
      targetUrl = `https://${targetUrl}`;
      title = `Visited ${domain}`;
    } else {
      isSearch = true;
      category = 'search';
      domain = 'google.com';
      title = `google search: ${targetUrl}`;
      targetUrl = `https://google.com/search?q=${encodeURIComponent(targetUrl)}`;
    }

    const newContent: SampleContent = {
      title,
      url: targetUrl,
      domain,
      category,
      description: isSearch
        ? `Searched on Google for "${inputUrl.trim()}"`
        : `User visited ${domain} from the smart address bar`,
      tags: isSearch ? ['Search', 'Google'] : ['Browsing', domain],
    };

    handleViewContent(newContent);
    setInputUrl('');
  };

  // Simulate a live phone activity pulse (user watching / browsing)
  const handleSimulatePulse = () => {
    const randomItem = SAMPLE_CHANNELS[Math.floor(Math.random() * SAMPLE_CHANNELS.length)];
    handleViewContent(randomItem);
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Smart Browser Header */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Smart Content Viewer</h2>
              <p className="text-[11px] text-slate-400">Everything you browse & watch logs automatically</p>
            </div>
          </div>

          <button
            onClick={handleSimulatePulse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all active:scale-95"
            title="Simulate a background viewing event"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Visit</span>
          </button>
        </div>

        {/* Address & Search Bar */}
        <form onSubmit={handleCustomNavigate} className="relative flex items-center">
          <Globe className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Type any website (e.g. reddit.com) or search topic..."
            className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-2xl pl-10 pr-20 py-2.5 border border-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm shadow-cyan-500/30"
          >
            Go / Log
          </button>
        </form>

        {/* Live Toast Confirmation when item logs */}
        {loggedNotification && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="truncate">{loggedNotification}</span>
          </div>
        )}
      </div>

      {/* Currently Viewed Content Screen (Live Active State) */}
      {activeContent && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Live Active Viewer</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              <span>Viewing: {viewTimeSeconds}s</span>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  {activeContent.domain} · {activeContent.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">
                  {activeContent.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
              {activeContent.description}
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeContent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <a
                href={activeContent.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Explore & Browse Feeds */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Explore Content (Tap to view & auto-save)
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {SAMPLE_CHANNELS.map((item, index) => {
            const isCurrent = activeContent?.url === item.url;
            return (
              <button
                key={index}
                onClick={() => handleViewContent(item)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all border ${
                  isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-300 mt-0.5">
                  {item.category === 'video' ? (
                    <Video className="w-4 h-4 text-rose-400" />
                  ) : item.category === 'article' ? (
                    <FileText className="w-4 h-4 text-emerald-400" />
                  ) : item.category === 'search' ? (
                    <Search className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400">{item.domain}</span>
                    <span className="text-[10px] text-cyan-400 uppercase font-mono">{item.category}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 self-center" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
