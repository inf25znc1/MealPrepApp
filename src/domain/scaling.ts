import { DIET_MACRO_SPLITS } from '../data/constants';
import {
  batchMacros,
  personCalorieShare,
  personMealCalorieTarget,
} from './batch';
import type { Person, Recipe, PersonMacros, DailyTargets } from './types';

function scaleMacrosToKcal(
  macros: DailyTargets,
  targetKcal: number,
): DailyTargets {
  if (targetKcal <= 0) return macros;
  if (macros.kcal <= 0) {
    return { kcal: Math.round(targetKcal), p: 0, c: 0, f: 0 };
  }
  const factor = targetKcal / macros.kcal;
  return {
    kcal: Math.round(targetKcal),
    p: Math.round(macros.p * factor),
    c: Math.round(macros.c * factor),
    f: Math.round(macros.f * factor),
  };
}

export function personMacros(
  person: Person,
  recipe: Recipe,
  people: Person[],
  days: number,
): PersonMacros {
  const share = personCalorieShare(person, people, recipe.meal);
  const targetMeal = personMealCalorieTarget(person, recipe.meal);
  const batch = batchMacros(recipe, people, days);

  if (batch && days > 0) {
    const raw: DailyTargets = {
      kcal: (batch.kcal * share) / days,
      p: (batch.p * share) / days,
      c: (batch.c * share) / days,
      f: (batch.f * share) / days,
    };
    const scaled = scaleMacrosToKcal(raw, targetMeal);
    return {
      factor: share,
      kcal: scaled.kcal,
      p: scaled.p,
      c: scaled.c,
      f: scaled.f,
    };
  }

  const d = Math.max(days, 1);
  const raw: DailyTargets = {
    kcal: (recipe.kcal * share) / d,
    p: (recipe.p * share) / d,
    c: (recipe.c * share) / d,
    f: (recipe.f * share) / d,
  };
  const scaled = scaleMacrosToKcal(raw, targetMeal);
  return {
    factor: share,
    kcal: scaled.kcal,
    p: scaled.p,
    c: scaled.c,
    f: scaled.f,
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
