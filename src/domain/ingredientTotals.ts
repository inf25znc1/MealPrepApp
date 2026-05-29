import { foodKey } from '../data/foods';
import { batchIngredientAmount } from './batch';
import { amountToGrams } from './nutrition';
import type { Person, Plan } from './types';

/** Total grams for one ingredient across the full week (both periods). */
export function weekIngredientGrams(
  plan: Plan,
  people: Person[],
  ingredientName: string,
): number {
  const key = foodKey(ingredientName);
  let total = 0;

  for (const period of [plan.A, plan.B]) {
    for (const slot of Object.values(period.meals)) {
      for (const ing of slot.recipe.ingredients) {
        if (foodKey(ing.name) !== key) continue;
        const batchAmount = batchIngredientAmount(
          ing,
          slot.recipe,
          people,
          period.days,
        );
        const grams = amountToGrams(batchAmount, ing.unit, ing.name);
        if (grams !== null) total += grams;
      }
    }
  }

  return Math.round(total);
}
