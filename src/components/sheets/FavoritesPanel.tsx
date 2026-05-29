import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { MEAL_TYPES } from '../../data/constants';
import {
  createCustomRecipeDraft,
  favoriteDisplayName,
  isValidFavoriteRecipe,
  newFavoriteId,
  normalizeIngredient,
  parseStepsText,
  syncRecipeMacros,
} from '../../domain/favorites';
import type { MealType } from '../../domain/types';
import { mealTypeLabel, ui } from '../../i18n';
import { useApp } from '../../state/AppContext';

interface FavoritesPanelProps {
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
}

export function FavoritesPanel({
  formOpen,
  onFormOpenChange,
}: FavoritesPanelProps) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [meal, setMeal] = useState<MealType>('lunch');
  const [stepsText, setStepsText] = useState('');
  const [ingredients, setIngredients] = useState<
    Array<{ name: string; amount: string }>
  >([{ name: '', amount: '100' }]);

  const favorites = state.favoriteRecipes ?? [];

  const resetForm = () => {
    onFormOpenChange(false);
    setName('');
    setMeal('lunch');
    setStepsText('');
    setIngredients([{ name: '', amount: '100' }]);
  };

  const saveCustom = () => {
    const parsedIngredients = ingredients
      .map((row) => {
        const qty = Number(row.amount);
        if (!row.name.trim() || !Number.isFinite(qty) || qty <= 0) return null;
        return normalizeIngredient(row.name, qty);
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);

    const draft = syncRecipeMacros({
      ...createCustomRecipeDraft(meal),
      id: newFavoriteId('custom'),
      name: name.trim(),
      meal,
      ingredients: parsedIngredients,
      steps: parseStepsText(stepsText),
    });

    if (!isValidFavoriteRecipe(draft)) return;

    dispatch({ type: 'ADD_FAVORITE_RECIPE', payload: draft });
    resetForm();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-secondary">{ui.favoritesIntro}</p>

      {formOpen ? (
        <div className="flex flex-col gap-3 rounded-md border-[0.5px] border-border-tertiary bg-bg-secondary p-3">
          <label className="text-xs text-text-secondary">
            {ui.customRecipeName}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-text-secondary">
            {ui.customRecipeMeal}
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value as MealType)}
              className="mt-1 block w-full rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
            >
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {mealTypeLabel(m)}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-1.5 text-xs text-text-secondary">{ui.ingredient}</p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {ingredients.map((row, index) => (
                <li key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={row.name}
                    placeholder={ui.ingredientNamePlaceholder}
                    onChange={(e) => {
                      const next = [...ingredients];
                      next[index] = { ...next[index], name: e.target.value };
                      setIngredients(next);
                    }}
                    className="min-w-0 flex-1 rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
                  />
                  <div className="flex w-24 shrink-0 items-center gap-1 rounded-md border-[0.5px] border-border-tertiary bg-bg-primary pl-2">
                    <span
                      className="shrink-0 text-sm text-text-tertiary"
                      aria-hidden
                    >
                      г
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={row.amount}
                      onChange={(e) => {
                        const next = [...ingredients];
                        next[index] = { ...next[index], amount: e.target.value };
                        setIngredients(next);
                      }}
                      className="min-w-0 flex-1 border-0 bg-transparent py-1.5 pr-2 text-sm tabular-nums focus:outline-none"
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      aria-label={ui.removeFavoriteRecipe(row.name || ui.ingredient)}
                      className="flex h-11 w-9 shrink-0 items-center justify-center"
                      onClick={() =>
                        setIngredients(ingredients.filter((_, i) => i !== index))
                      }
                    >
                      <IconTrash size={16} aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                setIngredients([...ingredients, { name: '', amount: '100' }])
              }
              className="mt-2 text-xs text-text-info"
            >
              {ui.addIngredient}
            </button>
          </div>

          <label className="text-xs text-text-secondary">
            {ui.customRecipeSteps}
            <textarea
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder={ui.customRecipeStepsPlaceholder}
              rows={4}
              className="mt-1 block w-full resize-y rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveCustom}
              className="btn-primary flex-1 py-2.5"
            >
              {ui.saveFavoriteRecipe}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 rounded-md border-[0.5px] border-border-tertiary bg-bg-primary py-2.5 text-sm"
            >
              {ui.cancel}
            </button>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">
          {ui.favoritesEmpty}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {favorites.map((recipe) => (
            <li
              key={recipe.id}
              className="flex items-center gap-2 rounded-md bg-bg-secondary p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {favoriteDisplayName(recipe)}
                </p>
                <p className="text-xs text-text-secondary">
                  {mealTypeLabel(recipe.meal)}
                  {recipe.kcal > 0 ? ` · ${recipe.kcal}${ui.kcal}` : ''}
                </p>
              </div>
              <button
                type="button"
                aria-label={ui.removeFavoriteRecipe(
                  favoriteDisplayName(recipe),
                )}
                className="flex h-11 w-11 shrink-0 items-center justify-center"
                onClick={() =>
                  dispatch({
                    type: 'REMOVE_FAVORITE_RECIPE',
                    payload: recipe.id,
                  })
                }
              >
                <IconTrash size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
