import { useState } from 'react';
import { IconLock, IconLockOpen, IconRefresh } from '@tabler/icons-react';
import { fetchAiMeal } from '../../api/fetchAiPlan';
import { favoriteDisplayName, isStoredFavoriteId } from '../../domain/favorites';
import { mealTypeLabel, recipeName, ui } from '../../i18n';
import { PersonLabel } from '../PersonMacroPill';
import { PersonMacroValues } from '../PersonMacroValues';
import { personMacros } from '../../domain/scaling';
import type { MealSlot, MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';

interface MealRowProps {
  periodKey: PeriodKey;
  mealType: MealType;
  slot: MealSlot;
  periodDays: number;
  avoidRecipeNames: string[];
  onOpenDetail: (periodKey: PeriodKey, mealType: MealType) => void;
}

function rowTitle(slot: MealSlot): string {
  if (isStoredFavoriteId(slot.recipe.id) || slot.recipe.id.startsWith('gen-')) {
    return favoriteDisplayName(slot.recipe);
  }
  return recipeName(slot.recipe.id, slot.recipe.name);
}

export function MealRow({
  periodKey,
  mealType,
  slot,
  periodDays,
  avoidRecipeNames,
  onOpenDetail,
}: MealRowProps) {
  const { state, dispatch } = useApp();
  const [rerolling, setRerolling] = useState(false);

  const handleReroll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slot.locked || rerolling) return;
    setRerolling(true);
    try {
      const recipe = await fetchAiMeal(
        state.people,
        state.packageProducts ?? [],
        state.favoriteRecipes ?? [],
        periodKey,
        periodDays,
        mealType,
        avoidRecipeNames,
      );
      if (recipe) {
        dispatch({
          type: 'SET_MEAL_FROM_AI',
          payload: { periodKey, mealType, recipe },
        });
      }
    } finally {
      setRerolling(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(periodKey, mealType)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(periodKey, mealType);
        }
      }}
      className="cursor-pointer rounded-md border-[0.5px] border-border-tertiary bg-bg-primary p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-normal uppercase tracking-[0.5px] text-text-tertiary">
            {mealTypeLabel(mealType)}
          </p>
          <p className="truncate text-sm font-medium">{rowTitle(slot)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label={slot.locked ? ui.unlockMeal : ui.lockMeal}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
              slot.locked ? 'bg-bg-info text-text-info' : 'bg-transparent'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: 'TOGGLE_LOCK',
                payload: { periodKey, mealType },
              });
            }}
          >
            {slot.locked ? (
              <IconLock size={18} aria-hidden />
            ) : (
              <IconLockOpen size={18} aria-hidden />
            )}
          </button>
          <button
            type="button"
            aria-label={ui.rerollMeal}
            disabled={slot.locked || rerolling}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-transparent disabled:opacity-30"
            onClick={(e) => void handleReroll(e)}
          >
            <IconRefresh
              size={18}
              aria-hidden
              className={rerolling ? 'animate-spin' : undefined}
            />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {state.people.map((person) => {
          const macros = personMacros(
            person,
            slot.recipe,
            state.people,
            periodDays,
          );
          return (
            <div
              key={person.id}
              className="flex items-baseline justify-between gap-2"
            >
              <PersonLabel person={person} className="shrink-0" />
              <PersonMacroValues macros={macros} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
