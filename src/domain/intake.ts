import { personMacros } from './scaling';
import type { Person, Period, Plan, DailyTargets } from './types';

export function dailyActualFor(
  person: Person,
  period: Period,
  people: Person[],
): DailyTargets {
  let kcal = 0;
  let p = 0;
  let c = 0;
  let f = 0;
  for (const slot of Object.values(period.meals)) {
    const m = personMacros(person, slot.recipe, people, period.days);
    kcal += m.kcal;
    p += m.p;
    c += m.c;
    f += m.f;
  }
  return { kcal, p, c, f };
}

export function weeklyAverageFor(
  person: Person,
  plan: Plan,
  people: Person[],
): DailyTargets {
  const totalDays = plan.A.days + plan.B.days;
  const a = dailyActualFor(person, plan.A, people);
  const b = dailyActualFor(person, plan.B, people);
  return {
    kcal: Math.round((a.kcal * plan.A.days + b.kcal * plan.B.days) / totalDays),
    p: Math.round((a.p * plan.A.days + b.p * plan.B.days) / totalDays),
    c: Math.round((a.c * plan.A.days + b.c * plan.B.days) / totalDays),
    f: Math.round((a.f * plan.A.days + b.f * plan.B.days) / totalDays),
  };
}
