export type MealType = 'High Tea' | 'Lunch' | 'Dinner';
export type ViewMode = 'final' | 'full';

export const MEAL_TYPES: MealType[] = ['High Tea', 'Lunch', 'Dinner'];

export const MEAL_ICONS: Record<MealType, string> = {
  'High Tea': '☕',
  'Lunch': '🍽️',
  'Dinner': '🌙',
};

export interface MealData {
  selection: Record<string, string[]>;
}

export interface EventDay {
  date: string;
  meals: Partial<Record<MealType, MealData>>;
}

export interface MenuMeta {
  event_name: string;
  venue: string;
  is_veg: boolean;
  finalized: boolean;
}

export interface MenuData {
  meta: MenuMeta;
  catalog: Record<string, string[]>;
  events: EventDay[];
  limits: Record<string, number>;
}

export type GridName = 'High Tea' | 'Grid 1' | 'Grid 2' | 'Grid 3';
export type ValidationState = 'ok' | 'warning' | 'exceeded' | 'none' | 'fixed' | 'blocked';

export interface CategoryValidation {
  state: ValidationState;
  selected: number;
  limit: number | null;
  excess: number;
  gridName: GridName | null;
  fixedItems?: string[];
  breakdown?: Record<string, number>;
  includesPaneer?: number;
  isBlocked?: boolean;
}

export const EVENT_GRID_MAPPING: Record<string, Partial<Record<MealType, GridName | null>>> = {
  '19 April': {
    'Lunch': 'Grid 2',
    'Dinner': 'Grid 2',
    'High Tea': 'High Tea',
  },
  '20 April': {
    'Lunch': 'Grid 2',
    'Dinner': 'Grid 2',
    'High Tea': 'High Tea',
  },
};

export function getGridForMeal(date: string, meal: MealType): GridName | null {
  return EVENT_GRID_MAPPING[date]?.[meal] ?? null;
}

export { GRID_MATRIX, getGridDef, getCategoryConfig } from './gridMatrix';
export type { GridDefinition, CategoryGridConfig } from './gridMatrix';

import { getCategoryConfig, GridDefinition } from './gridMatrix';
import { GRID_MATRIX } from './gridMatrix';

export function validateCategoryWithGrid(
  category: string,
  selectedItems: string[],
  gridName: GridName | null,
  gridMatrix?: Record<string, GridDefinition>
): CategoryValidation {
  const matrix = gridMatrix ?? GRID_MATRIX;
  const config = gridName ? (matrix[gridName]?.categories[category] ?? null) : null;

  if (!config) {
    return { state: 'none', selected: selectedItems.length, limit: null, excess: 0, gridName };
  }

  const { limit, fixed, breakdown, includesPaneer } = config;
  const selected = selectedItems.length;

  if (limit === 0) {
    return {
      state: 'blocked',
      selected,
      limit: 0,
      excess: selected,
      gridName,
      isBlocked: true,
    };
  }

  if (fixed && fixed.length > 0) {
    return {
      state: 'fixed',
      selected,
      limit: null,
      excess: 0,
      gridName,
      fixedItems: fixed,
    };
  }

  const excess = Math.max(0, selected - limit);
  const state: ValidationState =
    excess > 0 ? 'exceeded' : selected === limit ? 'warning' : 'ok';

  return {
    state,
    selected,
    limit,
    excess,
    gridName,
    breakdown,
    includesPaneer,
  };
}

export function validateCategory(
  category: string,
  selectedItems: string[],
  date: string,
  meal: MealType
): CategoryValidation {
  const gridName = getGridForMeal(date, meal);
  return validateCategoryWithGrid(category, selectedItems, gridName);
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Welcome Drinks': '🥤',
  'Mocktails/Juices': '🥤',
  'Snacks': '🍢',
  'Soup': '🥣',
  'Soup Accompaniments': '🥄',
  'Salads': '🥗',
  'Papad': '🫙',
  'Raita': '🥛',
  'Main Course': '🍛',
  'Paneer': '🧀',
  'Vegetables': '🥦',
  'Dal': '🫘',
  'Rice': '🍚',
  'Breads': '🫓',
  'Desserts': '🍮',
  'Hot Desserts': '🍮',
  'Cold Desserts': '🧁',
  'Ice Cream': '🍦',
  'Live Counter': '👨‍🍳',
  'Live Counters': '👨‍🍳',
  'Beverages': '☕',
  'Accompaniments': '🫙',
};

export const GRID_COLORS: Record<GridName, { bg: string; text: string; border: string; badge: string }> = {
  'High Tea': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  'Grid 1': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  'Grid 2': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },
  'Grid 3': {
    bg: 'bg-violet-50',
    text: 'text-violet-800',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700 border-violet-300',
  },
};

export const ALL_GRID_NAMES: GridName[] = ['Grid 1', 'Grid 2', 'Grid 3', 'High Tea'];
