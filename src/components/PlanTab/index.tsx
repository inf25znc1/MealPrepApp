import { IconSparkles } from '@tabler/icons-react';
import type { MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { DailyIntakeCard } from './DailyIntakeCard';
import { PeriodBlock } from './PeriodBlock';

interface PlanTabProps {
  onOpenMealDetail: (periodKey: PeriodKey, mealType: MealType) => void;
}

export function PlanTab({ onOpenMealDetail }: PlanTabProps) {
  const { state, dispatch } = useApp();

  return (
    <div className="px-3.5 pt-3.5 pb-3.5">
      <button
        type="button"
        onClick={() => dispatch({ type: 'GENERATE_PLAN' })}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-text-info text-white font-medium"
      >
        <IconSparkles size={18} aria-hidden />
        Generate week
      </button>

      {state.plan ? (
        <>
          <div className="mt-3.5">
            <DailyIntakeCard />
          </div>
          <PeriodBlock
            period={state.plan.A}
            onOpenMealDetail={onOpenMealDetail}
          />
          <PeriodBlock
            period={state.plan.B}
            onOpenMealDetail={onOpenMealDetail}
          />
        </>
      ) : (
        <div className="mt-3.5 p-8 text-center rounded-lg bg-bg-secondary text-text-secondary">
          Tap Generate week to plan your meals.
        </div>
      )}
    </div>
  );
}
