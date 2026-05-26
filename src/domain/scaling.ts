import { MEAL_BUDGETS, DIET_MACRO_SPLITS, PORTION_MIN, PORTION_MAX } from '../data/constants';
import { macrosFromIngredient, recipeMacrosFromIngredients } from './nutrition';
import type { Person, Recipe, PersonMacros, DailyTargets } from './types';

function referenceKcal(recipe: Recipe): number {
  const fromIngredients = recipeMacrosFromIngredients(recipe);
  return fromIngredients?.kcal ?? recipe.kcal;
}

export function personScale(person: Person, recipe: Recipe): number {
  const mealBudget = MEAL_BUDGETS[recipe.meal] * person.cals;
  const baseKcal = referenceKcal(recipe);
  const raw = mealBudget / baseKcal;
  return Math.min(PORTION_MAX, Math.max(PORTION_MIN, raw));
}

export function personMacros(person: Person, recipe: Recipe): PersonMacros {
  const factor = personScale(person, recipe);
  const parts: DailyTargets[] = [];

  for (const ing of recipe.ingredients) {
    const m = macrosFromIngredient(ing, ing.amount * factor);
    if (m) parts.push(m);
  }

  if (parts.length === recipe.ingredients.length) {
    const total = parts.reduce(
      (acc, m) => ({
        kcal: acc.kcal + m.kcal,
        p: acc.p + m.p,
        c: acc.c + m.c,
        f: acc.f + m.f,
      }),
      { kcal: 0, p: 0, c: 0, f: 0 },
    );
    return {
      factor,
      kcal: Math.round(total.kcal),
      p: Math.round(total.p),
      c: Math.round(total.c),
      f: Math.round(total.f),
    };
  }

  return {
    factor,
    kcal: Math.round(recipe.kcal * factor),
    p: Math.round(recipe.p * factor),
    c: Math.round(recipe.c * factor),
    f: Math.round(recipe.f * factor),
  };
}

export function dailyTargetFor(person: Person): DailyTargets {
  const split = DIET_MACRO_SPLITS[person.diet];
  const kcal = Math.round(person.cals);
  return {
    kcal,
    p: Math.round((kcal * split.p) / 4),
    c: Math.round((kcal * split.c) / 4),
    f: Math.round((kcal * split.f) / 9),
  };
}
