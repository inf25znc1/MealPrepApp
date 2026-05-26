import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { PersonSwitcher } from './components/PersonSwitcher';
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

  return (
    <div className="mx-auto max-w-[420px] min-h-svh flex flex-col">
      <TopBar onOpenSettings={() => setHouseholdOpen(true)} />
      <PersonSwitcher />
      <Tabs />
      <main className="min-h-0 flex-1 overflow-y-auto">
        {/* PWA install prompt can go here in a future version */}
        {state.activeTab === 'plan' ? (
          <PlanTab onOpenMealDetail={openMealDetail} />
        ) : (
          <ShoppingTab />
        )}
      </main>

      {state.activeTab === 'plan' && (
        <div className="shrink-0 border-t-[0.5px] border-border-tertiary bg-bg-primary px-3.5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
