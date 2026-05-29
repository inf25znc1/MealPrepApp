import { Drawer } from 'vaul';
import { IconX } from '@tabler/icons-react';
import { favoriteDisplayName } from '../../domain/favorites';
import { ingredientLabel, mealTypeLabel, ui, unitLabel } from '../../i18n';
import type { Recipe } from '../../domain/types';

interface FavoriteRecipeDetailSheetProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoriteRecipeDetailSheet({
  recipe,
  open,
  onOpenChange,
}: FavoriteRecipeDetailSheetProps) {
  const g = unitLabel('g');

  return (
    <Drawer.Root open={open && recipe !== null} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mx-auto flex max-h-[85vh] w-full max-w-[420px] flex-col rounded-t-[20px] border-t-[0.5px] border-border-tertiary bg-bg-primary p-4">
          <Drawer.Handle className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-border-secondary" />
          {recipe && (
            <>
          <div className="mb-4 flex shrink-0 items-start justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                {mealTypeLabel(recipe.meal)}
              </p>
              <h3 className="text-lg font-medium leading-snug">
                {favoriteDisplayName(recipe)}
              </h3>
            </div>
            <button
              type="button"
              aria-label={ui.close}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
              onClick={() => onOpenChange(false)}
            >
              <IconX size={20} aria-hidden />
            </button>
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {recipe.kcal > 0 && (
              <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                <p className="mb-2 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                  {ui.favoriteRecipeMacros}
                </p>
                <p className="text-sm tabular-nums text-text-secondary">
                  {recipe.kcal}
                  {ui.kcal}
                  {' · '}
                  {recipe.p}
                  {ui.macroProtein}
                  {' · '}
                  {recipe.c}
                  {ui.macroCarbs}
                  {' · '}
                  {recipe.f}
                  {ui.macroFat}
                </p>
              </div>
            )}

            {recipe.ingredients.length > 0 && (
              <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                  {ui.ingredient}
                </p>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {recipe.ingredients.map((ing, index) => (
                    <li
                      key={`${ing.name}-${index}`}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 break-words">
                        {ingredientLabel(ing.name)}
                      </span>
                      <span className="shrink-0 tabular-nums text-text-secondary">
                        {ing.amount} {ing.unit === 'g' ? g : unitLabel(ing.unit)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.steps.length > 0 && (
              <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
                  {ui.steps}
                </p>
                <ol className="flex list-none flex-col gap-3">
                  {recipe.steps.map((step, index) => (
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
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
