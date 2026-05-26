import {
  IconCoffee,
  IconBowl,
  IconToolsKitchen2,
  IconLock,
  IconLockOpen,
  IconRefresh,
} from '@tabler/icons-react';
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

const MEAL_ICONS = {
  breakfast: IconCoffee,
  lunch: IconBowl,
  dinner: IconToolsKitchen2,
} as const;

export function MealRow({
  periodKey,
  mealType,
  slot,
  onOpenDetail,
}: MealRowProps) {
  const { state, dispatch } = useApp();
  const person = state.people.find((p) => p.id === state.activePersonId);
  const macros = person ? personMacros(person, slot.recipe) : null;
  const portionGrams = person
    ? personMealPortionGrams(person, slot.recipe)
    : null;
  const Icon = MEAL_ICONS[mealType];

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
      <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-md bg-bg-secondary">
        <Icon size={18} aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary">
          {mealType}
        </p>
        <p className="text-sm font-medium truncate">{slot.recipe.name}</p>
        {macros && person && (
          <p className="text-xs text-text-secondary">
            {macros.kcal} kcal · {macros.p}P {macros.c}C {macros.f}F
            {portionGrams !== null ? ` · ${portionGrams} g` : ''} · {person.name}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label={slot.locked ? 'Unlock meal' : 'Lock meal'}
        className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-md border-[0.5px] ${
          slot.locked
            ? 'bg-bg-info text-text-info border-border-info'
            : 'border-border-tertiary'
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
        className="flex items-center justify-center w-11 h-11 shrink-0 rounded-md border-[0.5px] border-border-tertiary disabled:opacity-30"
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
