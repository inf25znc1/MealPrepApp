import {
  parseAiRecipe,
  parseAiWeekMeals,
  type AiWeekMeals,
} from '../domain/aiPlan';
import type { PackageProduct, Person, Recipe } from '../domain/types';

export interface AiPlanRequestBody {
  people: Array<{
    cals: number;
    diet: Person['diet'];
    excludes: Person['excludes'];
  }>;
  packageProducts: Array<{ name: string; packageQty: number }>;
  favoriteRecipes: Array<{
    name: string;
    meal: Recipe['meal'];
    ingredients: Array<{ name: string; amount: number }>;
  }>;
}

export type AiFetchErrorCode =
  | 'network'
  | 'no_api'
  | 'quota'
  | 'overload'
  | 'api_error'
  | 'invalid_response';

export interface AiFetchResult<T> {
  data: T | null;
  error: AiFetchErrorCode | null;
  message: string | null;
}

function buildRequestBody(
  people: Person[],
  packageProducts: PackageProduct[],
  favoriteRecipes: Recipe[],
): AiPlanRequestBody {
  return {
    people: people.map((p) => ({
      cals: p.cals,
      diet: p.diet,
      excludes: p.excludes,
    })),
    packageProducts: packageProducts.map((p) => ({
      name: p.name,
      packageQty: p.packageQty,
    })),
    favoriteRecipes: favoriteRecipes.map((r) => ({
      name: r.name,
      meal: r.meal,
      ingredients: r.ingredients.map((i) => ({
        name: i.name,
        amount: i.amount,
      })),
    })),
  };
}

async function parseApiError(res: Response): Promise<string | null> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === 'object' && 'error' in data) {
      const err = (data as { error: unknown }).error;
      return typeof err === 'string' ? err : null;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function fetchAiWeekPlan(
  people: Person[],
  packageProducts: PackageProduct[],
  favoriteRecipes: Recipe[],
): Promise<AiFetchResult<AiWeekMeals>> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        buildRequestBody(people, packageProducts, favoriteRecipes),
      ),
    });

    if (res.status === 503) {
      const message = await parseApiError(res);
      if (message === 'GEMINI_OVERLOADED') {
        return { data: null, error: 'overload', message };
      }
      return {
        data: null,
        error: 'no_api',
        message,
      };
    }

    if (res.status === 429) {
      return {
        data: null,
        error: 'quota',
        message: await parseApiError(res),
      };
    }

    if (!res.ok) {
      const message = await parseApiError(res);
      if (message === 'Invalid model response') {
        return { data: null, error: 'invalid_response', message };
      }
      return {
        data: null,
        error: 'api_error',
        message,
      };
    }

    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') {
      return { data: null, error: 'invalid_response', message: null };
    }

    const meals = parseAiWeekMeals((data as { meals?: unknown }).meals);
    if (!meals) {
      return { data: null, error: 'invalid_response', message: null };
    }

    return { data: meals, error: null, message: null };
  } catch {
    return { data: null, error: 'network', message: null };
  }
}

export async function fetchAiMeal(
  people: Person[],
  packageProducts: PackageProduct[],
  favoriteRecipes: Recipe[],
  periodKey: 'A' | 'B',
  periodDays: number,
  mealType: Recipe['meal'],
  avoidNames: string[],
): Promise<Recipe | null> {
  try {
    const res = await fetch('/api/generate-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buildRequestBody(people, packageProducts, favoriteRecipes),
        periodKey,
        periodDays,
        mealType,
        avoidNames,
      }),
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') return null;

    const raw = (data as { recipe?: unknown }).recipe;
    return parseAiRecipe(raw, mealType, periodKey);
  } catch {
    return null;
  }
}
