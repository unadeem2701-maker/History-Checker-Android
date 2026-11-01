import { HistoryItem, AutoDeleteSettings, AutoDeleteDuration, HistoryCategory } from '../types';
import { INITIAL_HISTORY_ITEMS } from '../data/seedData';

const STORAGE_KEY_ITEMS = 'android_history_items_v2';
const STORAGE_KEY_SETTINGS = 'android_history_autodelete_settings_v2';
const STORAGE_KEY_PAUSED = 'android_history_tracking_paused_v2';

export const DURATION_MS_MAP: Record<AutoDeleteDuration, number> = {
  'never': Infinity,
  '1d': 1 * 24 * 3600 * 1000,
  '7d': 7 * 24 * 3600 * 1000,
  '15d': 15 * 24 * 3600 * 1000,
  '30d': 30 * 24 * 3600 * 1000,
  '60d': 60 * 24 * 3600 * 1000,
  '90d': 90 * 24 * 3600 * 1000,
};

export const DEFAULT_AUTO_DELETE_SETTINGS: AutoDeleteSettings = {
  enabled: true,
  duration: '30d',
  lastRunTimestamp: Date.now(),
  totalPurgedCount: 0,
  notifyOnPurge: true,
  excludeFavorites: true,
};

export class HistoryStorageService {
  static getItems(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (!data) {
        // Initialize with realistic seed data
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_HISTORY_ITEMS));
        return INITIAL_HISTORY_ITEMS;
      }
      return JSON.parse(data) as HistoryItem[];
    } catch {
      return INITIAL_HISTORY_ITEMS;
    }
  }

  static saveItems(items: HistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save history items to localStorage', e);
    }
  }

  static getAutoDeleteSettings(): AutoDeleteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_AUTO_DELETE_SETTINGS));
        return DEFAULT_AUTO_DELETE_SETTINGS;
      }
      return { ...DEFAULT_AUTO_DELETE_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_AUTO_DELETE_SETTINGS;
    }
  }

  static saveAutoDeleteSettings(settings: AutoDeleteSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save auto delete settings', e);
    }
  }

  static isTrackingPaused(): boolean {
    return localStorage.getItem(STORAGE_KEY_PAUSED) === 'true';
  }

  static setTrackingPaused(paused: boolean): void {
    localStorage.setItem(STORAGE_KEY_PAUSED, paused ? 'true' : 'false');
  }

  /**
   * Add a new item when user browses or views content
   */
  static addItem(item: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>): HistoryItem | null {
    if (this.isTrackingPaused()) {
      return null;
    }

    const items = this.getItems();
    // Check if item was visited very recently (within 5 minutes)
    const existingIndex = items.findIndex(
      (i) => i.url.toLowerCase() === item.url.toLowerCase() && Date.now() - i.timestamp < 10 * 60 * 1000
    );

    let updatedItem: HistoryItem;

    if (existingIndex >= 0) {
      // Update existing item with bump in visit count & latest timestamp
      const existing = items[existingIndex];
      updatedItem = {
        ...existing,
        ...item,
        timestamp: Date.now(),
        visitCount: existing.visitCount + 1,
        durationSeconds: (existing.durationSeconds || 0) + (item.durationSeconds || 30),
      };
      items.splice(existingIndex, 1);
      items.unshift(updatedItem);
    } else {
      updatedItem = {
        ...item,
        id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: Date.now(),
        visitCount: 1,
      };
      items.unshift(updatedItem);
    }

    this.saveItems(items);
    return updatedItem;
  }

  /**
   * Delete a single item by ID
   */
  static deleteItem(id: string): { success: boolean; deletedItem?: HistoryItem } {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index >= 0) {
      const [deletedItem] = items.splice(index, 1);
      this.saveItems(items);
      return { success: true, deletedItem };
    }
    return { success: false };
  }

  /**
   * Restore a previously deleted item (for Undo)
   */
  static restoreItem(item: HistoryItem): void {
    const items = this.getItems();
    items.unshift(item);
    items.sort((a, b) => b.timestamp - a.timestamp);
    this.saveItems(items);
  }

  /**
   * Batch delete multiple items by ID
   */
  static deleteBatch(ids: string[]): number {
    const idSet = new Set(ids);
    const items = this.getItems();
    const remaining = items.filter((i) => !idSet.has(i.id));
    const deletedCount = items.length - remaining.length;
    this.saveItems(remaining);
    return deletedCount;
  }

  /**
   * Toggle item favorite status
   */
  static toggleFavorite(id: string): boolean {
    const items = this.getItems();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.saveItems(items);
      return !!item.isFavorite;
    }
    return false;
  }

  /**
   * Clear browsing history by Android-style timeframe
   */
  static clearHistoryByRange(
    range: '15m' | '1h' | '24h' | '7d' | '4w' | 'all',
    filterCategories?: HistoryCategory[]
  ): number {
    const now = Date.now();
    const items = this.getItems();

    let cutoff = 0;
    if (range === '15m') cutoff = now - 15 * 60 * 1000;
    else if (range === '1h') cutoff = now - 60 * 60 * 1000;
    else if (range === '24h') cutoff = now - 24 * 3600 * 1000;
    else if (range === '7d') cutoff = now - 7 * 24 * 3600 * 1000;
    else if (range === '4w') cutoff = now - 28 * 24 * 3600 * 1000;
    else if (range === 'all') cutoff = 0;

    const remaining = items.filter((item) => {
      // If cutoff is 0, delete everything (unless filtered by categories)
      const isWithinTargetTime = range === 'all' ? true : item.timestamp >= cutoff;
      const matchesCategory = filterCategories ? filterCategories.includes(item.category) : true;
      
      // If it matches both time and category, drop it (filter it out)
      if (isWithinTargetTime && matchesCategory) {
        return false;
      }
      return true;
    });

    const deletedCount = items.length - remaining.length;
    this.saveItems(remaining);
    return deletedCount;
  }

  /**
   * Preview items that would be purged under a given auto-delete duration
   */
  static previewAutoDelete(duration: AutoDeleteDuration, excludeFavorites = true): HistoryItem[] {
    if (duration === 'never') return [];
    const maxAgeMs = DURATION_MS_MAP[duration];
    const cutoffTime = Date.now() - maxAgeMs;
    const items = this.getItems();

    return items.filter((item) => {
      if (excludeFavorites && item.isFavorite) return false;
      return item.timestamp < cutoffTime;
    });
  }

  /**
   * Get items that will expire within the next 48 hours under current policy
   */
  static getExpiringSoonItems(settings: AutoDeleteSettings): HistoryItem[] {
    if (!settings.enabled || settings.duration === 'never') return [];
    const maxAgeMs = DURATION_MS_MAP[settings.duration];
    const now = Date.now();
    const cutoffExpired = now - maxAgeMs;
    const cutoffSoon = cutoffExpired + 48 * 3600 * 1000; // items that will cross threshold in next 48h
    const items = this.getItems();

    return items.filter((item) => {
      if (settings.excludeFavorites && item.isFavorite) return false;
      return item.timestamp >= cutoffExpired && item.timestamp <= cutoffSoon;
    });
  }

  /**
   * Run the Auto-Delete lifecycle engine
   */
  static runAutoDelete(customSettings?: AutoDeleteSettings): {
    purgedCount: number;
    freedBytes: number;
    settings: AutoDeleteSettings;
  } {
    const settings = customSettings || this.getAutoDeleteSettings();

    if (!settings.enabled || settings.duration === 'never') {
      return { purgedCount: 0, freedBytes: 0, settings };
    }

    const maxAgeMs = DURATION_MS_MAP[settings.duration];
    const cutoffTime = Date.now() - maxAgeMs;
    const items = this.getItems();

    const initialString = JSON.stringify(items);
    const initialBytes = new Blob([initialString]).size;

    const keptItems: HistoryItem[] = [];
    let purgedCount = 0;

    for (const item of items) {
      if (settings.excludeFavorites && item.isFavorite) {
        keptItems.push(item);
      } else if (item.timestamp < cutoffTime) {
        purgedCount++;
      } else {
        keptItems.push(item);
      }
    }

    if (purgedCount > 0) {
      this.saveItems(keptItems);
    }

    const updatedString = JSON.stringify(keptItems);
    const freedBytes = Math.max(0, initialBytes - new Blob([updatedString]).size);

    const updatedSettings: AutoDeleteSettings = {
      ...settings,
      lastRunTimestamp: Date.now(),
      totalPurgedCount: settings.totalPurgedCount + purgedCount,
    };
    this.saveAutoDeleteSettings(updatedSettings);

    return {
      purgedCount,
      freedBytes,
      settings: updatedSettings,
    };
  }

  /**
   * Reset data to initial demo state
   */
  static resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_HISTORY_ITEMS));
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_AUTO_DELETE_SETTINGS));
    localStorage.setItem(STORAGE_KEY_PAUSED, 'false');
  }

  /**
   * Export all history to JSON
   */
  static exportJSON(): string {
    const items = this.getItems();
    const settings = this.getAutoDeleteSettings();
    return JSON.stringify({
      appName: 'History',
      exportDate: new Date().toISOString(),
      itemCount: items.length,
      settings,
      items,
    }, null, 2);
  }

  /**
   * Export history to CSV format
   */
  static exportCSV(): string {
    const items = this.getItems();
    const headers = ['Title', 'URL', 'Domain', 'Category', 'Date', 'Time', 'Visits', 'Duration(s)', 'Device'];
    const rows = items.map((item) => {
      const d = new Date(item.timestamp);
      return [
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.url || '').replace(/"/g, '""')}"`,
        `"${item.domain || ''}"`,
        `"${item.category || ''}"`,
        `"${d.toLocaleDateString()}"`,
        `"${d.toLocaleTimeString()}"`,
        item.visitCount || 1,
        item.durationSeconds || 0,
        `"${item.device || 'Android Device'}"`,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Import history from JSON string
   */
  static importJSON(jsonString: string): { success: boolean; importedCount: number; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      let newItems: HistoryItem[] = [];
      if (Array.isArray(parsed)) {
        newItems = parsed;
      } else if (parsed && Array.isArray(parsed.items)) {
        newItems = parsed.items;
      } else {
        return { success: false, importedCount: 0, message: 'Invalid JSON format: items array not found.' };
      }

      const existing = this.getItems();
      const existingUrls = new Set(existing.map((i) => i.url.toLowerCase()));
      let added = 0;

      for (const item of newItems) {
        if (item.title && item.url) {
          if (!existingUrls.has(item.url.toLowerCase())) {
            existing.push({
              ...item,
              id: item.id || 'imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              timestamp: item.timestamp || Date.now(),
              visitCount: item.visitCount || 1,
              category: item.category || 'web',
            });
            existingUrls.add(item.url.toLowerCase());
            added++;
          }
        }
      }

      existing.sort((a, b) => b.timestamp - a.timestamp);
      this.saveItems(existing);
      return { success: true, importedCount: added, message: `Successfully imported ${added} new history items!` };
    } catch {
      return { success: false, importedCount: 0, message: 'Failed to parse JSON file.' };
    }
  }
}
