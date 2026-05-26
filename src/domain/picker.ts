import { MEAL_TYPES } from '../data/constants';
import type {
  Person,
  Recipe,
  MealType,
  Period,
  PeriodKey,
  Plan,
  Exclusion,
  MealSlot,
} from './types';

export type PeriodMeta = Pick<
  Period,
  'label' | 'key' | 'days' | 'dayList' | 'cookDay' | 'eatRange'
>;

export function allExcludes(people: Person[]): Exclusion[] {
  const set = new Set<Exclusion>();
  for (const person of people) {
    for (const ex of person.excludes) {
      set.add(ex);
    }
  }
  return [...set];
}

function recipeMatchesDiet(recipe: Recipe, people: Person[]): boolean {
  return people.some((p) => recipe.tags.includes(p.diet));
}

function isExcluded(recipe: Recipe, excludes: Exclusion[]): boolean {
  return recipe.excl.some((e) => excludes.includes(e));
}

export function pickRecipe(
  meal: MealType,
  used: Set<string>,
  people: Person[],
  recipes: Recipe[],
): Recipe {
  const excludes = allExcludes(people);
  let pool = recipes.filter(
    (r) => r.meal === meal && !isExcluded(r, excludes),
  );

  if (pool.length === 0) {
    throw new Error(
      `No recipes available for ${meal} with current household exclusions.`,
    );
  }

  const dietMatch = pool.filter((r) => recipeMatchesDiet(r, people));
  if (dietMatch.length > 0) pool = dietMatch;

  const unused = pool.filter((r) => !used.has(r.id));
  if (unused.length > 0) pool = unused;

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function buildPeriod(
  meta: PeriodMeta,
  existingMeals: Period['meals'] | null,
  people: Person[],
  recipes: Recipe[],
): Period {
  const used = new Set<string>();
  const meals = {} as Period['meals'];

  for (const mealType of MEAL_TYPES) {
    const existing = existingMeals?.[mealType];
    if (existing?.locked) {
      meals[mealType] = { recipe: existing.recipe, locked: true };
      used.add(existing.recipe.id);
    }
  }

  for (const mealType of MEAL_TYPES) {
    if (meals[mealType]) continue;
    const recipe = pickRecipe(mealType, used, people, recipes);
    used.add(recipe.id);
    meals[mealType] = { recipe, locked: false };
  }

  return { ...meta, meals };
}

export function rerollMeal(
  plan: Plan,
  periodKey: PeriodKey,
  mealType: MealType,
  people: Person[],
  recipes: Recipe[],
): Plan {
  const period = plan[periodKey];
  const slot = period.meals[mealType];
  if (slot.locked) return plan;

  const used = new Set<string>();
  for (const pk of ['A', 'B'] as const) {
    for (const mt of MEAL_TYPES) {
      if (pk === periodKey && mt === mealType) continue;
      used.add(plan[pk].meals[mt].recipe.id);
    }
  }

  const recipe = pickRecipe(mealType, used, people, recipes);
  const newSlot: MealSlot = { recipe, locked: false };
  const newPeriod: Period = {
    ...period,
    meals: { ...period.meals, [mealType]: newSlot },
  };
  return { ...plan, [periodKey]: newPeriod };
}
