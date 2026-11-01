/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Compass, History as HistoryIcon } from 'lucide-react';
import { HistoryItem, AutoDeleteSettings, HistoryFilterState, ActiveTab, HistoryCategory } from './types';
import { HistoryStorageService } from './services/historyStorage';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidNavBar } from './components/AndroidNavBar';
import { SearchBar } from './components/SearchBar';
import { HistoryCard } from './components/HistoryCard';
import { ClearHistoryDialog } from './components/ClearHistoryDialog';
import { AutoDeleteModal } from './components/AutoDeleteModal';
import { SmartBrowser } from './components/SmartBrowser';
import { QuickAddModal } from './components/QuickAddModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AppInfoModal } from './components/AppInfoModal';

export default function App() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [autoDeleteSettings, setAutoDeleteSettings] = useState<AutoDeleteSettings>(
    HistoryStorageService.getAutoDeleteSettings()
  );
  const [isIncognito, setIsIncognito] = useState<boolean>(HistoryStorageService.isTrackingPaused());
  const [activeTab, setActiveTab] = useState<ActiveTab>('history');

  // Filter & Search State
  const [filterState, setFilterState] = useState<HistoryFilterState>({
    searchQuery: '',
    category: 'all',
    dateRange: 'all',
    domain: 'all',
    sortBy: 'newest',
  });

  // Multi-Select Mode State
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog & Modal States
  const [isClearDialogOpen, setIsClearDialogOpen] = useState<boolean>(false);
  const [isAutoDeleteModalOpen, setIsAutoDeleteModalOpen] = useState<boolean>(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState<boolean>(false);
  const [isAppInfoOpen, setIsAppInfoOpen] = useState<boolean>(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<HistoryItem | null>(null);

  // Snackbar Toast notification & Undo State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedItem, setLastDeletedItem] = useState<HistoryItem | null>(null);

  // Initialize data and run auto-delete lifecycle on mount
  useEffect(() => {
    const loadedItems = HistoryStorageService.getItems();
    setItems(loadedItems);

    // Run auto-delete check
    const currentSettings = HistoryStorageService.getAutoDeleteSettings();
    if (currentSettings.enabled && currentSettings.duration !== 'never') {
      const result = HistoryStorageService.runAutoDelete(currentSettings);
      if (result.purgedCount > 0) {
        showToast(
          `Auto-Delete: ${result.purgedCount} expired item${result.purgedCount > 1 ? 's' : ''} pruned (> ${currentSettings.duration})`
        );
        setItems(HistoryStorageService.getItems());
        setAutoDeleteSettings(result.settings);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Add Item (from smart browser / quick add / simulation)
  const handleAddItem = (itemData: Omit<HistoryItem, 'id' | 'timestamp' | 'visitCount'>) => {
    const created = HistoryStorageService.addItem(itemData);
    if (created) {
      setItems(HistoryStorageService.getItems());
    }
  };

  // Delete Single Item with Undo capability
  const handleDeleteItem = (id: string) => {
    const res = HistoryStorageService.deleteItem(id);
    if (res.success && res.deletedItem) {
      setItems(HistoryStorageService.getItems());
      setLastDeletedItem(res.deletedItem);
      showToast('Item deleted from History');
    }
  };

  // Undo Last Deletion
  const handleUndoDelete = () => {
    if (lastDeletedItem) {
      HistoryStorageService.restoreItem(lastDeletedItem);
      setItems(HistoryStorageService.getItems());
      setLastDeletedItem(null);
      showToast('Item restored to History');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const isFav = HistoryStorageService.toggleFavorite(id);
    setItems(HistoryStorageService.getItems());
    showToast(isFav ? 'Starred (Protected from auto-delete)' : 'Unstarred');
  };

  // Batch Delete Selected
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    HistoryStorageService.deleteBatch(Array.from(selectedIds));
    setItems(HistoryStorageService.getItems());
    setSelectedIds(new Set());
    setIsMultiSelectMode(false);
    showToast(`Deleted ${count} selected item${count > 1 ? 's' : ''}`);
  };

  // Toggle selection for item in multi-select mode
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select / Deselect All
  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // Clear Browsing Data
  const handleConfirmClear = (
    range: '15m' | '1h' | '24h' | '7d' | '4w' | 'all',
    categories: HistoryCategory[]
  ) => {
    const deletedCount = HistoryStorageService.clearHistoryByRange(range, categories);
    setItems(HistoryStorageService.getItems());
    showToast(`Cleared ${deletedCount} history item${deletedCount !== 1 ? 's' : ''}`);
  };

  // Save Auto-Delete Settings
  const handleSaveAutoDelete = (newSettings: AutoDeleteSettings) => {
    setAutoDeleteSettings(newSettings);
    HistoryStorageService.saveAutoDeleteSettings(newSettings);

    if (newSettings.enabled && newSettings.duration !== 'never') {
      const res = HistoryStorageService.runAutoDelete(newSettings);
      setItems(HistoryStorageService.getItems());
      setAutoDeleteSettings(res.settings);
      if (res.purgedCount > 0) {
        showToast(`Auto-delete policy applied: ${res.purgedCount} expired items cleaned`);
      } else {
        showToast(`Auto-delete set to ${newSettings.duration}`);
      }
    } else {
      showToast('Auto-delete disabled');
    }
  };

  // Run Immediate Auto-Delete Cleanup
  const handleRunImmediateCleanup = () => {
    const res = HistoryStorageService.runAutoDelete(autoDeleteSettings);
    setItems(HistoryStorageService.getItems());
    setAutoDeleteSettings(res.settings);
    if (res.purgedCount > 0) {
      showToast(`Cleaned ${res.purgedCount} items older than ${autoDeleteSettings.duration}`);
    } else {
      showToast(`No items currently older than ${autoDeleteSettings.duration}`);
    }
  };

  // Toggle Incognito / Pause tracking
  const handleToggleIncognito = () => {
    const nextState = !isIncognito;
    setIsIncognito(nextState);
    HistoryStorageService.setTrackingPaused(nextState);
    showToast(nextState ? 'History tracking paused (Incognito)' : 'History tracking resumed');
  };

  // Reset to Demo Data
  const handleResetData = () => {
    if (window.confirm('Reset history to initial demo timeline?')) {
      HistoryStorageService.resetToDemoData();
      setItems(HistoryStorageService.getItems());
      setAutoDeleteSettings(HistoryStorageService.getAutoDeleteSettings());
      setIsIncognito(false);
      showToast('History reset to initial demo timeline');
    }
  };

  // Filtered & Sorted items computation
  const filteredItems = useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;

    return items
      .filter((item) => {
        // Query search
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchUrl = item.url.toLowerCase().includes(q);
          const matchDomain = item.domain.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchUrl && !matchDomain && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (filterState.category !== 'all' && item.category !== filterState.category) {
          return false;
        }

        // Date range filter
        if (filterState.dateRange === 'today') {
          if (now - item.timestamp > 1 * DAY) return false;
        } else if (filterState.dateRange === 'yesterday') {
          const age = now - item.timestamp;
          if (age <= 1 * DAY || age > 2 * DAY) return false;
        } else if (filterState.dateRange === 'week') {
          if (now - item.timestamp > 7 * DAY) return false;
        } else if (filterState.dateRange === 'month') {
          if (now - item.timestamp > 30 * DAY) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'oldest') {
          return a.timestamp - b.timestamp;
        }
        if (filterState.sortBy === 'most_visited') {
          return b.visitCount - a.visitCount;
        }
        return b.timestamp - a.timestamp;
      });
  }, [items, filterState]);

  // Group items chronologically
  const groupedItems = useMemo(() => {
    const groups: { label: string; items: HistoryItem[] }[] = [];
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;

    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const thisWeekItems: HistoryItem[] = [];
    const thisMonthItems: HistoryItem[] = [];
    const olderItems: HistoryItem[] = [];

    filteredItems.forEach((item) => {
      const age = now - item.timestamp;
      if (age < 1 * DAY) {
        todayItems.push(item);
      } else if (age < 2 * DAY) {
        yesterdayItems.push(item);
      } else if (age < 7 * DAY) {
        thisWeekItems.push(item);
      } else if (age < 30 * DAY) {
        thisMonthItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    if (todayItems.length > 0) groups.push({ label: 'Today', items: todayItems });
    if (yesterdayItems.length > 0) groups.push({ label: 'Yesterday', items: yesterdayItems });
    if (thisWeekItems.length > 0) groups.push({ label: 'Earlier this week', items: thisWeekItems });
    if (thisMonthItems.length > 0) groups.push({ label: 'Earlier this month', items: thisMonthItems });
    if (olderItems.length > 0) groups.push({ label: 'Older (Eligible for auto-delete)', items: olderItems });

    return groups;
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center sm:py-3 antialiased">
      {/* Target Element: Pure Android Mobile Smartphone App Shell */}
      <div className="w-full max-w-md h-screen sm:h-[840px] sm:max-h-[95vh] bg-slate-950 sm:rounded-[44px] sm:ring-8 sm:ring-slate-900 sm:border sm:border-slate-800/80 shadow-2xl shadow-cyan-950/20 flex flex-col overflow-hidden relative">
        {/* Android System Status Bar */}
        <AndroidStatusBar isIncognito={isIncognito} />

        {/* Android Top App Bar */}
        <AndroidHeader
          onOpenClearDialog={() => setIsClearDialogOpen(true)}
          onOpenAutoDeleteModal={() => setIsAutoDeleteModalOpen(true)}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelect={() => {
            setIsMultiSelectMode((prev) => !prev);
            setSelectedIds(new Set());
          }}
          selectedCount={selectedIds.size}
          totalCount={filteredItems.length}
          onSelectAll={handleSelectAll}
          autoDeleteSettings={autoDeleteSettings}
          isIncognito={isIncognito}
          onOpenAppInfo={() => setIsAppInfoOpen(true)}
        />

        {/* Scrollable Android Main Screen Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'history' && (
            <div className="pb-24">
              {/* Android Search & Category Filter Bar */}
              <SearchBar
                filterState={filterState}
                onFilterChange={(updates) => setFilterState((prev) => ({ ...prev, ...updates }))}
                totalFilteredCount={filteredItems.length}
                totalItemsCount={items.length}
              />

              {/* Multi-Select Floating Action Strip */}
              {isMultiSelectMode && selectedIds.size > 0 && (
                <div className="sticky top-2 z-20 mx-4 my-2 p-3 bg-cyan-950/90 border border-cyan-500/50 rounded-2xl backdrop-blur-md flex items-center justify-between shadow-lg animate-fadeIn">
                  <span className="text-xs font-semibold text-cyan-200">
                    {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              {/* Grouped History List */}
              <div className="p-3.5 space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto shadow-inner">
                      <HistoryIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">No History Found</h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                        {filterState.searchQuery
                          ? `No records matching "${filterState.searchQuery}".`
                          : 'No activity logged yet, or auto-delete cleaned older items.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('browser')}
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Watch & Auto-Save</span>
                    </button>
                  </div>
                ) : (
                  groupedItems.map((group) => (
                    <div key={group.label} className="space-y-2">
                      {/* Quiet Unboxed Date Group Header */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-1 pt-1">
                        <span>{group.label}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="font-mono text-[11px] text-slate-500">{group.items.length} items</span>
                      </div>

                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <HistoryCard
                            key={item.id}
                            item={item}
                            searchQuery={filterState.searchQuery}
                            isMultiSelectMode={isMultiSelectMode}
                            isSelected={selectedIds.has(item.id)}
                            onToggleSelect={handleToggleSelect}
                            onDelete={handleDeleteItem}
                            onToggleFavorite={handleToggleFavorite}
                            onOpenDetail={setSelectedDetailItem}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'browser' && (
            <SmartBrowser onLogHistory={handleAddItem} isIncognito={isIncognito} />
          )}

          {activeTab === 'insights' && (
            <AnalyticsView items={items} settings={autoDeleteSettings} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={autoDeleteSettings}
              onOpenAutoDeleteModal={() => setIsAutoDeleteModalOpen(true)}
              isIncognito={isIncognito}
              onToggleIncognito={handleToggleIncognito}
              onResetData={handleResetData}
              onRunImmediateCleanup={handleRunImmediateCleanup}
              onImportSuccess={(msg) => {
                setItems(HistoryStorageService.getItems());
                showToast(msg);
              }}
              items={items}
            />
          )}
        </div>

        {/* Android Floating Action Button (FAB) on History Screen */}
        {activeTab === 'history' && !isMultiSelectMode && (
          <button
            onClick={() => setIsQuickAddModalOpen(true)}
            className="absolute bottom-20 right-4 z-30 w-13 h-13 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-xl shadow-cyan-500/30 flex items-center justify-center transition-all active:scale-90 group"
            title="Quick Save or Log Entry"
          >
            <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          </button>
        )}

        {/* Android Bottom Navigation Bar (Always Pinned at bottom of the phone) */}
        <AndroidNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          historyCount={items.length}
          autoDeleteActive={autoDeleteSettings.enabled && autoDeleteSettings.duration !== 'never'}
        />

        {/* Android Bottom Gesture Navigation Pill */}
        <div className="w-32 h-1 bg-slate-700/80 rounded-full mx-auto my-1.5 shrink-0 pointer-events-none" />
      </div>

      {/* Android Toast Snackbar with Undo */}
      {toastMessage && (
        <div className="fixed bottom-20 z-50 max-w-xs w-[90%] flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md animate-slideUp">
          <span className="text-xs font-medium text-slate-200 truncate">{toastMessage}</span>
          {lastDeletedItem && (
            <button
              onClick={handleUndoDelete}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 shrink-0 transition-colors active:scale-95"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Android Bottom Sheet Dialogs */}
      <ClearHistoryDialog
        isOpen={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
        onConfirmClear={handleConfirmClear}
        totalItems={items.length}
      />

      <AutoDeleteModal
        isOpen={isAutoDeleteModalOpen}
        onClose={() => setIsAutoDeleteModalOpen(false)}
        currentSettings={autoDeleteSettings}
        onSaveSettings={handleSaveAutoDelete}
        onRunImmediateCleanup={handleRunImmediateCleanup}
        items={items}
      />

      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onAdd={handleAddItem}
      />

      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onDelete={handleDeleteItem}
        onToggleFavorite={handleToggleFavorite}
      />

      <AppInfoModal
        isOpen={isAppInfoOpen}
        onClose={() => setIsAppInfoOpen(false)}
      />
    </div>
  );
}
