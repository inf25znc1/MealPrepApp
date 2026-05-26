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
  personMealPortionGrams,
  type PersonPortionCell,
} from '../../domain/portions';
import type { MealType, PeriodKey, Unit } from '../../domain/types';
import { useApp } from '../../state/AppContext';

interface MealDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodKey: PeriodKey | null;
  mealType: MealType | null;
}

function formatCell(cell: PersonPortionCell, unit: Unit): string {
  if (cell.grams !== null) return `${cell.grams} g`;
  return `${cell.amount} ${unit}`;
}

function formatTotal(grams: number | null, amount: number, unit: Unit): string {
  if (grams !== null) return `${grams} g`;
  return `${amount} ${unit}`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Column widths (%) so the table fits 360px without horizontal scroll. */
function tableColumnWidths(peopleCount: number): {
  ingredient: number;
  person: number;
  total: number;
} {
  const total = 24;
  if (peopleCount <= 1) {
    return { ingredient: 44, person: 32, total };
  }
  if (peopleCount === 2) {
    return { ingredient: 34, person: 21, total };
  }
  if (peopleCount === 3) {
    return { ingredient: 28, person: 16, total };
  }
  const person = (100 - total - 24) / peopleCount;
  return { ingredient: 24, person, total };
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
      ? mealIngredientPortions(slot.recipe, state.people, period.days)
      : [];

  const daysLabel = period?.days === 1 ? 'day' : 'days';
  const peopleLabel = state.people.length === 1 ? 'person' : 'people';
  const colWidths = tableColumnWidths(state.people.length);

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
                    One batch for {period.days} {daysLabel}, divided into{' '}
                    {state.people.length} {peopleLabel}
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
                Nutrition per meal (from raw ingredients)
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {state.people.map((person) => {
                  const m = personMacros(person, slot.recipe);
                  const portionGrams = personMealPortionGrams(person, slot.recipe);
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
                          {Math.round(m.factor * 100)}% of reference · one meal
                          {portionGrams !== null ? ` · ${portionGrams} g` : ''}
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
                {period.label} batch · cook once for {period.days} {daysLabel}
              </p>
              <p className="text-xs text-text-secondary mb-2">
                Person columns are per day; total is for the full period.
              </p>
              <div className="mb-4 w-full">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col style={{ width: `${colWidths.ingredient}%` }} />
                    {state.people.map((p) => (
                      <col
                        key={p.id}
                        style={{ width: `${colWidths.person}%` }}
                      />
                    ))}
                    <col style={{ width: `${colWidths.total}%` }} />
                  </colgroup>
                  <thead>
                    <tr className="text-[11px] text-text-secondary">
                      <th className="pb-1 pr-1 font-normal text-left align-top leading-tight">
                        Ingredient
                      </th>
                      {state.people.map((p) => (
                        <th
                          key={p.id}
                          className="pb-1 px-0.5 font-normal text-right align-top leading-tight"
                          title={`${p.name} per day`}
                        >
                          {firstName(p.name)}
                          <span className="block text-[10px] font-normal">/ day</span>
                        </th>
                      ))}
                      <th
                        className="pb-1 pl-0.5 font-normal text-right align-top leading-tight"
                        title={`Full period (${period.days} ${daysLabel})`}
                      >
                        Total
                        <span className="block text-[10px] font-normal">
                          {period.days} {daysLabel}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {portionLines.map((row) => (
                      <tr
                        key={row.name}
                        className="border-b-[0.5px] border-border-tertiary"
                      >
                        <td className="py-2 pr-1 align-top break-words leading-snug">
                          {row.name}
                        </td>
                        {state.people.map((p) => {
                          const cell = row.byPersonDaily.find(
                            (c) => c.personId === p.id,
                          );
                          return (
                            <td
                              key={p.id}
                              className="py-2 px-0.5 text-right align-top text-text-secondary tabular-nums leading-snug"
                            >
                              {cell ? formatCell(cell, row.unit) : '—'}
                            </td>
                          );
                        })}
                        <td className="py-2 pl-0.5 text-right align-top text-text-secondary tabular-nums leading-snug">
                          {formatTotal(
                            row.periodTotalGrams,
                            row.periodTotalAmount,
                            row.unit,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
