import { foodKey } from '../data/foods';
import type {
  DietStyle,
  Exclusion,
  MealType,
  ShoppingCategory,
  Unit,
} from '../domain/types';

const MEAL_TYPE: Record<MealType, string> = {
  breakfast: 'Сніданок',
  lunch: 'Обід',
  dinner: 'Вечеря',
  snack: 'Перекус',
};

const DIET: Record<DietStyle, string> = {
  balanced: 'Збалансована',
  'high-protein': 'Високобілкова',
  mediterranean: 'Середземноморська',
  vegetarian: 'Вегетаріанська',
  'low-carb': 'Низьковуглеводна',
};

const EXCLUSION: Record<Exclusion, string> = {
  pork: 'Свинина',
  seafood: 'Морепродукти',
  dairy: 'Молочне',
  gluten: 'Глютен',
};

const SHOPPING_CATEGORY: Record<ShoppingCategory, string> = {
  Produce: 'Овочі та фрукти',
  Protein: 'Білок',
  Dairy: 'Молочні',
  'Grains & bakery': 'Крупи та випічка',
  'Legumes & nuts': 'Бобові та горіхи',
  'Pantry & oils': 'Комора та олії',
  'Sauces & canned': 'Соуси та консерви',
  Other: 'Інше',
};

const UNIT: Record<Unit, string> = {
  g: 'г',
  ml: 'мл',
  pcs: 'шт',
  tsp: 'ч. л.',
  tbsp: 'ст. л.',
  slice: 'скиб.',
  cup: 'скл.',
};

const PERIOD: Record<'A' | 'B', string> = {
  A: 'Період А',
  B: 'Період Б',
};

const INGREDIENT: Record<string, string> = {
  'rolled oats': 'Вівсянка',
  'greek yogurt': 'Грецький йогурт',
  'mixed berries': 'Ягідна суміш',
  'almond butter': 'Мигдальна паста',
  honey: 'Мед',
  eggs: 'Яйця',
  sourdough: 'Закваска',
  avocado: 'Авокадо',
  'cherry tomatoes': 'Помідори черрі',
  'olive oil': 'Оливкова олія',
  'firm tofu': 'Тофу твердий',
  spinach: 'Шпинат',
  'bell pepper': 'Болгарський перець',
  onion: 'Цибуля',
  'chia seeds': 'Насіння чіа',
  'oat milk': 'Вівсяне молоко',
  banana: 'Банан',
  walnuts: 'Горіхи волоські',
  'oat flour': 'Вівсяне борошно',
  'chicken breast': 'Куряче філе',
  'brown rice': 'Бурий рис',
  broccoli: 'Броколі',
  lemon: 'Лимон',
  'salmon fillet': 'Філе лосося',
  quinoa: 'Кіноа',
  cucumber: 'Огірок',
  'turkey breast': 'Індиче філе',
  tortilla: 'Тортилья',
  hummus: 'Хумус',
  chickpeas: 'Нут',
  feta: 'Фета',
  'lean beef': 'Яловичина нежирна',
  'soy sauce': 'Соєвий соус',
  'red lentils': 'Червона сочевиця',
  carrots: 'Морква',
  celery: 'Селера',
  'vegetable stock': 'Овочевий бульйон',
  'pork loin': 'Свиняча вирізка',
  'sweet potato': 'Батат',
  'brussels sprouts': 'Брюссельська капуста',
  'cod fillet': 'Філе тріски',
  zucchini: 'Цукіні',
  potato: 'Картопля',
  'whole wheat pasta': 'Цільнозернова паста',
  pesto: 'Песто',
  parmesan: 'Пармезан',
  'coconut milk': 'Кокосове молоко',
  'curry paste': 'Паста карі',
  'basmati rice': 'Рис басматі',
  'ground turkey': 'Фарш індички',
  marinara: 'Томатний соус',
  'peanut sauce': 'Арахісовий соус',
  apple: 'Яблуко',
  'dark chocolate': 'Темний шоколад',
  'cottage cheese': 'Сир кисломолочний',
  'rice cakes': 'Рисові хлібці',
};

const RECIPE_NAME: Record<string, string> = {
  'oat-bowl': 'Вівсянка з ягодами',
  'eggs-avo': 'Яйця з тостом та авокадо',
  'tofu-scramble': 'Тофу з овочами',
  'chia-pudding': 'Пудинг з чіа та фруктами',
  pancakes: 'Бананові протеїнові млинці',
  'chicken-rice': 'Курка з рисом та лимоном',
  'salmon-quinoa': 'Лосось з кіноа',
  'turkey-wrap': 'Рол з індичкою та хумусом',
  'chickpea-salad': 'Салат з нутом',
  'beef-stirfry': 'Яловичина з овочами',
  'lentil-soup': 'Сочевичний суп',
  'pork-veg': 'Свинина з коренеплодами',
  'cod-veg': 'Тріска з овочами',
  'chicken-pasta': 'Паста з куркою та песто',
  'veggie-curry': 'Кокосове карі з нутом',
  meatballs: 'Індичні тефтелі з кабачком',
  'tofu-stirfry': 'Тофу в арахісовому соусі',
  'apple-almond': 'Яблуко з мигдальною пастою',
  'yogurt-berries-snack': 'Йогурт з ягодами',
  'hummus-veg-snack': 'Хумус з морквою',
  'cottage-crackers': 'Сир з рисовими хлібцями',
  'walnut-chocolate': 'Горіхи з шоколадом',
};

export function mealTypeLabel(meal: MealType): string {
  return MEAL_TYPE[meal];
}

export function dietLabel(diet: DietStyle): string {
  return DIET[diet];
}

export function exclusionLabel(ex: Exclusion): string {
  return EXCLUSION[ex];
}

export function shoppingCategoryLabel(cat: ShoppingCategory): string {
  return SHOPPING_CATEGORY[cat];
}

export function unitLabel(unit: Unit): string {
  return UNIT[unit];
}

export function periodLabel(key: 'A' | 'B'): string {
  return PERIOD[key];
}

export function ingredientLabel(name: string): string {
  return INGREDIENT[foodKey(name)] ?? name;
}

export function recipeName(id: string, fallback: string): string {
  return RECIPE_NAME[id] ?? fallback;
}

export function daysWord(count: number): string {
  if (count === 1) return 'день';
  if (count >= 2 && count <= 4) return 'дні';
  return 'днів';
}
