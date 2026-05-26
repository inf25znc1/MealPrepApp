import type { Unit } from '../domain/types';

/** USDA FoodData Central values per 100 g (or per 100 ml for liquids). */
export interface FoodProfile {
  kcalPer100g: number;
  pPer100g: number;
  cPer100g: number;
  fPer100g: number;
  /** Grams per count/spoon when unit is not g or ml. */
  gramsPerUnit?: Partial<Record<Exclude<Unit, 'g' | 'ml'>, number>>;
}

export const FOODS: Record<string, FoodProfile> = {
  'rolled oats': { kcalPer100g: 389, pPer100g: 17, cPer100g: 66, fPer100g: 7 },
  'greek yogurt': { kcalPer100g: 97, pPer100g: 9, cPer100g: 3.6, fPer100g: 5 },
  'mixed berries': { kcalPer100g: 57, pPer100g: 0.7, cPer100g: 14, fPer100g: 0.3 },
  'almond butter': {
    kcalPer100g: 614,
    pPer100g: 21,
    cPer100g: 19,
    fPer100g: 53,
    gramsPerUnit: { tbsp: 16 },
  },
  honey: {
    kcalPer100g: 304,
    pPer100g: 0.3,
    cPer100g: 82,
    fPer100g: 0,
    gramsPerUnit: { tsp: 7 },
  },
  eggs: {
    kcalPer100g: 143,
    pPer100g: 13,
    cPer100g: 0.7,
    fPer100g: 10,
    gramsPerUnit: { pcs: 50 },
  },
  sourdough: {
    kcalPer100g: 274,
    pPer100g: 9,
    cPer100g: 53,
    fPer100g: 1.5,
    gramsPerUnit: { slice: 40 },
  },
  avocado: {
    kcalPer100g: 160,
    pPer100g: 2,
    cPer100g: 9,
    fPer100g: 15,
    gramsPerUnit: { pcs: 100 },
  },
  'cherry tomatoes': { kcalPer100g: 18, pPer100g: 0.9, cPer100g: 3.9, fPer100g: 0.2 },
  'olive oil': {
    kcalPer100g: 884,
    pPer100g: 0,
    cPer100g: 0,
    fPer100g: 100,
    gramsPerUnit: { tsp: 4.5, tbsp: 13.5 },
  },
  'firm tofu': { kcalPer100g: 144, pPer100g: 17, cPer100g: 3, fPer100g: 9 },
  spinach: { kcalPer100g: 23, pPer100g: 2.9, cPer100g: 3.6, fPer100g: 0.4 },
  'bell pepper': { kcalPer100g: 31, pPer100g: 1, cPer100g: 6, fPer100g: 0.3 },
  onion: { kcalPer100g: 40, pPer100g: 1.1, cPer100g: 9.3, fPer100g: 0.1 },
  'chia seeds': { kcalPer100g: 486, pPer100g: 17, cPer100g: 42, fPer100g: 31 },
  'oat milk': { kcalPer100g: 43, pPer100g: 0.3, cPer100g: 7, fPer100g: 1.5 },
  banana: {
    kcalPer100g: 89,
    pPer100g: 1.1,
    cPer100g: 23,
    fPer100g: 0.3,
    gramsPerUnit: { pcs: 120 },
  },
  walnuts: { kcalPer100g: 654, pPer100g: 15, cPer100g: 14, fPer100g: 65 },
  'oat flour': { kcalPer100g: 404, pPer100g: 14, cPer100g: 65, fPer100g: 9 },
  'chicken breast': { kcalPer100g: 165, pPer100g: 31, cPer100g: 0, fPer100g: 3.6 },
  'brown rice': { kcalPer100g: 112, pPer100g: 2.3, cPer100g: 24, fPer100g: 0.9 },
  broccoli: { kcalPer100g: 34, pPer100g: 2.8, cPer100g: 7, fPer100g: 0.4 },
  lemon: {
    kcalPer100g: 29,
    pPer100g: 1.1,
    cPer100g: 9,
    fPer100g: 0.3,
    gramsPerUnit: { pcs: 30 },
  },
  'salmon fillet': { kcalPer100g: 208, pPer100g: 20, cPer100g: 0, fPer100g: 13 },
  quinoa: { kcalPer100g: 120, pPer100g: 4.4, cPer100g: 21, fPer100g: 1.9 },
  cucumber: { kcalPer100g: 15, pPer100g: 0.7, cPer100g: 3.6, fPer100g: 0.1 },
  'turkey breast': { kcalPer100g: 135, pPer100g: 30, cPer100g: 0, fPer100g: 1 },
  tortilla: {
    kcalPer100g: 304,
    pPer100g: 8,
    cPer100g: 50,
    fPer100g: 6,
    gramsPerUnit: { pcs: 45 },
  },
  hummus: { kcalPer100g: 166, pPer100g: 8, cPer100g: 14, fPer100g: 10 },
  chickpeas: { kcalPer100g: 164, pPer100g: 9, cPer100g: 27, fPer100g: 2.6 },
  feta: { kcalPer100g: 264, pPer100g: 14, cPer100g: 4, fPer100g: 21 },
  'lean beef': { kcalPer100g: 176, pPer100g: 26, cPer100g: 0, fPer100g: 8 },
  'soy sauce': {
    kcalPer100g: 53,
    pPer100g: 8,
    cPer100g: 5,
    fPer100g: 0,
    gramsPerUnit: { tbsp: 18 },
  },
  'red lentils': { kcalPer100g: 116, pPer100g: 9, cPer100g: 20, fPer100g: 0.4 },
  carrots: { kcalPer100g: 41, pPer100g: 0.9, cPer100g: 10, fPer100g: 0.2 },
  celery: { kcalPer100g: 14, pPer100g: 0.7, cPer100g: 3, fPer100g: 0.2 },
  'vegetable stock': { kcalPer100g: 5, pPer100g: 0.3, cPer100g: 0.5, fPer100g: 0 },
  'pork loin': { kcalPer100g: 143, pPer100g: 26, cPer100g: 0, fPer100g: 3.5 },
  'sweet potato': { kcalPer100g: 86, pPer100g: 1.6, cPer100g: 20, fPer100g: 0.1 },
  'brussels sprouts': { kcalPer100g: 43, pPer100g: 3.4, cPer100g: 9, fPer100g: 0.3 },
  'cod fillet': { kcalPer100g: 82, pPer100g: 18, cPer100g: 0, fPer100g: 0.7 },
  zucchini: { kcalPer100g: 17, pPer100g: 1.2, cPer100g: 3.1, fPer100g: 0.3 },
  potato: { kcalPer100g: 77, pPer100g: 2, cPer100g: 17, fPer100g: 0.1 },
  'whole wheat pasta': { kcalPer100g: 124, pPer100g: 5, cPer100g: 26, fPer100g: 1 },
  pesto: {
    kcalPer100g: 387,
    pPer100g: 5,
    cPer100g: 6,
    fPer100g: 38,
    gramsPerUnit: { tbsp: 15 },
  },
  parmesan: { kcalPer100g: 431, pPer100g: 38, cPer100g: 4, fPer100g: 29 },
  'coconut milk': { kcalPer100g: 197, pPer100g: 2, cPer100g: 3, fPer100g: 21 },
  'basmati rice': { kcalPer100g: 121, pPer100g: 3, cPer100g: 25, fPer100g: 0.4 },
  'curry paste': {
    kcalPer100g: 120,
    pPer100g: 3,
    cPer100g: 12,
    fPer100g: 6,
    gramsPerUnit: { tbsp: 16 },
  },
  'ground turkey': { kcalPer100g: 189, pPer100g: 27, cPer100g: 0, fPer100g: 8 },
  marinara: { kcalPer100g: 50, pPer100g: 1.5, cPer100g: 8, fPer100g: 1.5 },
  'peanut sauce': {
    kcalPer100g: 290,
    pPer100g: 8,
    cPer100g: 18,
    fPer100g: 22,
    gramsPerUnit: { tbsp: 18 },
  },
};

export function foodKey(name: string): string {
  return name.trim().toLowerCase();
}

export function lookupFood(name: string): FoodProfile | undefined {
  return FOODS[foodKey(name)];
}
