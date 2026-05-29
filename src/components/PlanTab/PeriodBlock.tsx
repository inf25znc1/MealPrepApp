import { MEAL_TYPES } from '../../data/constants';
import { periodLabel, ui } from '../../i18n';
import { PersonLabel } from '../PersonMacroPill';
import { PersonMacroValues } from '../PersonMacroValues';
import { dailyActualFor } from '../../domain/intake';
import type { MealType, Period, Plan } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { MealRow } from './MealRow';

function collectRecipeNames(plan: Plan | null): string[] {
  if (!plan) return [];
  const names = new Set<string>();
  for (const pk of ['A', 'B'] as const) {
    for (const mealType of MEAL_TYPES) {
      names.add(plan[pk].meals[mealType].recipe.name);
    }
  }
  return [...names];
}

interface PeriodBlockProps {
  period: Period;
  onOpenMealDetail: (periodKey: Period['key'], mealType: MealType) => void;
}

export function PeriodBlock({ period, onOpenMealDetail }: PeriodBlockProps) {
  const { state } = useApp();
  const avoidRecipeNames = collectRecipeNames(state.plan);

  const meals = MEAL_TYPES.map((mealType) => [mealType, period.meals[mealType]] as const);

  return (
    <section className="rounded-lg border-[0.5px] border-border-tertiary bg-bg-primary p-4">
      <div className="mb-3 flex flex-col gap-2">
        <h2 className="text-[15px] font-medium">{periodLabel(period.key)}</h2>
        <div className="flex flex-col gap-1 rounded-lg bg-bg-secondary p-3">
          {state.people.map((person) => {
            const daily = dailyActualFor(person, period, state.people);
            return (
              <div
                key={person.id}
                className="flex w-full items-baseline justify-between gap-2"
              >
                <PersonLabel person={person} className="shrink-0" />
                <PersonMacroValues macros={daily} kcalLabel={ui.kcalPerDay} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {meals.map(([mealType, slot]) => (
          <MealRow
            key={mealType}
            periodKey={period.key}
            mealType={mealType}
            slot={slot}
            periodDays={period.days}
            avoidRecipeNames={avoidRecipeNames}
            onOpenDetail={onOpenMealDetail}
          />
        ))}
      </div>
    </section>
  );
}
