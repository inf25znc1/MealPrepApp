import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MEAL_TYPES } from '../src/data/constants';
import { parseAiRecipe } from '../src/domain/aiPlan';
import { buildAiSingleMealPrompt } from '../src/domain/aiPlanPrompt';
import { generateGeminiJson } from '../src/domain/geminiGenerate';
import { geminiErrorCode, resolveGeminiApiKey } from '../src/domain/geminiEnv';
import type { MealType, PackageProduct } from '../src/domain/types';

interface RequestBody {
  people?: Array<{
    cals: number;
    diet: string;
    excludes: string[];
  }>;
  packageProducts?: Array<{ name: string; packageQty: number }>;
  favoriteRecipes?: Array<{
    name: string;
    meal: string;
    ingredients: Array<{ name: string; amount: number }>;
  }>;
  periodKey?: 'A' | 'B';
  periodDays?: number;
  mealType?: string;
  avoidNames?: string[];
}

function isMealType(v: string): v is MealType {
  return (MEAL_TYPES as string[]).includes(v);
}

function geminiHttpStatus(code: string): number {
  if (code === 'GEMINI_API_KEY_INVALID') return 503;
  if (code === 'GEMINI_QUOTA_EXCEEDED') return 429;
  if (code === 'GEMINI_OVERLOADED') return 503;
  return 500;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!resolveGeminiApiKey()) {
    res.status(503).json({ error: 'GEMINI_API_KEY_INVALID' });
    return;
  }

  const body = req.body as RequestBody;
  const people = body?.people;
  const periodKey = body?.periodKey;
  const mealType = body?.mealType;
  const periodDays = body?.periodDays ?? (periodKey === 'A' ? 4 : 3);

  if (
    !Array.isArray(people) ||
    people.length === 0 ||
    (periodKey !== 'A' && periodKey !== 'B') ||
    !mealType ||
    !isMealType(mealType)
  ) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const packageProducts: PackageProduct[] = (body.packageProducts ?? []).map(
    (p) => ({
      id: p.name.trim().toLowerCase(),
      name: p.name,
      packageQty: p.packageQty,
      unit: 'g' as const,
    }),
  );

  try {
    const prompt = buildAiSingleMealPrompt({
      people,
      packageProducts: packageProducts.map((p) => ({
        name: p.name,
        packageQty: p.packageQty,
      })),
      favoriteHints: JSON.stringify(body.favoriteRecipes ?? []),
      periodKey,
      periodDays,
      mealType,
      avoidNames: body.avoidNames ?? [],
    });

    const raw = await generateGeminiJson(prompt, 0.7);
    const obj =
      raw && typeof raw === 'object'
        ? (raw as Record<string, unknown>)
        : null;
    const recipe = parseAiRecipe(obj?.recipe, mealType, periodKey);

    if (!recipe) {
      res.status(502).json({ error: 'Invalid model response' });
      return;
    }

    res.status(200).json({ recipe });
  } catch (err) {
    const code = geminiErrorCode(err);
    console.error('generate-meal error', err);
    res.status(geminiHttpStatus(code)).json({ error: code });
  }
}
