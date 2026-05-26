import { parseMealPicks, type MealPicks } from '../domain/mealPicks';
import type { Person } from '../domain/types';

export interface SmartPlanRequest {
  people: Array<{
    cals: number;
    diet: Person['diet'];
    excludes: Person['excludes'];
  }>;
}

export async function fetchSmartPlan(
  people: Person[],
): Promise<MealPicks | null> {
  try {
    const body: SmartPlanRequest = {
      people: people.map((p) => ({
        cals: p.cals,
        diet: p.diet,
        excludes: p.excludes,
      })),
    };

    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') return null;

    const picks = parseMealPicks((data as { picks?: unknown }).picks);
    return picks;
  } catch {
    return null;
  }
}
