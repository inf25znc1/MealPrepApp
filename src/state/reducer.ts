import { ui } from '../i18n';
import { nextColorSlot } from '../data/personColors';
import { buildPlanFromAiMeals, type AiWeekMeals } from '../domain/aiPlan';
import { migrateAppState } from '../domain/migrate';
import { foodKey } from '../data/foods';
import {
  cloneRecipeForFavorite,
  syncRecipeMacros,
} from '../domain/favorites';
import type {
  AppState,
  PackageProduct,
  Person,
  PeriodKey,
  MealType,
  Recipe,
} from '../domain/types';

export type Action =
  | { type: 'GENERATE_PLAN_WITH_AI'; payload: AiWeekMeals }
  | {
      type: 'SET_MEAL_FROM_AI';
      payload: { periodKey: PeriodKey; mealType: MealType; recipe: Recipe };
    }
  | { type: 'TOGGLE_LOCK'; payload: { periodKey: PeriodKey; mealType: MealType } }
  | { type: 'SET_ACTIVE_TAB'; payload: 'plan' | 'shop' }
  | { type: 'SET_ACTIVE_PERSON'; payload: string }
  | { type: 'ADD_PERSON' }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'UPDATE_PERSON'; payload: { id: string; patch: Partial<Person> } }
  | { type: 'TOGGLE_SHOPPING_CHECK'; payload: { itemId: string } }
  | { type: 'ADD_PACKAGE_PRODUCT'; payload: { name: string; packageQty: number } }
  | { type: 'REMOVE_PACKAGE_PRODUCT'; payload: string }
  | { type: 'SAVE_FAVORITE_RECIPE'; payload: Recipe }
  | { type: 'ADD_FAVORITE_RECIPE'; payload: Recipe }
  | { type: 'REMOVE_FAVORITE_RECIPE'; payload: string }
  | {
      type: 'REPLACE_MEAL_WITH_FAVORITE';
      payload: {
        periodKey: PeriodKey;
        mealType: MealType;
        favoriteId: string;
      };
    }
  | { type: 'HYDRATE'; payload: AppState };

export const initialState: AppState = {
  people: [
    {
      id: 'p1',
      name: ui.defaultYou,
      cals: 2100,
      diet: 'balanced',
      excludes: [],
      colorSlot: 0,
    },
    {
      id: 'p2',
      name: ui.defaultPartner,
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
  packageProducts: [],
  favoriteRecipes: [],
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GENERATE_PLAN_WITH_AI':
      return {
        ...state,
        plan: buildPlanFromAiMeals(state.plan, action.payload),
        checkedShopping: {},
      };

    case 'SET_MEAL_FROM_AI': {
      if (!state.plan) return state;
      const { periodKey, mealType, recipe } = action.payload;
      const period = state.plan[periodKey];
      const slot = period.meals[mealType];
      if (slot.locked) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          [periodKey]: {
            ...period,
            meals: {
              ...period.meals,
              [mealType]: {
                recipe: {
                  ...recipe,
                  meal: mealType,
                  ingredients: recipe.ingredients.map((i) => ({ ...i })),
                  steps: [...recipe.steps],
                },
                locked: false,
              },
            },
          },
        },
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
        name: ui.newPersonName(n),
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

    case 'ADD_PACKAGE_PRODUCT': {
      const { name, packageQty } = action.payload;
      const id = foodKey(name);
      const entry: PackageProduct = { id, name, packageQty, unit: 'g' };
      const rest = state.packageProducts.filter((p) => p.id !== id);
      return {
        ...state,
        packageProducts: [...rest, entry],
      };
    }

    case 'REMOVE_PACKAGE_PRODUCT': {
      return {
        ...state,
        packageProducts: state.packageProducts.filter(
          (p) => p.id !== action.payload,
        ),
      };
    }

    case 'SAVE_FAVORITE_RECIPE': {
      const cloned = syncRecipeMacros(
        cloneRecipeForFavorite(action.payload),
      );
      if (state.favoriteRecipes.some((r) => r.id === cloned.id)) {
        return state;
      }
      return {
        ...state,
        favoriteRecipes: [...state.favoriteRecipes, cloned],
      };
    }

    case 'ADD_FAVORITE_RECIPE': {
      const recipe = syncRecipeMacros(action.payload);
      const rest = state.favoriteRecipes.filter((r) => r.id !== recipe.id);
      return {
        ...state,
        favoriteRecipes: [...rest, recipe],
      };
    }

    case 'REMOVE_FAVORITE_RECIPE': {
      return {
        ...state,
        favoriteRecipes: state.favoriteRecipes.filter(
          (r) => r.id !== action.payload,
        ),
      };
    }

    case 'REPLACE_MEAL_WITH_FAVORITE': {
      if (!state.plan) return state;
      const favorite = state.favoriteRecipes.find(
        (r) => r.id === action.payload.favoriteId,
      );
      if (!favorite) return state;
      const { periodKey, mealType } = action.payload;
      const period = state.plan[periodKey];
      const slot = period.meals[mealType];
      const recipe: Recipe = {
        ...favorite,
        meal: favorite.meal,
        ingredients: favorite.ingredients.map((i) => ({ ...i })),
        steps: [...favorite.steps],
      };
      return {
        ...state,
        plan: {
          ...state.plan,
          [periodKey]: {
            ...period,
            meals: {
              ...period.meals,
              [mealType]: { ...slot, recipe },
            },
          },
        },
      };
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
