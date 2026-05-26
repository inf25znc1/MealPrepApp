import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MEAL_TYPES } from '../src/data/constants';
import { recipeCatalogForPrompt, RECIPE_IDS } from '../src/data/recipeCatalog';
import { parseMealPicks, type MealPicks } from '../src/domain/mealPicks';

interface HouseholdPerson {
  cals: number;
  diet: string;
  excludes: string[];
}

function buildPrompt(people: HouseholdPerson[]): string {
  const catalog = JSON.stringify(recipeCatalogForPrompt());
  const household = JSON.stringify(people);

  return `Ти планувальник харчування. Обери рецепти з каталогу для тижневого плану meal prep.

Структура тижня:
- Період A: 4 дні (пн–чт), cook batch на 4 дні
- Період B: 3 дні (пт–нд), cook batch на 3 дні
- Для кожного періоду потрібні слоти: ${MEAL_TYPES.join(', ')}

Домогосподарство (калорії/день, раціон, алергени/уникнення):
${household}

Каталог рецептів (використовуй ТІЛЬКИ ці id):
${catalog}

Правила:
1. Кожен id має існувати в каталозі і відповідати meal слоту (поле meal).
2. Не обирай рецепт, якщо його excl перетинається з excludes будь-якої людини.
3. Для кожної людини більшість страв повинні мати її diet у tags (хоча б один підходящий раціон на людину в плані).
4. Різноманітність: не повторюй id в межах одного періоду; уникай повторів між A і B.
5. Віддай лише JSON без markdown.

Формат відповіді:
{"A":{"breakfast":"id","lunch":"id","dinner":"id","snack":"id"},"B":{"breakfast":"id","lunch":"id","dinner":"id","snack":"id"}}`;
}

function sanitizePicks(raw: MealPicks): MealPicks {
  const out: MealPicks = {};

  for (const periodKey of ['A', 'B'] as const) {
    const period = raw[periodKey];
    if (!period) continue;
    const slots: Partial<Record<(typeof MEAL_TYPES)[number], string>> = {};

    for (const mealType of MEAL_TYPES) {
      const id = period[mealType];
      if (id && RECIPE_IDS.has(id)) {
        slots[mealType] = id;
      }
    }

    if (Object.keys(slots).length > 0) {
      out[periodKey] = slots;
    }
  }

  return out;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
    return;
  }

  const people = req.body?.people;
  if (!Array.isArray(people) || people.length === 0) {
    res.status(400).json({ error: 'Invalid household' });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const result = await model.generateContent(buildPrompt(people));
    const text = result.response.text();
    const parsed = parseMealPicks(JSON.parse(text));
    if (!parsed) {
      res.status(502).json({ error: 'Invalid model response' });
      return;
    }

    const picks = sanitizePicks(parsed);
    if (!picks.A && !picks.B) {
      res.status(502).json({ error: 'No valid picks' });
      return;
    }

    res.status(200).json({ picks });
  } catch (err) {
    console.error('generate-plan error', err);
    res.status(500).json({ error: 'Generation failed' });
  }
}
