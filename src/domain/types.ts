// Canonical data model for the meal prep app.
// All domain functions and components reference these types.

export type DietStyle =
  | 'balanced'
  | 'high-protein'
  | 'mediterranean'
  | 'vegetarian'
  | 'low-carb';

export type Exclusion = 'pork' | 'seafood' | 'dairy' | 'gluten';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type PeriodKey = 'A' | 'B';

export type Unit = 'g' | 'ml' | 'pcs' | 'tsp' | 'tbsp' | 'slice' | 'cup';

export interface Person {
  id: string;
  name: string;
  cals: number; // kcal/day target
  diet: DietStyle;
  excludes: Exclusion[];
  /** Stable index into PERSON_COLOR_SLOTS — never changes for this person. */
  colorSlot: number;
}

export interface Ingredient {
  name: string;
  unit: Unit;
  /** Period batch total (all people × all days in period); legacy favorites may be per-person reference. */
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  meal: MealType;
  kcal: number; // batch total from ingredients (or legacy per-person reference)
  p: number;
  c: number;
  f: number;
  tags: DietStyle[]; // diet styles this recipe fits
  excl: Exclusion[]; // exclusions this recipe triggers
  /** Batch-cook once per period; stores and reheats well for several days. */
  mealPrep: boolean;
  ingredients: Ingredient[];
  steps: string[];
}

export interface MealSlot {
  recipe: Recipe;
  locked: boolean;
}

export interface Period {
  label: string;
  key: PeriodKey;
  days: number;
  dayList: string[];
  cookDay: string;
  eatRange: string;
  meals: Record<MealType, MealSlot>;
}

export interface Plan {
  A: Period;
  B: Period;
}

/** User-defined retail package for an ingredient (e.g. 190 g cottage cheese tub). */
export interface PackageProduct {
  /** Stable id — `foodKey(name)`. */
  id: string;
  name: string;
  packageQty: number;
  unit: Unit;
}

export interface AppState {
  people: Person[];
  plan: Plan | null;
  activeTab: 'plan' | 'shop';
  activePersonId: string;
  /** Checked shopping list items keyed by shopping item id. */
  checkedShopping: Record<string, boolean>;
  /** Ingredients bought only in fixed package sizes — shopping rounds up. */
  packageProducts: PackageProduct[];
  /** User-saved and custom recipes (local library). */
  favoriteRecipes: Recipe[];
}

export interface PersonMacros {
  factor: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface DailyTargets {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export type ShoppingCategory =
  | 'Produce'
  | 'Protein'
  | 'Dairy'
  | 'Grains & bakery'
  | 'Legumes & nuts'
  | 'Pantry & oils'
  | 'Sauces & canned'
  | 'Other';

export interface ShoppingItem {
  id: string;
  name: string;
  unit: Unit;
  qty: number;
  /** Total grams for the week when all amounts convert to weight. */
  qtyGrams: number | null;
  category: ShoppingCategory;
  /** Set when qty was rounded up to full user-defined packages. */
  packageCount?: number;
  packageSize?: number;
  packageUnit?: Unit;
}
