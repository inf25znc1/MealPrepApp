import { useState } from 'react';
import { Drawer } from 'vaul';
import { IconX, IconTrash, IconPlus } from '@tabler/icons-react';
import { DIETS, EXCLUSIONS } from '../../data/constants';
import { dietLabel, exclusionLabel, ui } from '../../i18n';
import type { Exclusion } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { FavoritesPanel } from './FavoritesPanel';
import { PackageProductsPanel } from './PackageProductsPanel';

type SettingsTab = 'people' | 'foods' | 'favorites';

interface HouseholdSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HouseholdSheet({ open, onOpenChange }: HouseholdSheetProps) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<SettingsTab>('people');
  const [foodsFormOpen, setFoodsFormOpen] = useState(false);
  const [favoritesFormOpen, setFavoritesFormOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFoodsFormOpen(false);
      setFavoritesFormOpen(false);
    }
    onOpenChange(next);
  };

  const selectTab = (next: SettingsTab) => {
    setTab(next);
    if (next !== 'foods') setFoodsFormOpen(false);
    if (next !== 'favorites') setFavoritesFormOpen(false);
  };

  const toggleExclusion = (personId: string, ex: Exclusion, checked: boolean) => {
    const person = state.people.find((p) => p.id === personId);
    if (!person) return;
    const excludes = checked
      ? [...person.excludes, ex]
      : person.excludes.filter((e) => e !== ex);
    dispatch({
      type: 'UPDATE_PERSON',
      payload: { id: personId, patch: { excludes } },
    });
  };

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-1 py-2 text-[11px] leading-tight sm:text-xs ${
      active
        ? 'bg-bg-primary font-medium text-text-primary'
        : 'text-text-secondary'
    }`;

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mx-auto flex h-[min(90dvh,90vh)] max-h-[90vh] w-full max-w-[420px] flex-col rounded-t-[20px] border-t-[0.5px] border-border-tertiary bg-bg-primary">
          <div className="shrink-0 px-4 pt-4">
            <Drawer.Handle className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-border-secondary" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">{ui.settings}</h2>
              <button
                type="button"
                aria-label={ui.close}
                className="flex h-11 w-11 items-center justify-center"
                onClick={() => handleOpenChange(false)}
              >
                <IconX size={20} aria-hidden />
              </button>
            </div>

            <div className="mb-4 rounded-lg border-[0.5px] border-border-tertiary bg-bg-secondary p-1">
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => selectTab('people')}
                  className={tabClass(tab === 'people')}
                >
                  {ui.settingsTabPeople}
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('foods')}
                  className={tabClass(tab === 'foods')}
                >
                  {ui.settingsTabFoods}
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('favorites')}
                  className={tabClass(tab === 'favorites')}
                >
                  {ui.settingsTabFavorites}
                </button>
              </div>
            </div>
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
            {tab === 'people' && (
              <>
                {state.people.map((person) => (
                  <div
                    key={person.id}
                    className="mb-2.5 rounded-md bg-bg-secondary p-3"
                  >
                    <div className="mb-3 flex gap-2">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_PERSON',
                            payload: {
                              id: person.id,
                              patch: { name: e.target.value },
                            },
                          })
                        }
                        className="flex-1 rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
                      />
                      {state.people.length > 1 && (
                        <button
                          type="button"
                          aria-label={ui.removePerson(person.name)}
                          className="flex h-11 w-11 items-center justify-center"
                          onClick={() =>
                            dispatch({
                              type: 'REMOVE_PERSON',
                              payload: person.id,
                            })
                          }
                        >
                          <IconTrash size={18} aria-hidden />
                        </button>
                      )}
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <label className="text-xs text-text-secondary">
                        {ui.kcalPerDayLabel}
                        <input
                          type="number"
                          step={50}
                          min={1000}
                          max={4500}
                          value={person.cals}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_PERSON',
                              payload: {
                                id: person.id,
                                patch: { cals: Number(e.target.value) },
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
                        />
                      </label>
                      <label className="text-xs text-text-secondary">
                        {ui.diet}
                        <select
                          value={person.diet}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_PERSON',
                              payload: {
                                id: person.id,
                                patch: {
                                  diet: e.target.value as typeof person.diet,
                                },
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
                        >
                          {DIETS.map((d) => (
                            <option key={d} value={d}>
                              {dietLabel(d)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <p className="mb-1.5 text-xs text-text-secondary">{ui.avoids}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EXCLUSIONS.map((ex) => (
                        <label
                          key={ex}
                          className="flex items-center gap-1 rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={person.excludes.includes(ex)}
                            onChange={(e) =>
                              toggleExclusion(person.id, ex, e.target.checked)
                            }
                          />
                          {exclusionLabel(ex)}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => dispatch({ type: 'ADD_PERSON' })}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border-dashed border-[0.5px] border-border-secondary bg-transparent py-2.5 text-sm"
                >
                  <IconPlus size={18} aria-hidden />
                  {ui.addPerson}
                </button>
              </>
            )}

            {tab === 'foods' && (
              <PackageProductsPanel
                formOpen={foodsFormOpen}
                onFormOpenChange={setFoodsFormOpen}
              />
            )}

            {tab === 'favorites' && (
              <FavoritesPanel
                formOpen={favoritesFormOpen}
                onFormOpenChange={setFavoritesFormOpen}
              />
            )}
          </div>

          {tab === 'foods' && !foodsFormOpen && (
            <div className="shrink-0 border-t-[0.5px] border-border-tertiary bg-bg-primary px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setFoodsFormOpen(true)}
                className="btn-primary w-full py-3"
              >
                <IconPlus size={18} aria-hidden />
                {ui.addPackageProduct}
              </button>
            </div>
          )}

          {tab === 'favorites' && !favoritesFormOpen && (
            <div className="shrink-0 border-t-[0.5px] border-border-tertiary bg-bg-primary px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setFavoritesFormOpen(true)}
                className="btn-primary w-full py-3"
              >
                <IconPlus size={18} aria-hidden />
                {ui.addCustomRecipe}
              </button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
