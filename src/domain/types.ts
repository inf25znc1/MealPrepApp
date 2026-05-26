// Canonical data model for the meal prep app.
// All domain functions and components reference these types.

export type DietStyle =
  | 'balanced'
  | 'high-protein'
  | 'mediterranean'
  | 'vegetarian'
  | 'low-carb';

export type Exclusion = 'pork' | 'seafood' | 'dairy' | 'gluten';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type PeriodKey = 'A' | 'B';

export type Unit = 'g' | 'ml' | 'pcs' | 'tsp' | 'tbsp' | 'slice' | 'cup';

export interface Person {
  id: string;
  name: string;
  cals: number; // kcal/day target
  diet: DietStyle;
  excludes: Exclusion[];
}

export interface Ingredient {
  name: string;
  unit: Unit;
  /** Reference serving (one person at recipe base kcal); batch = sum of scaled shares. */
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  meal: MealType;
  kcal: number; // per person at base portion
  p: number; // protein g per person
  c: number; // carbs g per person
  f: number; // fat g per person
  tags: DietStyle[]; // diet styles this recipe fits
  excl: Exclusion[]; // exclusions this recipe triggers
  ingredients: Ingredient[];
}

export interface MealSlot {
  recipe: Recipe;
  locked: boolean;
}

export interface Period {
  label: 'Period A' | 'Period B';
  key: PeriodKey;
  days: number;
  dayList: string[];
  cookDay: string;
  eatRange: string;
  meals: {
    breakfast: MealSlot;
    lunch: MealSlot;
    dinner: MealSlot;
  };
}

export interface Plan {
  A: Period;
  B: Period;
}

export interface AppState {
  people: Person[];
  plan: Plan | null;
  activeTab: 'plan' | 'shop';
  activePersonId: string;
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

export interface ShoppingItem {
  name: string;
  unit: Unit;
  qty: number;
  /** Total grams for the week when all amounts convert to weight. */
  qtyGrams: number | null;
}
