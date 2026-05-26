import { nextColorSlot } from '../data/personColors';
import { PERIOD_A_META, PERIOD_B_META } from '../data/periods';
import { RECIPES } from '../data/recipes';
import { migrateAppState } from '../domain/migrate';
import { buildPeriod, rerollMeal } from '../domain/picker';
import type {
  AppState,
  Person,
  PeriodKey,
  MealType,
  Plan,
} from '../domain/types';

export type Action =
  | { type: 'GENERATE_PLAN' }
  | { type: 'REROLL_MEAL'; payload: { periodKey: PeriodKey; mealType: MealType } }
  | { type: 'TOGGLE_LOCK'; payload: { periodKey: PeriodKey; mealType: MealType } }
  | { type: 'SET_ACTIVE_TAB'; payload: 'plan' | 'shop' }
  | { type: 'SET_ACTIVE_PERSON'; payload: string }
  | { type: 'ADD_PERSON' }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'UPDATE_PERSON'; payload: { id: string; patch: Partial<Person> } }
  | { type: 'TOGGLE_SHOPPING_CHECK'; payload: { itemId: string } }
  | { type: 'HYDRATE'; payload: AppState };

export const initialState: AppState = {
  people: [
    {
      id: 'p1',
      name: 'You',
      cals: 2100,
      diet: 'balanced',
      excludes: [],
      colorSlot: 0,
    },
    {
      id: 'p2',
      name: 'Partner',
      cals: 1800,
      diet: 'mediterranean',
      excludes: ['seafood'],
      colorSlot: 1,
    },
  ],
  plan: null,
  activeTab: 'plan',
  activePersonId: 'p1',
  checkedShopping: {},
};

function buildFullPlan(state: AppState): Plan {
  const existing = state.plan;
  return {
    A: buildPeriod(
      PERIOD_A_META,
      existing?.A.meals ?? null,
      state.people,
      RECIPES,
    ),
    B: buildPeriod(
      PERIOD_B_META,
      existing?.B.meals ?? null,
      state.people,
      RECIPES,
    ),
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GENERATE_PLAN':
      return { ...state, plan: buildFullPlan(state), checkedShopping: {} };

    case 'REROLL_MEAL': {
      if (!state.plan) return state;
      const { periodKey, mealType } = action.payload;
      return {
        ...state,
        plan: rerollMeal(
          state.plan,
          periodKey,
          mealType,
          state.people,
          RECIPES,
        ),
      };
    }

    case 'TOGGLE_LOCK': {
      if (!state.plan) return state;
      const { periodKey, mealType } = action.payload;
      const period = state.plan[periodKey];
      const slot = period.meals[mealType];
      const newPeriod = {
        ...period,
        meals: {
          ...period.meals,
          [mealType]: { ...slot, locked: !slot.locked },
        },
      };
      return {
        ...state,
        plan: { ...state.plan, [periodKey]: newPeriod },
      };
    }

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_ACTIVE_PERSON':
      return { ...state, activePersonId: action.payload };

    case 'ADD_PERSON': {
      const n = state.people.length + 1;
      const newPerson: Person = {
        id: `p${Date.now()}`,
        name: `Person ${n}`,
        cals: 2000,
        diet: 'balanced',
        excludes: [],
        colorSlot: nextColorSlot(state.people),
      };
      return { ...state, people: [...state.people, newPerson] };
    }

    case 'REMOVE_PERSON': {
      if (state.people.length <= 1) return state;
      const people = state.people.filter((p) => p.id !== action.payload);
      const activePersonId =
        state.activePersonId === action.payload
          ? people[0].id
          : state.activePersonId;
      return { ...state, people, activePersonId };
    }

    case 'UPDATE_PERSON': {
      const people = state.people.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload.patch } : p,
      );
      return { ...state, people };
    }

    case 'TOGGLE_SHOPPING_CHECK': {
      const { itemId } = action.payload;
      const checked = { ...state.checkedShopping };
      if (checked[itemId]) {
        delete checked[itemId];
      } else {
        checked[itemId] = true;
      }
      return { ...state, checkedShopping: checked };
    }

    case 'HYDRATE':
      return migrateAppState(action.payload);

    default:
      return state;
  }
}
