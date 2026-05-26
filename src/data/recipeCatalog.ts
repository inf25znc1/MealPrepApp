import { RECIPES } from './recipes';

/** Compact catalog for Gemini prompts and API validation. */
export function recipeCatalogForPrompt() {
  return RECIPES.map((r) => ({
    id: r.id,
    meal: r.meal,
    tags: r.tags,
    excl: r.excl,
    kcal: r.kcal,
  }));
}

export const RECIPE_IDS = new Set(RECIPES.map((r) => r.id));
