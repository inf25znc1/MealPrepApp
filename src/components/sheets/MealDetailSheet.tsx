import { Drawer } from 'vaul';
import {
  IconX,
  IconLock,
  IconLockOpen,
  IconRefresh,
} from '@tabler/icons-react';
import { personScale, personMacros } from '../../domain/scaling';
import type { MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';

interface MealDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodKey: PeriodKey | null;
  mealType: MealType | null;
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

  const ingredientRows =
    slot && period
      ? slot.recipe.ingredients.map((ing) => {
          let qty = 0;
          for (const person of state.people) {
            qty += ing.amount * personScale(person, slot.recipe);
          }
          qty = Math.round(qty * period.days * 10) / 10;
          if (ing.unit === 'g' || ing.unit === 'ml') qty = Math.round(qty);
          return { ...ing, qty };
        })
      : [];

  const daysLabel = period?.days === 1 ? 'day' : 'days';
  const peopleLabel = state.people.length === 1 ? 'person' : 'people';

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
                Nutrition per person
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {state.people.map((person) => {
                  const m = personMacros(person, slot.recipe);
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
                          {Math.round(m.factor * 100)}% portion
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
                Raw ingredients · {period.days} {daysLabel},{' '}
                {state.people.length} {peopleLabel}
              </p>
              <table className="w-full text-sm mb-4">
                <tbody>
                  {ingredientRows.map((row) => (
                    <tr
                      key={row.name}
                      className="border-b-[0.5px] border-border-tertiary"
                    >
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-right text-text-secondary tabular-nums">
                        {row.qty} {row.unit}
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
