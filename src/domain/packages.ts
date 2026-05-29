import { foodKey } from '../data/foods';
import { amountToGrams, roundGrams } from './nutrition';
import type { PackageProduct, ShoppingItem } from './types';

function packageSizeInGrams(product: PackageProduct): number | null {
  return amountToGrams(product.packageQty, product.unit, product.name);
}

/** Round shopping qty up to whole retail packages when the user defined one. */
export function applyPackageRounding(
  item: ShoppingItem,
  products: PackageProduct[],
): ShoppingItem {
  const key = foodKey(item.name);
  const product = products.find((p) => p.id === key);
  if (!product || product.packageQty <= 0) return item;

  const packGrams = packageSizeInGrams(product);
  const neededGrams =
    item.qtyGrams ?? amountToGrams(item.qty, item.unit, item.name);

  if (packGrams !== null && neededGrams !== null) {
    const packs = Math.ceil(neededGrams / packGrams);
    const roundedGrams = roundGrams(packs * packGrams);
    return {
      ...item,
      unit: 'g',
      qty: roundedGrams,
      qtyGrams: roundedGrams,
      packageCount: packs,
      packageSize: product.packageQty,
      packageUnit: 'g',
    };
  }

  return item;
}
