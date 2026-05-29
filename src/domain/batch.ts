import { MEAL_BUDGETS, PORTION_MIN, PORTION_MAX } from '../data/constants';
import { DIET_MACRO_SPLITS } from '../data/constants';
import {
  macrosFromIngredient,
  recipeMacrosFromIngredients,
} from './nutrition';
import type { DailyTargets, Ingredient, MealType, Person, Recipe } from './types';

/** Target kcal for one person in one meal slot (one day). */
export function personMealCalorieTarget(
  person: Person,
  meal: MealType,
): number {
  return MEAL_BUDGETS[meal] * person.cals;
}

/** Kcal weight for one person in one meal slot (before period days). */
export function mealCalorieWeight(person: Person, meal: MealType): number {
  return personMealCalorieTarget(person, meal);
}

/** Share of household calories for this meal (sums to 1). */
export function personCalorieShare(
  person: Person,
  people: Person[],
  meal: MealType,
): number {
  const total = people.reduce((s, p) => s + mealCalorieWeight(p, meal), 0);
  if (total <= 0) return 1 / Math.max(people.length, 1);
  return mealCalorieWeight(person, meal) / total;
}

/** Target total kcal for one batch cook (all people × all days in period). */
export function batchTargetKcal(
  people: Person[],
  meal: MealType,
  days: number,
): number {
  const dailyHousehold = people.reduce(
    (s, p) => s + mealCalorieWeight(p, meal),
    0,
  );
  return dailyHousehold * days;
}

function referenceKcal(recipe: Recipe): number {
  const fromIngredients = recipeMacrosFromIngredients(recipe);
  return fromIngredients?.kcal ?? recipe.kcal;
}

/** Legacy per-person scale (reference serving → daily portion). */
function referencePersonScale(person: Person, recipe: Recipe): number {
  const mealBudget = MEAL_BUDGETS[recipe.meal] * person.cals;
  const baseKcal = referenceKcal(recipe);
  if (baseKcal <= 0) return 1;
  const raw = mealBudget / baseKcal;
  return Math.min(PORTION_MAX, Math.max(PORTION_MIN, raw));
}

/** AI plans use batch totals; older catalog/favorites use one-person reference amounts. */
export function isReferenceServing(
  recipe: Recipe,
  people: Person[],
  days: number,
): boolean {
  if (recipe.id.startsWith('gen-')) return false;

  const batch = recipeMacrosFromIngredients(recipe);
  if (!batch) return !recipe.id.startsWith('gen-');

  const target = batchTargetKcal(people, recipe.meal, days);
  if (target <= 0) return false;
  return batch.kcal < target * 0.65;
}

/** Total raw amount for one ingredient in the period batch (grams or other unit). */
export function batchIngredientAmount(
  ing: Ingredient,
  recipe: Recipe,
  people: Person[],
  days: number,
): number {
  if (!isReferenceServing(recipe, people, days)) {
    return ing.amount;
  }

  let dailyAllPeople = 0;
  for (const person of people) {
    dailyAllPeople += ing.amount * referencePersonScale(person, recipe);
  }
  return dailyAllPeople * days;
}

function macrosFromDietSplit(kcal: number, diet: Person['diet']): DailyTargets {
  const split = DIET_MACRO_SPLITS[diet];
  return {
    kcal: Math.round(kcal),
    p: Math.round((kcal * split.p) / 4),
    c: Math.round((kcal * split.c) / 4),
    f: Math.round((kcal * split.f) / 9),
  };
}

/** Macros for the full period batch (all people, all days). */
export function batchMacros(
  recipe: Recipe,
  people: Person[],
  days: number,
): DailyTargets | null {
  const parts: DailyTargets[] = [];
  let unknownGrams = 0;

  for (const ing of recipe.ingredients) {
    const total = batchIngredientAmount(ing, recipe, people, days);
    const m = macrosFromIngredient(ing, total);
    if (m) parts.push(m);
    else if (ing.unit === 'g' || ing.unit === 'ml') unknownGrams += total;
  }

  const target = batchTargetKcal(people, recipe.meal, days);
  const leadDiet = people[0]?.diet ?? 'balanced';

  if (parts.length === 0) {
    if (target <= 0) return null;
    return macrosFromDietSplit(target, leadDiet);
  }

  const known = parts.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      p: acc.p + m.p,
      c: acc.c + m.c,
      f: acc.f + m.f,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  if (unknownGrams <= 0) {
    return {
      kcal: Math.round(known.kcal),
      p: Math.round(known.p),
      c: Math.round(known.c),
      f: Math.round(known.f),
    };
  }

  const remaining = Math.max(0, target - known.kcal);
  const filler = macrosFromDietSplit(remaining, leadDiet);
  return {
    kcal: Math.round(known.kcal + filler.kcal),
    p: Math.round(known.p + filler.p),
    c: Math.round(known.c + filler.c),
    f: Math.round(known.f + filler.f),
  };
}

/** One person's daily share of the batch for one ingredient. */
export function personDailyIngredientAmount(
  ing: Ingredient,
  person: Person,
  people: Person[],
  recipe: Recipe,
  days: number,
): number {
  const batchTotal = batchIngredientAmount(ing, recipe, people, days);
  const share = personCalorieShare(person, people, recipe.meal);
  if (days <= 0) return 0;
  return (batchTotal * share) / days;
}
