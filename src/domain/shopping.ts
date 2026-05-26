import { personScale } from './scaling';
import { amountToGrams, roundGrams, roundQty } from './nutrition';
import type { Person, Plan, ShoppingItem } from './types';

export function aggregateShopping(
  plan: Plan,
  people: Person[],
): ShoppingItem[] {
  const acc = new Map<string, ShoppingItem>();

  for (const period of [plan.A, plan.B]) {
    for (const slot of Object.values(period.meals)) {
      for (const ing of slot.recipe.ingredients) {
        let batchAmount = 0;
        let batchGrams = 0;
        let hasGrams = true;

        for (const person of people) {
          const scale = personScale(person, slot.recipe);
          const amount = ing.amount * scale;
          batchAmount += amount;
          const g = amountToGrams(amount, ing.unit, ing.name);
          if (g !== null) batchGrams += g;
          else hasGrams = false;
        }

        const qty = batchAmount * period.days;
        const key = `${ing.name}||${ing.unit}`;
        const existing = acc.get(key);
        const qtyGrams =
          hasGrams && batchGrams > 0
            ? roundGrams(batchGrams * period.days)
            : null;

        if (existing) {
          existing.qty += qty;
          if (existing.qtyGrams !== null && qtyGrams !== null) {
            existing.qtyGrams += qtyGrams;
          } else {
            existing.qtyGrams = null;
          }
        } else {
          acc.set(key, {
            name: ing.name,
            unit: ing.unit,
            qty,
            qtyGrams,
          });
        }
      }
    }
  }

  return [...acc.values()]
    .map((item) => ({
      ...item,
      qty: roundQty(item.qty, item.unit),
      qtyGrams: item.qtyGrams !== null ? roundGrams(item.qtyGrams) : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
