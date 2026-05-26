import { personScale } from './scaling';
import { amountToGrams, roundGrams, roundQty } from './nutrition';
import type { Ingredient, Person, Recipe, Unit } from './types';

/** Total raw weight (g) for one person's share of a single batch cook. */
export function personMealPortionGrams(person: Person, recipe: Recipe): number | null {
  let total = 0;
  for (const ing of recipe.ingredients) {
    const scale = personScale(person, recipe);
    const grams = amountToGrams(ing.amount * scale, ing.unit, ing.name);
    if (grams === null) return null;
    total += grams;
  }
  return roundGrams(total);
}

/** Total raw weight (g) for the full household batch (one cook). */
export function batchMealTotalGrams(recipe: Recipe, people: Person[]): number | null {
  let total = 0;
  for (const ing of recipe.ingredients) {
    let batchAmount = 0;
    for (const person of people) {
      batchAmount += ing.amount * personScale(person, recipe);
    }
    const grams = amountToGrams(batchAmount, ing.unit, ing.name);
    if (grams === null) return null;
    total += grams;
  }
  return roundGrams(total);
}

export interface IngredientPortionLine {
  name: string;
  unit: Unit;
  /** Active person's share from one batch cook (recipe units). */
  perPersonAmount: number;
  perPersonGrams: number | null;
  /** Whole household batch for one cook (recipe units). */
  batchTotalAmount: number;
  batchTotalGrams: number | null;
  /** All containers for the period (batch × days). */
  periodTotalAmount: number;
  periodTotalGrams: number | null;
}

function scaledAmount(
  baseAmount: number,
  unit: Unit,
  name: string,
  scale: number,
): { amount: number; grams: number | null } {
  const amount = roundQty(baseAmount * scale, unit);
  const grams = amountToGrams(amount, unit, name);
  return { amount, grams: grams !== null ? roundGrams(grams) : null };
}

/**
 * Batch model: cook one batch, divide into per-person portions.
 * Base ingredient amounts are per reference serving; each person gets
 * base × personScale; batch total is the sum of all shares.
 */
export function mealIngredientPortions(
  recipe: Recipe,
  people: Person[],
  days: number,
  activePersonId: string,
): IngredientPortionLine[] {
  return recipe.ingredients.map((ing) => {
    let batchAmount = 0;
    let batchGrams = 0;
    let hasAllGrams = true;
    let perPersonAmount = 0;
    let perPersonGrams: number | null = null;

    for (const person of people) {
      const scale = personScale(person, recipe);
      const { amount, grams } = scaledAmount(ing.amount, ing.unit, ing.name, scale);
      batchAmount += amount;
      if (grams !== null) batchGrams += grams;
      else hasAllGrams = false;
      if (person.id === activePersonId) {
        perPersonAmount = amount;
        perPersonGrams = grams;
      }
    }

    return {
      name: ing.name,
      unit: ing.unit,
      perPersonAmount,
      perPersonGrams,
      batchTotalAmount: roundQty(batchAmount, ing.unit),
      batchTotalGrams: hasAllGrams ? roundGrams(batchGrams) : null,
      periodTotalAmount: roundQty(batchAmount * days, ing.unit),
      periodTotalGrams: hasAllGrams ? roundGrams(batchGrams * days) : null,
    };
  });
}

/** Per-person lines for one ingredient (for detail sheet). */
export function personIngredientPortions(
  ing: Ingredient,
  recipe: Recipe,
  people: Person[],
): Array<{
  personId: string;
  amount: number;
  grams: number | null;
  unit: Unit;
}> {
  return people.map((person) => {
    const scale = personScale(person, recipe);
    const { amount, grams } = scaledAmount(ing.amount, ing.unit, ing.name, scale);
    return { personId: person.id, amount, grams, unit: ing.unit };
  });
}
