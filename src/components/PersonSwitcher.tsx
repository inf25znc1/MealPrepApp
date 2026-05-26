import { useApp } from '../state/AppContext';

export function PersonSwitcher() {
  const { state, dispatch } = useApp();

  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto">
      {state.people.map((person) => {
        const active = person.id === state.activePersonId;
        return (
          <button
            key={person.id}
            type="button"
            onClick={() =>
              dispatch({ type: 'SET_ACTIVE_PERSON', payload: person.id })
            }
            className={`shrink-0 px-3 py-1.5 text-sm rounded-full border-[0.5px] ${
              active
                ? 'bg-bg-info text-text-info border-border-info'
                : 'bg-transparent text-text-primary border-border-tertiary'
            }`}
          >
            {person.name}
          </button>
        );
      })}
    </div>
  );
}
