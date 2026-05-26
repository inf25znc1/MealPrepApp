import { MEAL_BUDGETS, DIET_MACRO_SPLITS, PORTION_MIN, PORTION_MAX } from '../data/constants';
import type { Person, Recipe, PersonMacros, DailyTargets } from './types';

export function personScale(person: Person, recipe: Recipe): number {
  const mealBudget = MEAL_BUDGETS[recipe.meal] * person.cals;
  const raw = mealBudget / recipe.kcal;
  return Math.min(PORTION_MAX, Math.max(PORTION_MIN, raw));
}

export function personMacros(person: Person, recipe: Recipe): PersonMacros {
  const factor = personScale(person, recipe);
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
