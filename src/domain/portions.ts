import {
  batchIngredientAmount,
  personDailyIngredientAmount,
} from './batch';
import { amountToGrams, roundGrams, roundQty } from './nutrition';
import type { Ingredient, Person, Recipe, Unit } from './types';

/** Raw weight (g) for one person's single meal (one container). */
export function personMealPortionGrams(
  person: Person,
  recipe: Recipe,
  people: Person[],
  days: number,
): number | null {
  let total = 0;
  for (const ing of recipe.ingredients) {
    const amount = personDailyIngredientAmount(
      ing,
      person,
      people,
      recipe,
      days,
    );
    const grams = amountToGrams(amount, ing.unit, ing.name);
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

function dailyCell(
  ing: Ingredient,
  person: Person,
  people: Person[],
  recipe: Recipe,
  days: number,
): Omit<PersonPortionCell, 'personId'> {
  const amount = roundQty(
    personDailyIngredientAmount(ing, person, people, recipe, days),
    ing.unit,
  );
  const grams = amountToGrams(amount, ing.unit, ing.name);
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
    const byPersonDaily: PersonPortionCell[] = people.map((person) => ({
      personId: person.id,
      ...dailyCell(ing, person, people, recipe, days),
    }));

    const periodTotalAmount = roundQty(
      batchIngredientAmount(ing, recipe, people, days),
      ing.unit,
    );
    const periodGrams = amountToGrams(
      periodTotalAmount,
      ing.unit,
      ing.name,
    );

    return {
      name: ing.name,
      unit: ing.unit,
      byPersonDaily,
      periodTotalAmount,
      periodTotalGrams: periodGrams !== null ? roundGrams(periodGrams) : null,
    };
  });
}

/** Per-person daily share for one ingredient. */
export function personIngredientPortions(
  ing: Ingredient,
  recipe: Recipe,
  people: Person[],
  days: number,
): Array<{
  personId: string;
  amount: number;
  grams: number | null;
  unit: Unit;
}> {
  return people.map((person) => {
    const daily = dailyCell(ing, person, people, recipe, days);
    return { personId: person.id, ...daily, unit: ing.unit };
  });
}
