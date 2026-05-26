import { Drawer } from 'vaul';
import {
  IconX,
  IconLock,
  IconLockOpen,
  IconRefresh,
} from '@tabler/icons-react';
import { personMacros } from '../../domain/scaling';
import {
  mealIngredientPortions,
  personIngredientPortions,
} from '../../domain/portions';
import type { MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';

interface MealDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodKey: PeriodKey | null;
  mealType: MealType | null;
}

function formatAmount(amount: number, unit: string): string {
  return `${amount} ${unit}`;
}

function formatGrams(grams: number | null): string {
  if (grams === null) return '—';
  return `${grams} g`;
}

export function MealDetailSheet({
  open,
  onOpenChange,
  periodKey,
  mealType,
}: MealDetailSheetProps) {
  const { state, dispatch } = useApp();

  const period =
    periodKey && state.plan ? state.plan[periodKey] : null;
  const slot =
    period && mealType ? period.meals[mealType] : null;

  const portionLines =
    slot && period
      ? mealIngredientPortions(
          slot.recipe,
          state.people,
          period.days,
          state.activePersonId,
        )
      : [];

  const daysLabel = period?.days === 1 ? 'day' : 'days';
  const peopleLabel = state.people.length === 1 ? 'person' : 'people';
  const activePerson = state.people.find(
    (p) => p.id === state.activePersonId,
  );

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mx-auto max-w-[420px] flex flex-col max-h-[85vh] rounded-t-[20px] border-t-[0.5px] border-border-tertiary bg-bg-primary p-4">
          <Drawer.Handle className="mx-auto mb-3.5 w-9 h-1 rounded-full bg-border-secondary" />
          {period && slot && mealType && (
            <div className="overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                    {period.label} · {mealType}
                  </p>
                  <h3 className="text-lg font-medium">{slot.recipe.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Cooked in one batch, divided into {state.people.length}{' '}
                    {peopleLabel}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex items-center justify-center w-11 h-11"
                  onClick={() => onOpenChange(false)}
                >
                  <IconX size={20} aria-hidden />
                </button>
              </div>

              <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary mb-2">
                Nutrition per person (from raw ingredients)
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {state.people.map((person) => {
                  const m = personMacros(person, slot.recipe);
                  let portionGrams = 0;
                  let allGrams = true;
                  for (const ing of slot.recipe.ingredients) {
                    const shares = personIngredientPortions(
                      ing,
                      slot.recipe,
                      [person],
                    );
                    const g = shares[0]?.grams;
                    if (g !== null) portionGrams += g;
                    else allGrams = false;
                  }
                  const active = person.id === state.activePersonId;
                  return (
                    <div
                      key={person.id}
                      className={`flex justify-between p-2.5 rounded-md ${
                        active ? 'bg-bg-info' : 'bg-bg-secondary'
                      }`}
                    >
                      <div>
                        <p className="text-[13px] font-medium">{person.name}</p>
                        <p className="text-[11px] text-text-secondary">
                          {Math.round(m.factor * 100)}% of reference batch
                          {allGrams ? ` · ${portionGrams} g total` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{m.kcal} kcal</p>
                        <p className="text-[11px] text-text-secondary">
                          {m.p}P · {m.c}C · {m.f}F
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary mb-2">
                One batch cook · portions for {activePerson?.name ?? 'you'}
              </p>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-[11px] text-text-secondary text-left">
                    <th className="pb-1 font-normal">Ingredient</th>
                    <th className="pb-1 font-normal text-right">Per person</th>
                    <th className="pb-1 font-normal text-right">Batch total</th>
                  </tr>
                </thead>
                <tbody>
                  {portionLines.map((row) => (
                    <tr
                      key={row.name}
                      className="border-b-[0.5px] border-border-tertiary"
                    >
                      <td className="py-2 pr-2">{row.name}</td>
                      <td className="py-2 text-right text-text-secondary tabular-nums">
                        {row.perPersonGrams !== null ? (
                          formatGrams(row.perPersonGrams)
                        ) : (
                          formatAmount(row.perPersonAmount, row.unit)
                        )}
                      </td>
                      <td className="py-2 text-right text-text-secondary tabular-nums">
                        {row.batchTotalGrams !== null ? (
                          formatGrams(row.batchTotalGrams)
                        ) : (
                          formatAmount(row.batchTotalAmount, row.unit)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary mb-2">
                Period prep · {period.days} {daysLabel}
              </p>
              <table className="w-full text-sm mb-4">
                <tbody>
                  {portionLines.map((row) => (
                    <tr
                      key={`period-${row.name}`}
                      className="border-b-[0.5px] border-border-tertiary"
                    >
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-right text-text-secondary tabular-nums">
                        {row.periodTotalGrams !== null ? (
                          formatGrams(row.periodTotalGrams)
                        ) : (
                          formatAmount(row.periodTotalAmount, row.unit)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border-[0.5px] ${
                    slot.locked
                      ? 'bg-bg-info text-text-info border-border-info'
                      : 'border-border-tertiary'
                  }`}
                  onClick={() => {
                    if (periodKey && mealType) {
                      dispatch({
                        type: 'TOGGLE_LOCK',
                        payload: { periodKey, mealType },
                      });
                    }
                  }}
                >
                  {slot.locked ? (
                    <IconLock size={18} aria-hidden />
                  ) : (
                    <IconLockOpen size={18} aria-hidden />
                  )}
                  {slot.locked ? 'Locked' : 'Lock meal'}
                </button>
                <button
                  type="button"
                  disabled={slot.locked}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md bg-text-info text-white disabled:opacity-30"
                  onClick={() => {
                    if (periodKey && mealType) {
                      dispatch({
                        type: 'REROLL_MEAL',
                        payload: { periodKey, mealType },
                      });
                    }
                  }}
                >
                  <IconRefresh size={18} aria-hidden />
                  Re-roll
                </button>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
