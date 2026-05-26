import { MEAL_TYPES } from '../data/constants';
import type { MealType, PeriodKey } from './types';

/** Optional Gemini-selected recipe ids per period and meal slot. */
export type MealPicks = Partial<
  Record<PeriodKey, Partial<Record<MealType, string>>>
>;

export function parseMealPicks(raw: unknown): MealPicks | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const result: MealPicks = {};

  for (const periodKey of ['A', 'B'] as const) {
    const period = root[periodKey];
    if (!period || typeof period !== 'object') continue;
    const periodObj = period as Record<string, unknown>;
    const slotPicks: Partial<Record<MealType, string>> = {};

    for (const mealType of MEAL_TYPES) {
      const id = periodObj[mealType];
      if (typeof id === 'string' && id.length > 0) {
        slotPicks[mealType] = id;
      }
    }

    if (Object.keys(slotPicks).length > 0) {
      result[periodKey] = slotPicks;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}
