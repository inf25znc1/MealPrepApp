import { Drawer } from 'vaul';
import { IconX, IconTrash, IconPlus } from '@tabler/icons-react';
import { DIETS, EXCLUSIONS } from '../../data/constants';
import { dietLabel, exclusionLabel, ui } from '../../i18n';
import type { Exclusion } from '../../domain/types';
import { useApp } from '../../state/AppContext';

interface HouseholdSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HouseholdSheet({ open, onOpenChange }: HouseholdSheetProps) {
  const { state, dispatch } = useApp();

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

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mx-auto max-w-[420px] flex flex-col max-h-[90vh] rounded-t-[20px] border-t-[0.5px] border-border-tertiary bg-bg-primary p-4">
          <Drawer.Handle className="mx-auto mb-3.5 w-9 h-1 rounded-full bg-border-secondary" />
          <div className="overflow-y-auto flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{ui.household}</h2>
              <button
                type="button"
                aria-label={ui.close}
                className="flex items-center justify-center w-11 h-11"
                onClick={() => onOpenChange(false)}
              >
                <IconX size={20} aria-hidden />
              </button>
            </div>

            {state.people.map((person) => (
              <div
                key={person.id}
                className="p-3 mb-2.5 rounded-md bg-bg-secondary"
              >
                <div className="flex gap-2 mb-3">
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
                    className="flex-1 px-2 py-1.5 text-sm rounded-md border-[0.5px] border-border-tertiary bg-bg-primary"
                  />
                  {state.people.length > 1 && (
                    <button
                      type="button"
                      aria-label={ui.removePerson(person.name)}
                      className="flex items-center justify-center w-11 h-11"
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
                <div className="grid grid-cols-2 gap-2 mb-3">
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
                      className="block w-full mt-1 px-2 py-1.5 text-sm rounded-md border-[0.5px] border-border-tertiary bg-bg-primary"
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
                      className="block w-full mt-1 px-2 py-1.5 text-sm rounded-md border-[0.5px] border-border-tertiary bg-bg-primary"
                    >
                      {DIETS.map((d) => (
                        <option key={d} value={d}>
                          {dietLabel(d)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="text-xs text-text-secondary mb-1.5">{ui.avoids}</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXCLUSIONS.map((ex) => (
                    <label
                      key={ex}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border-[0.5px] border-border-tertiary bg-bg-primary"
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
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md border-dashed border-[0.5px] border-border-secondary bg-transparent text-sm"
            >
              <IconPlus size={18} aria-hidden />
              {ui.addPerson}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
