import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { Tabs } from './components/Tabs';
import { PlanTab } from './components/PlanTab';
import { GenerateWeekButton } from './components/PlanTab/GenerateWeekButton';
import { ShoppingTab } from './components/ShoppingTab';
import { MealDetailSheet } from './components/sheets/MealDetailSheet';
import { HouseholdSheet } from './components/sheets/HouseholdSheet';
import { useApp } from './state/AppContext';
import type { MealType, PeriodKey } from './domain/types';

export default function App() {
  const { state } = useApp();
  const [mealSheet, setMealSheet] = useState<{
    open: boolean;
    periodKey: PeriodKey | null;
    mealType: MealType | null;
  }>({ open: false, periodKey: null, mealType: null });
  const [householdOpen, setHouseholdOpen] = useState(false);

  const openMealDetail = (periodKey: PeriodKey, mealType: MealType) => {
    setMealSheet({ open: true, periodKey, mealType });
  };

  const showGenerateButton =
    state.activeTab === 'plan' && !mealSheet.open && !householdOpen;

  return (
    <div className="relative mx-auto min-h-svh max-w-[420px]">
      <div
        className={`flex min-h-svh flex-col${showGenerateButton ? ' pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]' : ''}`}
      >
        <TopBar onOpenSettings={() => setHouseholdOpen(true)} />
        <Tabs />
        <main className="min-h-0 flex-1">
          {/* PWA install prompt can go here in a future version */}
          {state.activeTab === 'plan' ? (
            <PlanTab onOpenMealDetail={openMealDetail} />
          ) : (
            <ShoppingTab />
          )}
        </main>
      </div>

      {showGenerateButton && (
        <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[420px] -translate-x-1/2 border-t-[0.5px] border-border-tertiary bg-bg-primary px-3.5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <GenerateWeekButton />
        </div>
      )}

      <MealDetailSheet
        open={mealSheet.open}
        onOpenChange={(open) => setMealSheet((s) => ({ ...s, open }))}
        periodKey={mealSheet.periodKey}
        mealType={mealSheet.mealType}
      />
      <HouseholdSheet
        open={householdOpen}
        onOpenChange={setHouseholdOpen}
      />
    </div>
  );
}
