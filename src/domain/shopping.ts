import { personScale } from './scaling';
import type { Person, Plan, ShoppingItem, Unit } from './types';

function roundQty(qty: number, unit: Unit): number {
  if (unit === 'g' || unit === 'ml') return Math.round(qty);
  return Math.round(qty * 10) / 10;
}

export function aggregateShopping(
  plan: Plan,
  people: Person[],
): ShoppingItem[] {
  const acc = new Map<string, ShoppingItem>();

  for (const period of [plan.A, plan.B]) {
    for (const slot of Object.values(period.meals)) {
      for (const ing of slot.recipe.ingredients) {
        let householdFactor = 0;
        for (const person of people) {
          householdFactor += personScale(person, slot.recipe);
        }
        const qty = ing.amount * householdFactor * period.days;
        const key = `${ing.name}||${ing.unit}`;
        const existing = acc.get(key);
        if (existing) {
          existing.qty += qty;
        } else {
          acc.set(key, { name: ing.name, unit: ing.unit, qty });
        }
      }
    }
  }

  return [...acc.values()]
    .map((item) => ({
      ...item,
      qty: roundQty(item.qty, item.unit),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
