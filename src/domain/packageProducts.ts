import { foodKey, INGREDIENT_KEYS } from '../data/foods';
import { ingredientLabel } from '../i18n';

/** Resolve typed text to a catalog key or a new custom product name. */
export function resolvePackageProductName(
  query: string,
  selectedKey: string | null,
): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  if (selectedKey) return selectedKey;

  const q = trimmed.toLowerCase();
  const exactKey = foodKey(trimmed);
  if (INGREDIENT_KEYS.includes(exactKey)) return exactKey;

  const byLabel = INGREDIENT_KEYS.find(
    (k) => ingredientLabel(k).toLowerCase() === q,
  );
  if (byLabel) return byLabel;

  const partial = INGREDIENT_KEYS.filter(
    (k) =>
      ingredientLabel(k).toLowerCase().includes(q) || k.includes(exactKey),
  );
  if (partial.length === 1) return partial[0];

  return trimmed;
}

export function searchPackageProductSuggestions(
  query: string,
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return INGREDIENT_KEYS.slice(0, limit);

  const matches = INGREDIENT_KEYS.filter(
    (k) =>
      ingredientLabel(k).toLowerCase().includes(q) || k.includes(foodKey(q)),
  );
  return matches.slice(0, limit);
}

export function packageProductDisplayName(name: string): string {
  const key = foodKey(name);
  if (INGREDIENT_KEYS.includes(key)) return ingredientLabel(key);
  return name;
}
