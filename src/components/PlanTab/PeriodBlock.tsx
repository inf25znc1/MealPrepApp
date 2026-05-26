import { MEAL_TYPES } from '../../data/constants';
import { PersonMacroPill } from '../PersonMacroPill';
import { dailyActualFor } from '../../domain/intake';
import type { MealType, Period } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { MealRow } from './MealRow';

interface PeriodBlockProps {
  period: Period;
  onOpenMealDetail: (periodKey: Period['key'], mealType: MealType) => void;
}

export function PeriodBlock({ period, onOpenMealDetail }: PeriodBlockProps) {
  const { state } = useApp();

  const meals = MEAL_TYPES.map((mealType) => [mealType, period.meals[mealType]] as const);

  return (
    <section className="mb-[18px]">
      <div className="flex flex-col gap-2 mb-2">
        <div>
          <h2 className="text-[15px] font-medium">{period.label}</h2>
          <p className="text-xs text-text-secondary">
            Cook {period.cookDay} · eat {period.eatRange}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          {state.people.map((person) => {
            const daily = dailyActualFor(person, period);
            return (
              <PersonMacroPill key={person.id} person={person}>
                {' · '}
                {daily.kcal} kcal/day · {daily.p}P {daily.c}C {daily.f}F
              </PersonMacroPill>
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
            onOpenDetail={onOpenMealDetail}
          />
        ))}
      </div>
    </section>
  );
}
