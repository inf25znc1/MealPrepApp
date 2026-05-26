import type { MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { DailyIntakeCard } from './DailyIntakeCard';
import { PeriodBlock } from './PeriodBlock';

interface PlanTabProps {
  onOpenMealDetail: (periodKey: PeriodKey, mealType: MealType) => void;
}

export function PlanTab({ onOpenMealDetail }: PlanTabProps) {
  const { state } = useApp();

  return (
    <div className="px-3.5 pt-3.5 pb-3.5">
      {state.plan ? (
        <>
          <DailyIntakeCard />
          <div className="mt-3.5">
            <PeriodBlock
              period={state.plan.A}
              onOpenMealDetail={onOpenMealDetail}
            />
          </div>
          <PeriodBlock
            period={state.plan.B}
            onOpenMealDetail={onOpenMealDetail}
          />
        </>
      ) : (
        <div className="p-8 text-center rounded-lg bg-bg-secondary text-text-secondary">
          Tap Generate week below to plan your meals.
        </div>
      )}
    </div>
  );
}
