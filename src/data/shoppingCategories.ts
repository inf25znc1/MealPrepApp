import type { ShoppingCategory } from '../domain/types';
import { foodKey } from './foods';

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [
  'Produce',
  'Protein',
  'Dairy',
  'Grains & bakery',
  'Legumes & nuts',
  'Pantry & oils',
  'Sauces & canned',
  'Other',
];

const CATEGORY_BY_FOOD_KEY: Record<string, ShoppingCategory> = {
  'mixed berries': 'Produce',
  'cherry tomatoes': 'Produce',
  avocado: 'Produce',
  spinach: 'Produce',
  'bell pepper': 'Produce',
  onion: 'Produce',
  banana: 'Produce',
  broccoli: 'Produce',
  lemon: 'Produce',
  cucumber: 'Produce',
  carrots: 'Produce',
  celery: 'Produce',
  'sweet potato': 'Produce',
  'brussels sprouts': 'Produce',
  zucchini: 'Produce',
  potato: 'Produce',
  apple: 'Produce',

  'chicken breast': 'Protein',
  'salmon fillet': 'Protein',
  'turkey breast': 'Protein',
  'lean beef': 'Protein',
  'pork loin': 'Protein',
  'cod fillet': 'Protein',
  'ground turkey': 'Protein',
  eggs: 'Protein',
  'firm tofu': 'Protein',

  'greek yogurt': 'Dairy',
  feta: 'Dairy',
  parmesan: 'Dairy',
  'cottage cheese': 'Dairy',
  'coconut milk': 'Dairy',

  'rolled oats': 'Grains & bakery',
  sourdough: 'Grains & bakery',
  'brown rice': 'Grains & bakery',
  quinoa: 'Grains & bakery',
  'oat flour': 'Grains & bakery',
  'whole wheat pasta': 'Grains & bakery',
  'basmati rice': 'Grains & bakery',
  'rice cakes': 'Grains & bakery',
  tortilla: 'Grains & bakery',

  chickpeas: 'Legumes & nuts',
  'red lentils': 'Legumes & nuts',
  'chia seeds': 'Legumes & nuts',
  walnuts: 'Legumes & nuts',

  'olive oil': 'Pantry & oils',
  honey: 'Pantry & oils',
  'almond butter': 'Pantry & oils',
  'oat milk': 'Pantry & oils',
  'vegetable stock': 'Pantry & oils',
  'dark chocolate': 'Pantry & oils',

  hummus: 'Sauces & canned',
  'soy sauce': 'Sauces & canned',
  pesto: 'Sauces & canned',
  'curry paste': 'Sauces & canned',
  marinara: 'Sauces & canned',
  'peanut sauce': 'Sauces & canned',
};

export function shoppingCategoryForIngredient(name: string): ShoppingCategory {
  return CATEGORY_BY_FOOD_KEY[foodKey(name)] ?? 'Other';
}
