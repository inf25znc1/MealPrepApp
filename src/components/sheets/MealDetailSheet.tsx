import { Drawer } from 'vaul';
import { IconX } from '@tabler/icons-react';
import { PersonLabel } from '../PersonMacroPill';
import { PersonMacroValues } from '../PersonMacroValues';
import { stepsFor } from '../../data/recipeSteps';
import {
  daysWord,
  ingredientLabel,
  mealTypeLabel,
  periodLabel,
  recipeName,
  ui,
  unitLabel,
} from '../../i18n';
import { personMacros } from '../../domain/scaling';
import {
  mealIngredientPortions,
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
  if (cell.grams !== null) return `${cell.grams} ${unitLabel('g')}`;
  return `${cell.amount} ${unitLabel(unit)}`;
}

function formatTotal(grams: number | null, amount: number, unit: Unit): string {
  if (grams !== null) return `${grams} ${unitLabel('g')}`;
  return `${amount} ${unitLabel(unit)}`;
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
  const { state } = useApp();

  const period =
    periodKey && state.plan ? state.plan[periodKey] : null;
  const slot =
    period && mealType ? period.meals[mealType] : null;

  const portionLines =
    slot && period
      ? mealIngredientPortions(slot.recipe, state.people, period.days)
      : [];

  const daysLabel = period ? daysWord(period.days) : '';
  const colWidths = tableColumnWidths(state.people.length);
  const recipeSteps =
    slot && slot.recipe.steps?.length
      ? slot.recipe.steps
      : slot
        ? stepsFor(slot.recipe.id)
        : [];

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
                    {periodLabel(period.key)} · {mealTypeLabel(mealType)}
                  </p>
                  <h3 className="text-lg font-medium">
                    {recipeName(slot.recipe.id, slot.recipe.name)}
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label={ui.close}
                  className="flex items-center justify-center w-11 h-11"
                  onClick={() => onOpenChange(false)}
                >
                  <IconX size={20} aria-hidden />
                </button>
              </div>

              <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                <p className="mb-2 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                  {ui.nutritionPerMeal}
                </p>
                <div className="flex flex-col gap-1">
                  {state.people.map((person) => {
                    const m = personMacros(person, slot.recipe);
                    return (
                      <div
                        key={person.id}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <PersonLabel person={person} className="shrink-0" />
                        <PersonMacroValues macros={m} />
                      </div>
                    );
                  })}
                </div>
              </div>

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
                        {ui.ingredient}
                      </th>
                      {state.people.map((p) => (
                        <th
                          key={p.id}
                          className="pb-1 px-0.5 font-normal text-right align-top leading-tight"
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <PersonLabel
                              person={p}
                              displayName={firstName(p.name)}
                            />
                            <span className="text-[10px] text-text-secondary">
                              {ui.perDay}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th
                        className="pb-1 pl-0.5 font-normal text-right align-top leading-tight"
                        title={ui.fullPeriod(period.days, daysLabel)}
                      >
                        {ui.total}
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
                          {ingredientLabel(row.name)}
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

              {recipeSteps.length > 0 && (
                <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                    {ui.steps}
                  </p>
                  <ol className="flex list-none flex-col gap-3">
                    {recipeSteps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-xs font-medium text-text-secondary"
                          aria-hidden
                        >
                          {index + 1}
                        </span>
                        <span className="pt-0.5 text-sm leading-snug text-text-primary">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
