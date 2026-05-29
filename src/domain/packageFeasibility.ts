import { foodKey } from '../data/foods';
import { weekIngredientGrams } from './ingredientTotals';
import type { PackageProduct, Person, Plan } from './types';

const EPS = 0.5;

/** Week total must be a whole positive multiple of pack size (1×, 2×, …). Unused → 0 is ok. */
export function isWholePackageMultiple(
  neededGrams: number,
  packGrams: number,
): boolean {
  if (neededGrams <= EPS) return true;
  if (packGrams <= EPS) return true;
  const packs = neededGrams / packGrams;
  const rounded = Math.round(packs);
  return rounded >= 1 && Math.abs(packs - rounded) <= 0.02;
}

export interface PackageViolation {
  ingredient: string;
  neededGrams: number;
  packGrams: number;
}

export function findPackageViolations(
  plan: Plan,
  people: Person[],
  packageProducts: PackageProduct[],
): PackageViolation[] {
  const violations: PackageViolation[] = [];

  for (const product of packageProducts) {
    if (product.packageQty <= 0 || product.unit !== 'g') continue;
    const needed = weekIngredientGrams(plan, people, product.name);
    if (!isWholePackageMultiple(needed, product.packageQty)) {
      violations.push({
        ingredient: product.name,
        neededGrams: needed,
        packGrams: product.packageQty,
      });
    }
  }

  return violations;
}

export function planMeetsPackageConstraints(
  plan: Plan,
  people: Person[],
  packageProducts: PackageProduct[],
): boolean {
  return findPackageViolations(plan, people, packageProducts).length === 0;
}

/** Match packaged product to recipe ingredient lines. */
export function ingredientHasPackage(
  ingredientName: string,
  packageProducts: PackageProduct[],
): boolean {
  const key = foodKey(ingredientName);
  return packageProducts.some((p) => foodKey(p.name) === key);
}
