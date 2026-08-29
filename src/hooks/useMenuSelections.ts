import { useState, useCallback, useEffect } from 'react';
import { MealType } from '../types';

export type UserSelections = Record<string, Partial<Record<MealType, Record<string, string[]>>>>;

const STORAGE_KEY = 'wedding_menu_selections';
const HISTORY_KEY = 'wedding_menu_history';

export interface SavedVersion {
  timestamp: number;
  label: string;
  selections: UserSelections;
}

function loadFromStorage(): UserSelections {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadHistory(): SavedVersion[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useMenuSelections(baseSelections: Record<string, Record<string, string[]>>) {
  const [selections, setSelections] = useState<UserSelections>(loadFromStorage);
  const [history, setHistory] = useState<SavedVersion[]>(loadHistory);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(() => {
    const h = loadHistory();
    return h.length > 0 ? h[h.length - 1].timestamp : null;
  });

  const getSelection = useCallback(
    (date: string, meal: MealType, category: string): string[] => {
      return selections[date]?.[meal]?.[category] ?? baseSelections[date]?.[meal]?.[category] ?? [];
    },
    [selections, baseSelections]
  );

  const setMealCategoryItems = useCallback(
    (date: string, meal: MealType, category: string, items: string[]) => {
      setSelections((prev) => ({
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: {
            ...prev[date]?.[meal],
            [category]: items,
          },
        },
      }));
      setIsDirty(true);
    },
    []
  );

  const save = useCallback(() => {
    const now = Date.now();
    const label = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    const newVersion: SavedVersion = { timestamp: now, label, selections };
    const updated = [...history.slice(-9), newVersion];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
    setLastSaved(now);
    setIsDirty(false);
    return label;
  }, [selections, history]);

  const undoLastChange = useCallback(() => {
    if (history.length < 2) return false;
    const prev = history[history.length - 2];
    setSelections(prev.selections);
    const truncated = history.slice(0, -1);
    setHistory(truncated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev.selections));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(truncated));
    return true;
  }, [history]);

  const resetToOriginal = useCallback((date: string, meal: MealType) => {
    const original = baseSelections[date]?.[meal] ?? {};
    setSelections((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [meal]: { ...original },
      },
    }));
    setIsDirty(true);
  }, [baseSelections]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(selections, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding_menu_selections.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [selections]);

  return {
    selections,
    getSelection,
    setMealCategoryItems,
    save,
    undoLastChange,
    resetToOriginal,
    exportJSON,
    isDirty,
    lastSaved,
    history,
    canUndo: history.length >= 2,
  };
}
