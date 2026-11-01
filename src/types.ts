export type HistoryCategory = 'web' | 'video' | 'article' | 'social' | 'search' | 'download';

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  category: HistoryCategory;
  timestamp: number; // Unix timestamp in ms
  visitCount: number;
  durationSeconds?: number;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  device?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export type AutoDeleteDuration = 'never' | '1d' | '7d' | '15d' | '30d' | '60d' | '90d';

export interface AutoDeleteSettings {
  enabled: boolean;
  duration: AutoDeleteDuration;
  lastRunTimestamp: number;
  totalPurgedCount: number;
  notifyOnPurge: boolean;
  excludeFavorites: boolean;
}

export interface HistoryFilterState {
  searchQuery: string;
  category: HistoryCategory | 'all';
  dateRange: 'all' | 'today' | 'yesterday' | 'week' | 'month';
  domain: string | 'all';
  sortBy: 'newest' | 'oldest' | 'most_visited';
}

export type ActiveTab = 'history' | 'browser' | 'insights' | 'settings';
