import { useState, useCallback } from 'react';
import { MealType, GridName, EVENT_GRID_MAPPING } from '../types';
import { GRID_MATRIX, GridDefinition } from '../types/gridMatrix';

export type SelectedPackages = Record<string, Partial<Record<MealType, GridName>>>;

const PACKAGES_KEY = 'wedding_selected_packages';
const GRID_MATRIX_KEY = 'wedding_custom_grid_matrix';

function loadPackages(): SelectedPackages {
  try {
    const raw = localStorage.getItem(PACKAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const defaults: SelectedPackages = {};
  for (const [date, meals] of Object.entries(EVENT_GRID_MAPPING)) {
    defaults[date] = {};
    for (const [meal, grid] of Object.entries(meals)) {
      if (grid) defaults[date][meal as MealType] = grid;
    }
  }
  return defaults;
}

function loadCustomGridMatrix(): Record<string, GridDefinition> | null {
  try {
    const raw = localStorage.getItem(GRID_MATRIX_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function usePackageSelections() {
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackages>(loadPackages);
  const [customGridMatrix, setCustomGridMatrix] = useState<Record<string, GridDefinition> | null>(
    loadCustomGridMatrix
  );

  const activeGridMatrix = customGridMatrix ?? GRID_MATRIX;

  const getPackage = useCallback(
    (date: string, meal: MealType): GridName | null => {
      return selectedPackages[date]?.[meal] ?? null;
    },
    [selectedPackages]
  );

  const setPackage = useCallback((date: string, meal: MealType, gridName: GridName) => {
    setSelectedPackages((prev) => {
      const next = {
        ...prev,
        [date]: {
          ...prev[date],
          [meal]: gridName,
        },
      };
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const uploadGridMatrix = useCallback((matrix: Record<string, GridDefinition>) => {
    setCustomGridMatrix(matrix);
    localStorage.setItem(GRID_MATRIX_KEY, JSON.stringify(matrix));
  }, []);

  const resetGridMatrix = useCallback(() => {
    setCustomGridMatrix(null);
    localStorage.removeItem(GRID_MATRIX_KEY);
  }, []);

  const isCustomGridMatrix = customGridMatrix !== null;

  return {
    selectedPackages,
    getPackage,
    setPackage,
    activeGridMatrix,
    uploadGridMatrix,
    resetGridMatrix,
    isCustomGridMatrix,
  };
}
