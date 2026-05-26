import type { DietStyle, Exclusion } from '../domain/types';

export const DIETS: DietStyle[] = [
  'balanced',
  'high-protein',
  'mediterranean',
  'vegetarian',
  'low-carb',
];

export const EXCLUSIONS: Exclusion[] = ['pork', 'seafood', 'dairy', 'gluten'];

// Daily kcal distribution across meals
export const MEAL_BUDGETS = {
  breakfast: 0.25,
  lunch: 0.375,
  dinner: 0.375,
} as const;

// Macro split per diet style (P/C/F as fractions of total kcal)
export const DIET_MACRO_SPLITS: Record<DietStyle, { p: number; c: number; f: number }> = {
  balanced: { p: 0.25, c: 0.45, f: 0.3 },
  'high-protein': { p: 0.35, c: 0.4, f: 0.25 },
  'low-carb': { p: 0.3, c: 0.2, f: 0.5 },
  mediterranean: { p: 0.22, c: 0.45, f: 0.33 },
  vegetarian: { p: 0.2, c: 0.5, f: 0.3 },
};

// Portion scaling clamps so portions don't go absurd
export const PORTION_MIN = 0.7;
export const PORTION_MAX = 1.5;

export const STORAGE_KEY = 'mealprep:v1';
