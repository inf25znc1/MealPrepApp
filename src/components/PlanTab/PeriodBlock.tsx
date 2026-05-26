import { MEAL_TYPES } from '../../data/constants';
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
  const person = state.people.find((p) => p.id === state.activePersonId);
  const daily = person ? dailyActualFor(person, period) : null;

  const meals = MEAL_TYPES.map((mealType) => [mealType, period.meals[mealType]] as const);

  return (
    <section className="mb-[18px]">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="text-[15px] font-medium">{period.label}</h2>
          <p className="text-xs text-text-secondary">
            Cook {period.cookDay} · eat {period.eatRange}
          </p>
        </div>
        {daily && (
          <div className="text-right">
            <p className="text-xs font-medium">{daily.kcal} kcal/day</p>
            <p className="text-[11px] text-text-secondary">
              {daily.p}P {daily.c}C {daily.f}F
            </p>
          </div>
        )}
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
