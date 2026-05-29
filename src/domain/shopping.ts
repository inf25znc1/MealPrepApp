import { foodKey } from '../data/foods';
import {
  shoppingCategoryForIngredient,
  SHOPPING_CATEGORY_ORDER,
} from '../data/shoppingCategories';
import { batchIngredientAmount } from './batch';
import { applyPackageRounding } from './packages';
import type { ShoppingCategory } from './types';
import { amountToGrams, roundGrams, roundQty } from './nutrition';
import type {
  PackageProduct,
  Person,
  Plan,
  ShoppingItem,
  Unit,
} from './types';

export function shoppingItemId(name: string): string {
  return foodKey(name);
}

interface Accumulator {
  name: string;
  totalGrams: number;
  byUnit: Map<Unit, number>;
}

function addToAccumulator(
  acc: Accumulator,
  qty: number,
  unit: Unit,
): void {
  const grams = amountToGrams(qty, unit, acc.name);
  if (grams !== null) {
    acc.totalGrams += grams;
    return;
  }
  acc.byUnit.set(unit, (acc.byUnit.get(unit) ?? 0) + qty);
}

function accumulatorToItem(acc: Accumulator): ShoppingItem {
  const id = shoppingItemId(acc.name);
  const category = shoppingCategoryForIngredient(acc.name);

  if (acc.totalGrams > 0) {
    const g = roundGrams(acc.totalGrams);
    return {
      id,
      name: acc.name,
      unit: 'g',
      qty: g,
      qtyGrams: g,
      category,
    };
  }

  if (acc.byUnit.size === 1) {
    const [unit, qty] = [...acc.byUnit.entries()][0];
    return {
      id,
      name: acc.name,
      unit,
      qty: roundQty(qty, unit),
      qtyGrams: null,
      category,
    };
  }

  let combinedQty = 0;
  let unit: Unit = 'pcs';
  for (const [u, q] of acc.byUnit) {
    combinedQty += q;
    unit = u;
  }
  return {
    id,
    name: acc.name,
    unit,
    qty: roundQty(combinedQty, unit),
    qtyGrams: null,
    category,
  };
}

/** Merge by ingredient name; combine tbsp/tsp/g into grams when possible. */
export function aggregateShopping(
  plan: Plan,
  people: Person[],
  packageProducts: PackageProduct[] = [],
): ShoppingItem[] {
  const acc = new Map<string, Accumulator>();

  for (const period of [plan.A, plan.B]) {
    for (const slot of Object.values(period.meals)) {
      for (const ing of slot.recipe.ingredients) {
        const key = foodKey(ing.name);
        const qty = batchIngredientAmount(
          ing,
          slot.recipe,
          people,
          period.days,
        );

        if (!acc.has(key)) {
          acc.set(key, { name: ing.name, totalGrams: 0, byUnit: new Map() });
        }
        addToAccumulator(acc.get(key)!, qty, ing.unit);
      }
    }
  }

  const items = [...acc.values()]
    .map(accumulatorToItem)
    .map((item) => applyPackageRounding(item, packageProducts));

  items.sort((a, b) => {
    const catA = SHOPPING_CATEGORY_ORDER.indexOf(
      a.category as ShoppingCategory,
    );
    const catB = SHOPPING_CATEGORY_ORDER.indexOf(
      b.category as ShoppingCategory,
    );
    if (catA !== catB) return catA - catB;
    return a.name.localeCompare(b.name);
  });

  return items;
}

export function groupShoppingByCategory(
  items: ShoppingItem[],
): Array<{ category: ShoppingCategory; items: ShoppingItem[] }> {
  const buckets = new Map<ShoppingCategory, ShoppingItem[]>();
  for (const cat of SHOPPING_CATEGORY_ORDER) {
    buckets.set(cat, []);
  }
  for (const item of items) {
    buckets.get(item.category)!.push(item);
  }
  return SHOPPING_CATEGORY_ORDER.filter((cat) => buckets.get(cat)!.length > 0).map(
    (category) => ({
      category,
      items: buckets.get(category)!,
    }),
  );
}
