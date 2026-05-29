import { recipeMacrosFromIngredients } from './nutrition';
import type { Ingredient, MealType, Recipe } from './types';

export function isStoredFavoriteId(id: string): boolean {
  return id.startsWith('fav-') || id.startsWith('custom-');
}

export function newFavoriteId(prefix: 'fav' | 'custom'): string {
  return `${prefix}-${Date.now()}`;
}

/** Deep copy for localStorage; assign a stable favorite id when saving from the plan. */
export function cloneRecipeForFavorite(recipe: Recipe): Recipe {
  const id = isStoredFavoriteId(recipe.id)
    ? recipe.id
    : newFavoriteId('fav');
  return {
    ...recipe,
    id,
    mealPrep: true,
    ingredients: recipe.ingredients.map((i) => ({ ...i })),
    steps: [...recipe.steps],
  };
}

export function favoriteDisplayName(recipe: Recipe): string {
  return recipe.name;
}

export function createCustomRecipeDraft(meal: MealType = 'lunch'): Recipe {
  return {
    id: newFavoriteId('custom'),
    name: '',
    meal,
    kcal: 0,
    p: 0,
    c: 0,
    f: 0,
    tags: ['balanced'],
    excl: [],
    mealPrep: true,
    ingredients: [],
    steps: [],
  };
}

export function syncRecipeMacros(recipe: Recipe): Recipe {
  const macros = recipeMacrosFromIngredients(recipe);
  if (!macros) return recipe;
  return {
    ...recipe,
    kcal: Math.round(macros.kcal),
    p: Math.round(macros.p),
    c: Math.round(macros.c),
    f: Math.round(macros.f),
  };
}

export function parseStepsText(text: string): string[] {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function stepsToText(steps: string[]): string {
  return steps.join('\n');
}

export function isValidFavoriteRecipe(recipe: Recipe): boolean {
  return (
    recipe.name.trim().length > 0 &&
    recipe.ingredients.length > 0 &&
    recipe.steps.length > 0
  );
}

export function normalizeIngredient(
  name: string,
  amountGrams: number,
): Ingredient {
  return { name: name.trim(), unit: 'g', amount: amountGrams };
}
