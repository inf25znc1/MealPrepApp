import { DIETS, EXCLUSIONS, MEAL_TYPES } from '../data/constants';
import { syncRecipeMacros } from './favorites';
import { recipeMacrosFromIngredients } from './nutrition';
import { PERIOD_A_META, PERIOD_B_META } from '../data/periods';
import type {
  DietStyle,
  Exclusion,
  MealType,
  Period,
  PeriodKey,
  Plan,
  Recipe,
} from './types';

export type AiWeekMeals = Record<
  PeriodKey,
  Partial<Record<MealType, Recipe>>
>;

const PERIOD_META = { A: PERIOD_A_META, B: PERIOD_B_META } as const;

function isDietStyle(v: string): v is DietStyle {
  return (DIETS as string[]).includes(v);
}

function isExclusion(v: string): v is Exclusion {
  return (EXCLUSIONS as string[]).includes(v);
}

function newGeneratedId(period: PeriodKey, meal: MealType): string {
  return `gen-${period}-${meal}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseIngredients(raw: unknown): Recipe['ingredients'] {
  if (!Array.isArray(raw)) return [];
  const out: Recipe['ingredients'] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const amount = Number(row.amount);
    if (!name || !Number.isFinite(amount) || amount <= 0) continue;
    out.push({ name, unit: 'g', amount: Math.round(amount) });
  }
  return out;
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTags(raw: unknown): DietStyle[] {
  const tags = parseStringArray(raw).filter(isDietStyle);
  return tags.length > 0 ? tags : ['balanced'];
}

function parseExcl(raw: unknown): Exclusion[] {
  return parseStringArray(raw).filter(isExclusion);
}

/** Normalize one AI recipe object for a meal slot. */
export function parseAiRecipe(
  raw: unknown,
  meal: MealType,
  period: PeriodKey,
): Recipe | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  const ingredients = parseIngredients(obj.ingredients);
  const steps = parseStringArray(obj.steps);
  if (!name || ingredients.length === 0 || steps.length === 0) return null;

  let recipe: Recipe = {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : newGeneratedId(period, meal),
    name,
    meal,
    kcal: 0,
    p: 0,
    c: 0,
    f: 0,
    tags: parseTags(obj.tags),
    excl: parseExcl(obj.excl),
    mealPrep: true,
    ingredients,
    steps,
  };

  const macros = recipeMacrosFromIngredients(recipe);
  if (macros) {
    recipe = {
      ...recipe,
      kcal: Math.round(macros.kcal),
      p: Math.round(macros.p),
      c: Math.round(macros.c),
      f: Math.round(macros.f),
    };
  } else {
    recipe = {
      ...recipe,
      kcal: Math.round(Number(obj.kcal) || 400),
      p: Math.round(Number(obj.p) || 25),
      c: Math.round(Number(obj.c) || 40),
      f: Math.round(Number(obj.f) || 15),
    };
  }

  return syncRecipeMacros(recipe);
}

export function parseAiWeekMeals(raw: unknown): AiWeekMeals | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const result: AiWeekMeals = { A: {}, B: {} };
  let count = 0;

  for (const periodKey of ['A', 'B'] as const) {
    const period = root[periodKey];
    if (!period || typeof period !== 'object') continue;
    const periodObj = period as Record<string, unknown>;

    for (const mealType of MEAL_TYPES) {
      const recipe = parseAiRecipe(periodObj[mealType], mealType, periodKey);
      if (recipe) {
        result[periodKey][mealType] = recipe;
        count += 1;
      }
    }
  }

  return count === 8 ? result : null;
}

function buildPeriodFromAi(
  periodKey: PeriodKey,
  existingMeals: Period['meals'] | null,
  aiMeals: Partial<Record<MealType, Recipe>>,
): Period {
  const meta = PERIOD_META[periodKey];
  const meals = {} as Period['meals'];

  for (const mealType of MEAL_TYPES) {
    const existing = existingMeals?.[mealType];
    if (existing?.locked) {
      meals[mealType] = {
        recipe: {
          ...existing.recipe,
          ingredients: existing.recipe.ingredients.map((i) => ({ ...i })),
          steps: [...existing.recipe.steps],
        },
        locked: true,
      };
      continue;
    }

    const ai = aiMeals[mealType];
    if (!ai) {
      throw new Error(`Missing AI recipe for period ${periodKey} ${mealType}`);
    }

    meals[mealType] = {
      recipe: {
        ...ai,
        meal: mealType,
        ingredients: ai.ingredients.map((i) => ({ ...i })),
        steps: [...ai.steps],
      },
      locked: false,
    };
  }

  return { ...meta, meals };
}

export function buildPlanFromAiMeals(
  existingPlan: Plan | null,
  aiMeals: AiWeekMeals,
): Plan {
  return {
    A: buildPeriodFromAi('A', existingPlan?.A.meals ?? null, aiMeals.A ?? {}),
    B: buildPeriodFromAi('B', existingPlan?.B.meals ?? null, aiMeals.B ?? {}),
  };
}

export function aiPlanRequestSummary(favorites: Recipe[]): string {
  if (favorites.length === 0) return '[]';
  return JSON.stringify(
    favorites.slice(0, 12).map((r) => ({
      name: r.name,
      meal: r.meal,
      ingredients: r.ingredients.map((i) => ({
        name: i.name,
        amount: i.amount,
      })),
    })),
  );
}
