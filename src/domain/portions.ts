import { personScale } from './scaling';
import { amountToGrams, roundGrams, roundQty } from './nutrition';
import type { Ingredient, Person, Recipe, Unit } from './types';

/** Raw weight (g) for one person's single meal (one container). */
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

export interface PersonPortionCell {
  personId: string;
  amount: number;
  grams: number | null;
}

export interface IngredientPortionLine {
  name: string;
  unit: Unit;
  /** Each person's portion for one day (one container). */
  byPersonDaily: PersonPortionCell[];
  /** Full period batch — all raw ingredients for one cook. */
  periodTotalAmount: number;
  periodTotalGrams: number | null;
}

function scaledShare(
  baseAmount: number,
  unit: Unit,
  name: string,
  scale: number,
): Omit<PersonPortionCell, 'personId'> {
  const amount = roundQty(baseAmount * scale, unit);
  const grams = amountToGrams(amount, unit, name);
  return {
    amount,
    grams: grams !== null ? roundGrams(grams) : null,
  };
}

/**
 * One cook per period. Person columns = daily portion; total = full period batch.
 */
export function mealIngredientPortions(
  recipe: Recipe,
  people: Person[],
  days: number,
): IngredientPortionLine[] {
  return recipe.ingredients.map((ing) => {
    const byPersonDaily: PersonPortionCell[] = [];
    let periodTotalAmount = 0;
    let periodTotalGrams = 0;
    let hasAllGrams = true;

    for (const person of people) {
      const scale = personScale(person, recipe);
      const daily = scaledShare(ing.amount, ing.unit, ing.name, scale);
      byPersonDaily.push({ personId: person.id, ...daily });

      const periodAmount = roundQty(daily.amount * days, ing.unit);
      periodTotalAmount += periodAmount;
      if (daily.grams !== null) periodTotalGrams += roundGrams(daily.grams * days);
      else hasAllGrams = false;
    }

    return {
      name: ing.name,
      unit: ing.unit,
      byPersonDaily,
      periodTotalAmount: roundQty(periodTotalAmount, ing.unit),
      periodTotalGrams: hasAllGrams ? roundGrams(periodTotalGrams) : null,
    };
  });
}

/** Per-person daily share for one ingredient. */
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
    const daily = scaledShare(ing.amount, ing.unit, ing.name, scale);
    return { personId: person.id, ...daily, unit: ing.unit };
  });
}
