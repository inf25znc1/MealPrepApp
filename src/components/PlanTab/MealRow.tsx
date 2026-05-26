import { IconLock, IconLockOpen, IconRefresh } from '@tabler/icons-react';
import { PersonMacroPill } from '../PersonMacroPill';
import { personMacros } from '../../domain/scaling';
import { personMealPortionGrams } from '../../domain/portions';
import type { MealSlot, MealType, PeriodKey } from '../../domain/types';
import { useApp } from '../../state/AppContext';

interface MealRowProps {
  periodKey: PeriodKey;
  mealType: MealType;
  slot: MealSlot;
  onOpenDetail: (periodKey: PeriodKey, mealType: MealType) => void;
}

export function MealRow({
  periodKey,
  mealType,
  slot,
  onOpenDetail,
}: MealRowProps) {
  const { state, dispatch } = useApp();

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
      className="flex items-center gap-2.5 p-3 rounded-md border-[0.5px] border-border-tertiary cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary">
          {mealType}
        </p>
        <p className="text-sm font-medium truncate">{slot.recipe.name}</p>
        <div className="mt-1.5 flex flex-col items-start gap-1">
          {state.people.map((person) => {
            const macros = personMacros(person, slot.recipe);
            const portionGrams = personMealPortionGrams(person, slot.recipe);
            return (
              <PersonMacroPill key={person.id} person={person}>
                {' · '}
                {macros.kcal} kcal · {macros.p}P {macros.c}C {macros.f}F
                {portionGrams !== null ? ` · ${portionGrams} g` : ''}
              </PersonMacroPill>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        aria-label={slot.locked ? 'Unlock meal' : 'Lock meal'}
        className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-md ${
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
        aria-label="Re-roll meal"
        disabled={slot.locked}
        className="flex items-center justify-center w-11 h-11 shrink-0 rounded-md bg-transparent disabled:opacity-30"
        onClick={(e) => {
          e.stopPropagation();
          dispatch({
            type: 'REROLL_MEAL',
            payload: { periodKey, mealType },
          });
        }}
      >
        <IconRefresh size={18} aria-hidden />
      </button>
    </div>
  );
}
