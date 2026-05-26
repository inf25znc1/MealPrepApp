import { MEAL_TYPES } from '../data/constants';
import { PERIOD_A_META, PERIOD_B_META } from '../data/periods';
import { RECIPES } from '../data/recipes';
import { buildPeriod } from './picker';
import type { AppState, PeriodMeals } from './types';

function mealsComplete(meals: Partial<PeriodMeals> | undefined): meals is PeriodMeals {
  if (!meals) return false;
  return MEAL_TYPES.every((mt) => meals[mt]?.recipe?.id);
}

/** Fill missing meal slots (e.g. snack added after a saved plan). */
export function migrateAppState(state: AppState): AppState {
  if (!state.plan) return state;
  if (mealsComplete(state.plan.A.meals) && mealsComplete(state.plan.B.meals)) {
    return state;
  }
  return {
    ...state,
    plan: {
      A: buildPeriod(
        PERIOD_A_META,
        state.plan.A.meals,
        state.people,
        RECIPES,
      ),
      B: buildPeriod(
        PERIOD_B_META,
        state.plan.B.meals,
        state.people,
        RECIPES,
      ),
    },
  };
}
