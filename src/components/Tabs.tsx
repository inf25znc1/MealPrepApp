import { useApp } from '../state/AppContext';

export function Tabs() {
  const { state, dispatch } = useApp();
  const tabs = [
    { id: 'plan' as const, label: 'Plan' },
    { id: 'shop' as const, label: 'Shopping' },
  ];

  return (
    <div className="flex border-b-[0.5px] border-border-tertiary">
      {tabs.map((tab) => {
        const active = state.activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() =>
              dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })
            }
            className={`flex-1 py-3 text-sm ${
              active
                ? 'font-medium text-text-primary border-b-2 border-text-info'
                : 'text-text-secondary border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
