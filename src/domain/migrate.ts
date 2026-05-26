import { MEAL_TYPES } from '../data/constants';
import { PERSON_COLOR_COUNT } from '../data/personColors';
import { PERIOD_A_META, PERIOD_B_META } from '../data/periods';
import { RECIPES } from '../data/recipes';
import { buildPeriod } from './picker';
import type { AppState, Period } from './types';

function migrateCheckedShopping(state: AppState): AppState {
  if (state.checkedShopping && typeof state.checkedShopping === 'object') {
    return state;
  }
  return { ...state, checkedShopping: {} };
}

function migratePeopleColors(state: AppState): AppState {
  let changed = false;
  const people = state.people.map((p, i) => {
    if (typeof p.colorSlot === 'number' && p.colorSlot >= 0) return p;
    changed = true;
    return { ...p, colorSlot: i % PERSON_COLOR_COUNT };
  });
  return changed ? { ...state, people } : state;
}

function mealsComplete(
  meals: Partial<Period['meals']> | undefined,
): meals is Period['meals'] {
  if (!meals) return false;
  return MEAL_TYPES.every((mt) => meals[mt]?.recipe?.id);
}

function migratePeriodLabels(state: AppState): AppState {
  if (!state.plan) return state;
  const { A, B } = state.plan;
  if (A.label === PERIOD_A_META.label && B.label === PERIOD_B_META.label) {
    return state;
  }
  return {
    ...state,
    plan: {
      A: { ...A, label: PERIOD_A_META.label },
      B: { ...B, label: PERIOD_B_META.label },
    },
  };
}

/** Fill missing meal slots (e.g. snack added after a saved plan). */
export function migrateAppState(state: AppState): AppState {
  const withColors = migratePeriodLabels(
    migratePeopleColors(migrateCheckedShopping(state)),
  );
  if (!withColors.plan) return withColors;
  if (
    mealsComplete(withColors.plan.A.meals) &&
    mealsComplete(withColors.plan.B.meals)
  ) {
    return withColors;
  }
  return {
    ...withColors,
    plan: {
      A: buildPeriod(
        PERIOD_A_META,
        withColors.plan.A.meals,
        withColors.people,
        RECIPES,
      ),
      B: buildPeriod(
        PERIOD_B_META,
        withColors.plan.B.meals,
        withColors.people,
        RECIPES,
      ),
    },
  };
}
