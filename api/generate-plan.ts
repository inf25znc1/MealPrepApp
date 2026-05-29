import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildPlanFromAiMeals, parseAiWeekMeals } from '../src/domain/aiPlan';
import { buildAiWeekPlanPrompt } from '../src/domain/aiPlanPrompt';
import { generateGeminiJson } from '../src/domain/geminiGenerate';
import { geminiErrorCode, resolveGeminiApiKey } from '../src/domain/geminiEnv';
import { findPackageViolations } from '../src/domain/packageFeasibility';
import type { PackageProduct, Person } from '../src/domain/types';

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
  if (!Array.isArray(people) || people.length === 0) {
    res.status(400).json({ error: 'Invalid household' });
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

  const favoriteHints = JSON.stringify(body.favoriteRecipes ?? []);

  try {
    let violations: ReturnType<typeof findPackageViolations> = [];
    let meals = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt = buildAiWeekPlanPrompt({
        people,
        packageProducts: packageProducts.map((p) => ({
          name: p.name,
          packageQty: p.packageQty,
        })),
        favoriteHints,
        packageViolations: attempt > 0 ? violations : undefined,
      });

      const raw = await generateGeminiJson(prompt, 0.65);
      meals = parseAiWeekMeals(raw);
      if (!meals) {
        res.status(502).json({ error: 'Invalid model response' });
        return;
      }

      if (packageProducts.length === 0) break;

      const tempPlan = buildPlanFromAiMeals(null, meals);
      violations = findPackageViolations(
        tempPlan,
        people as Person[],
        packageProducts,
      );
      if (violations.length === 0) break;
    }

    res.status(200).json({
      meals,
      ...(violations.length > 0 ? { packageWarnings: violations } : {}),
    });
  } catch (err) {
    const code = geminiErrorCode(err);
    console.error('generate-plan error', err);
    res.status(geminiHttpStatus(code)).json({ error: code });
  }
}
