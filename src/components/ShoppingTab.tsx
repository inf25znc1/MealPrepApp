import { aggregateShopping } from '../domain/shopping';
import { useApp } from '../state/AppContext';

export function ShoppingTab() {
  const { state } = useApp();

  if (!state.plan) {
    return (
      <div className="p-3.5">
        <div className="p-8 text-center rounded-lg bg-bg-secondary text-text-secondary">
          Generate a week to see your shopping list.
        </div>
      </div>
    );
  }

  const items = aggregateShopping(state.plan, state.people);
  const n = state.people.length;
  const peopleLabel = n === 1 ? 'person' : 'people';

  return (
    <div className="p-3.5">
      <p className="text-xs text-text-secondary mb-2.5">
        For {n} {peopleLabel} · 7 days · auto-updates with your menu
      </p>
      <ul className="m-0 p-0 list-none">
        {items.map((item) => (
          <li
            key={`${item.name}-${item.unit}`}
            className="flex justify-between py-2.75 text-sm border-b-[0.5px] border-border-tertiary"
          >
            <span>{item.name}</span>
            <span className="text-text-secondary tabular-nums">
              {item.qty} {item.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
