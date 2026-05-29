import { MEAL_BUDGETS, MEAL_TYPES } from '../data/constants';
import type { MealType } from './types';

export interface AiPlanPromptInput {
  people: Array<{
    cals: number;
    diet: string;
    excludes: string[];
  }>;
  packageProducts: Array<{ name: string; packageQty: number }>;
  favoriteHints: string;
  packageViolations?: Array<{
    ingredient: string;
    neededGrams: number;
    packGrams: number;
  }>;
}

function householdDailyMealKcal(
  people: AiPlanPromptInput['people'],
  meal: MealType,
): number {
  return people.reduce((s, p) => s + MEAL_BUDGETS[meal] * p.cals, 0);
}

function batchKcalHint(
  people: AiPlanPromptInput['people'],
  meal: MealType,
  days: number,
): number {
  return Math.round(householdDailyMealKcal(people, meal) * days);
}

function portionRulesBlock(people: AiPlanPromptInput['people']): string {
  const lines = MEAL_TYPES.map((meal) => {
    const share = MEAL_BUDGETS[meal];
    const a = batchKcalHint(people, meal, 4);
    const b = batchKcalHint(people, meal, 3);
    return `  ${meal} (${Math.round(share * 100)}% ккал/день на особу): партія A (4 дні) ≈ ${a} ккал у сирих продуктах; партія B (3 дні) ≈ ${b} ккал`;
  });
  return lines.join('\n');
}

export function buildAiWeekPlanPrompt(input: AiPlanPromptInput): string {
  const household = JSON.stringify(input.people);
  const packages = JSON.stringify(input.packageProducts);
  const violationNote =
    input.packageViolations && input.packageViolations.length > 0
      ? `\n\nПОПЕРЕДНЯ СПРОБА ПОРУШИЛА УПАКОВКУ. Виправ:\n${JSON.stringify(input.packageViolations)}\nДля кожного такого інгредієнта тижневий підсумок (грами) має дорівнювати N × розмір_упаковки (ціле N ≥ 1).`
      : '';

  return `Ти планувальник MEAL PREP. Створи повні рецепти на тиждень (не обирай з готового каталогу id).

Усі страви — meal prep: одна велика партія на період, контейнери, 3–4 дні в холодильнику. Без свіжих сендвічів, тостів «наразі», салатів що в'януть.

Структура:
- Період A: 4 дні (пн–чт), cook batch на 4 дні
- Період B: 3 дні (пт–нд), cook batch на 3 дні
- Слоти на кожен період: ${MEAL_TYPES.join(', ')}

Домогосподарство (ккал/день, раціон, уникнення):
${household}

ПОРЦІЇ (критично):
- ingredients[].amount — це СУМА сирих грамів на ВСЮ партію періоду: усі дні × усі люди (одне приготування).
- НЕ вказуй грами на 1 день, на 1 особу чи на 1 контейнер — лише загальний batch для цього слоту в цьому періоді.
- Додаток сам ділить партію на денні контейнери пропорційно ккал/день кожної особи.
- Сума ккал з інгредієнтів партії має бути близько до цілі (±8%):
${portionRulesBlock(input.people)}
- Приклад масштабу lunch на 1 особу ~2100 ккал/день: курка ~150–200 г, крупа ~60–90 г сухої — НА ОДНУ ОСОБУ НА ДЕНЬ; для batch A помнож на 4 дні та на суму часток усіх людей.

Упаковки продуктів (грами на 1 упаковку — купують лише цілими упаковками):
${packages}

Для інгредієнтів зі списку упаковок: сумарна потреба за ВЕСЬ тиждень (обидва періоди, усі партії) у грамах має дорівнювати рівно N × packageQty, де N — ціле число ≥ 1. Дробові упаковки (0.5×, 0.7×) заборонені. Якщо інгредієнт не в списку упаковок — довільні грами.

Улюблені рецепти користувача (можна відтворити ідею, не копіюй дослівно всі 8 страв):
${input.favoriteHints}

Правила:
1. Не використовуй інгредієнти з excludes жодної людини (pork, seafood, dairy, gluten).
2. tags — масив з: balanced, high-protein, mediterranean, vegetarian, low-carb; підходить під раціони домогосподарства.
3. excl — що містить рецепт з: pork, seafood, dairy, gluten.
4. ingredients: лише unit у грамах — поле amount (число, г); name — англійською або українською, послідовно.
5. steps — короткі кроки приготування batch meal prep українською.
6. Різноманітність: не повторюй однакові страви в межах періоду.
7. Відповідь — лише JSON без markdown.${violationNote}

Формат:
{
  "A": {
    "breakfast": { "name": "...", "tags": ["balanced"], "excl": [], "ingredients": [{"name":"...","amount":100}], "steps": ["..."] },
    "lunch": { ... },
    "dinner": { ... },
    "snack": { ... }
  },
  "B": { "breakfast": { ... }, "lunch": { ... }, "dinner": { ... }, "snack": { ... } }
}`;
}

export function buildAiSingleMealPrompt(
  input: AiPlanPromptInput & {
    periodKey: 'A' | 'B';
    periodDays: number;
    mealType: string;
    avoidNames: string[];
  },
): string {
  const base = buildAiWeekPlanPrompt(input);
  const target = batchKcalHint(
    input.people,
    input.mealType as MealType,
    input.periodDays,
  );
  return `${base}

Згенеруй ЛИШЕ ОДИН рецепт для періоду ${input.periodKey} (${input.periodDays} днів), слот ${input.mealType}.
Цільова сума ккал у сирих інгредієнтах цієї партії ≈ ${target} (усі люди × усі дні періоду).
Не повторюй назви: ${JSON.stringify(input.avoidNames)}.
Відповідь: {"recipe":{ "name":"...", "tags":["balanced"], "excl":[], "ingredients":[{"name":"...","amount":100}], "steps":["..."] }}`;
}
