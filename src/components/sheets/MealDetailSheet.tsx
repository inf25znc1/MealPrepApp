import { useState } from 'react';
import { Drawer } from 'vaul';
import { IconBookmark, IconReplace, IconX } from '@tabler/icons-react';
import { PersonLabel } from '../PersonMacroPill';
import { PersonMacroValues } from '../PersonMacroValues';
import { stepsFor } from '../../data/recipeSteps';
import {
  favoriteDisplayName,
  isStoredFavoriteId,
} from '../../domain/favorites';
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
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [savedHint, setSavedHint] = useState(false);

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
    slot && slot.recipe.steps?.length > 0
      ? slot.recipe.steps
      : slot && !slot.recipe.id.startsWith('gen-')
        ? stepsFor(slot.recipe.id)
        : [];

  const favorites = state.favoriteRecipes ?? [];
  const matchingFavorites = mealType
    ? favorites.filter((r) => r.meal === mealType)
    : [];
  const alreadyFavorite =
    slot !== null &&
    slot !== undefined &&
    favorites.some((r) => r.id === slot.recipe.id);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReplaceOpen(false);
      setSavedHint(false);
    }
    onOpenChange(next);
  };

  const saveFavorite = () => {
    if (!slot) return;
    dispatch({ type: 'SAVE_FAVORITE_RECIPE', payload: slot.recipe });
    setSavedHint(true);
  };

  const replaceWith = (favoriteId: string) => {
    if (!periodKey || !mealType) return;
    dispatch({
      type: 'REPLACE_MEAL_WITH_FAVORITE',
      payload: { periodKey, mealType, favoriteId },
    });
    setReplaceOpen(false);
    onOpenChange(false);
  };

  const displayTitle = slot
    ? isStoredFavoriteId(slot.recipe.id) || slot.recipe.id.startsWith('gen-')
      ? favoriteDisplayName(slot.recipe)
      : recipeName(slot.recipe.id, slot.recipe.name)
    : '';

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mx-auto flex max-h-[85vh] w-full max-w-[420px] flex-col rounded-t-[20px] border-t-[0.5px] border-border-tertiary bg-bg-primary p-4">
          <Drawer.Handle className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-border-secondary" />
          {period && slot && mealType && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                      {periodLabel(period.key)} · {mealTypeLabel(mealType)}
                    </p>
                    <h3 className="text-lg font-medium">{displayTitle}</h3>
                  </div>
                  <button
                    type="button"
                    aria-label={ui.close}
                    className="flex h-11 w-11 items-center justify-center"
                    onClick={() => handleOpenChange(false)}
                  >
                    <IconX size={20} aria-hidden />
                  </button>
                </div>

                {replaceOpen ? (
                  <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                    <p className="mb-3 text-sm font-medium">
                      {ui.selectFavoriteToReplace}
                    </p>
                    {matchingFavorites.length === 0 ? (
                      <p className="text-sm text-text-secondary">
                        {ui.noFavoritesForMeal(mealTypeLabel(mealType))}
                      </p>
                    ) : (
                      <ul className="m-0 flex list-none flex-col gap-1 p-0">
                        {matchingFavorites.map((recipe) => (
                          <li key={recipe.id}>
                            <button
                              type="button"
                              onClick={() => replaceWith(recipe.id)}
                              className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-bg-primary"
                            >
                              {favoriteDisplayName(recipe)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => setReplaceOpen(false)}
                      className="mt-3 w-full rounded-md border-[0.5px] border-border-tertiary py-2 text-sm"
                    >
                      {ui.cancelReplace}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                        {ui.nutritionPerMeal}
                      </p>
                      <div className="flex flex-col gap-1">
                        {state.people.map((person) => {
                          const m = personMacros(
                            person,
                            slot.recipe,
                            state.people,
                            period.days,
                          );
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
                            <th className="pb-1 pr-1 text-left align-top font-normal leading-tight">
                              {ui.ingredient}
                            </th>
                            {state.people.map((p) => (
                              <th
                                key={p.id}
                                className="px-0.5 pb-1 text-right align-top font-normal leading-tight"
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
                              className="pb-1 pl-0.5 text-right align-top font-normal leading-tight"
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
                              <td className="break-words py-2 pr-1 align-top leading-snug">
                                {ingredientLabel(row.name)}
                              </td>
                              {state.people.map((p) => {
                                const cell = row.byPersonDaily.find(
                                  (c) => c.personId === p.id,
                                );
                                return (
                                  <td
                                    key={p.id}
                                    className="px-0.5 py-2 text-right align-top tabular-nums leading-snug text-text-secondary"
                                  >
                                    {cell ? formatCell(cell, row.unit) : '—'}
                                  </td>
                                );
                              })}
                              <td className="py-2 pl-0.5 text-right align-top tabular-nums leading-snug text-text-secondary">
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
                  </>
                )}
              </div>

              {!replaceOpen && (
                <div className="shrink-0 flex flex-col gap-2 border-t-[0.5px] border-border-tertiary pt-3">
                  {savedHint && (
                    <p className="text-center text-xs text-text-success">
                      {ui.savedToFavorites}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={alreadyFavorite}
                    onClick={saveFavorite}
                    className="btn-primary w-full py-2.5 disabled:opacity-50"
                  >
                    <IconBookmark size={18} aria-hidden />
                    {alreadyFavorite ? ui.alreadyInFavorites : ui.saveAsFavorite}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-[0.5px] border-border-tertiary py-2.5 text-sm"
                  >
                    <IconReplace size={18} aria-hidden />
                    {ui.replaceWithFavorite}
                  </button>
                </div>
              )}
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
