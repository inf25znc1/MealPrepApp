import { ui } from '../../i18n';
import type { MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { PeriodBlock } from './PeriodBlock';

interface PlanTabProps {
  onOpenMealDetail: (periodKey: PeriodKey, mealType: MealType) => void;
}

export function PlanTab({ onOpenMealDetail }: PlanTabProps) {
  const { state } = useApp();

  return (
    <div className="px-3.5 pt-3.5 pb-3.5">
      {state.plan ? (
        <div className="flex flex-col gap-3">
          <PeriodBlock
            period={state.plan.A}
            onOpenMealDetail={onOpenMealDetail}
          />
          <PeriodBlock
            period={state.plan.B}
            onOpenMealDetail={onOpenMealDetail}
          />
        </div>
      ) : (
        <div className="rounded-lg border-[0.5px] border-border-tertiary bg-bg-primary p-8 text-center text-text-secondary">
          {ui.planEmpty}
        </div>
      )}
    </div>
  );
}
