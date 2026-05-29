import { lookupFood } from '../data/foods';
import type { DailyTargets, Ingredient, Recipe, Unit } from './types';

export function amountToGrams(
  amount: number,
  unit: Unit,
  ingredientName: string,
): number | null {
  if (unit === 'g') return amount;
  if (unit === 'ml') return amount;
  const food = lookupFood(ingredientName);
  if (!food?.gramsPerUnit) return null;
  const g = food.gramsPerUnit[unit as Exclude<Unit, 'g' | 'ml'>];
  if (g === undefined) return null;
  return amount * g;
}

export function macrosFromGrams(
  grams: number,
  ingredientName: string,
): DailyTargets | null {
  const food = lookupFood(ingredientName);
  if (!food) return null;
  const factor = grams / 100;
  return {
    kcal: food.kcalPer100g * factor,
    p: food.pPer100g * factor,
    c: food.cPer100g * factor,
    f: food.fPer100g * factor,
  };
}

export function macrosFromIngredient(ing: Ingredient, amount: number): DailyTargets | null {
  const grams = amountToGrams(amount, ing.unit, ing.name);
  if (grams === null) return null;
  return macrosFromGrams(grams, ing.name);
}

function sumMacros(items: DailyTargets[]): DailyTargets {
  const total = items.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      p: acc.p + m.p,
      c: acc.c + m.c,
      f: acc.f + m.f,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
  return {
    kcal: Math.round(total.kcal),
    p: Math.round(total.p),
    c: Math.round(total.c),
    f: Math.round(total.f),
  };
}

/** Sum macros from ingredient amounts as stored (reference or batch, depending on recipe). */
export function recipeMacrosFromIngredients(recipe: Recipe): DailyTargets | null {
  const parts: DailyTargets[] = [];
  for (const ing of recipe.ingredients) {
    const m = macrosFromIngredient(ing, ing.amount);
    if (!m) return null;
    parts.push(m);
  }
  return sumMacros(parts);
}

export function roundQty(amount: number, unit: Unit): number {
  if (unit === 'g' || unit === 'ml') return Math.round(amount);
  return Math.round(amount * 10) / 10;
}

export function roundGrams(grams: number): number {
  return Math.round(grams);
}
