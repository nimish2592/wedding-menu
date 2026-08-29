export interface CategoryGridConfig {
  limit: number;
  fixed?: string[];
  breakdown?: Record<string, number>;
  includesPaneer?: number;
}

export interface GridDefinition {
  price?: number;
  isEditable?: boolean;
  type?: 'standard' | 'fixed';
  categories: Record<string, CategoryGridConfig>;
}

export const GRID_MATRIX: Record<string, GridDefinition> = {
  'High Tea': {
    isEditable: true,
    type: 'standard',
    categories: {
      'Welcome Drinks': { limit: 1 },
      'Snacks': { limit: 1 },
      'Beverages': { limit: 99, fixed: ['Tea', 'Coffee'] },
      'Accompaniments': { limit: 99, fixed: ['Cookies'] },
    },
  },
  'Grid 1': {
    price: 1250,
    categories: {
      'Mocktails/Juices': { limit: 1 },
      'Welcome Drinks': { limit: 1 },
      'Snacks': { limit: 2 },
      'Soup': { limit: 1 },
      'Soup Accompaniments': { limit: 0 },
      'Salads': { limit: 3 },
      'Papad': { limit: 1 },
      'Raita': { limit: 1 },
      'Main Course': { limit: 3, includesPaneer: 1 },
      'Paneer': { limit: 1 },
      'Vegetables': { limit: 2 },
      'Dal': { limit: 1 },
      'Rice': { limit: 1 },
      'Breads': { limit: 3 },
      'Desserts': { limit: 1 },
      'Hot Desserts': { limit: 1 },
      'Cold Desserts': { limit: 0 },
      'Ice Cream': { limit: 1 },
      'Live Counter': { limit: 1 },
    },
  },
  'Grid 2': {
    price: 1350,
    categories: {
      'Mocktails/Juices': { limit: 2 },
      'Welcome Drinks': { limit: 2 },
      'Snacks': { limit: 2 },
      'Soup': { limit: 2 },
      'Soup Accompaniments': { limit: 2 },
      'Salads': { limit: 4 },
      'Papad': { limit: 1 },
      'Raita': { limit: 1 },
      'Main Course': { limit: 4, includesPaneer: 1 },
      'Paneer': { limit: 1 },
      'Vegetables': { limit: 3 },
      'Dal': { limit: 1 },
      'Rice': { limit: 1 },
      'Breads': { limit: 4 },
      'Desserts': { limit: 2 },
      'Hot Desserts': { limit: 2 },
      'Cold Desserts': { limit: 2 },
      'Ice Cream': { limit: 1 },
      'Live Counter': {
        limit: 2,
        breakdown: { 'Chaat': 2, 'Speciality': 1 },
      },
    },
  },
  'Grid 3': {
    price: 1500,
    categories: {
      'Mocktails/Juices': { limit: 2 },
      'Welcome Drinks': { limit: 2 },
      'Snacks': { limit: 3 },
      'Soup': { limit: 2 },
      'Soup Accompaniments': { limit: 2 },
      'Salads': { limit: 5 },
      'Papad': { limit: 1 },
      'Raita': { limit: 2 },
      'Main Course': { limit: 5, includesPaneer: 1 },
      'Paneer': { limit: 1 },
      'Vegetables': { limit: 4 },
      'Dal': { limit: 2 },
      'Rice': {
        limit: 2,
        breakdown: { 'Veg Rice': 1, 'Veg Biryani': 1 },
      },
      'Breads': { limit: 5 },
      'Desserts': { limit: 3 },
      'Hot Desserts': { limit: 3 },
      'Cold Desserts': { limit: 2 },
      'Ice Cream': { limit: 2 },
      'Live Counter': {
        limit: 3,
        breakdown: { 'Chaat': 3, 'Speciality': 2 },
      },
    },
  },
};

export function getGridDef(gridName: string | null): GridDefinition | null {
  if (!gridName) return null;
  return GRID_MATRIX[gridName] ?? null;
}

export function getCategoryConfig(
  gridName: string | null,
  category: string
): CategoryGridConfig | null {
  if (!gridName) return null;
  return GRID_MATRIX[gridName]?.categories[category] ?? null;
}
