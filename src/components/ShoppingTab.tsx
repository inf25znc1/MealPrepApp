import { aggregateShopping, groupShoppingByCategory } from '../domain/shopping';
import {
  ingredientLabel,
  shoppingCategoryLabel,
  ui,
  unitLabel,
} from '../i18n';
import type { ShoppingItem } from '../domain/types';
import { useApp } from '../state/AppContext';

function formatShoppingQty(item: ShoppingItem): string {
  const { qty, unit, qtyGrams } = item;
  const g = unitLabel('g');
  let base: string;
  if (qtyGrams !== null) {
    if (unit === 'g' || unit === 'ml') base = `${qtyGrams} ${g}`;
    else base = `${qty} ${unitLabel(unit)} (${qtyGrams} ${g})`;
  } else {
    base = `${qty} ${unitLabel(unit)}`;
  }
  if (
    item.packageCount &&
    item.packageSize !== undefined &&
    item.packageUnit
  ) {
    return `${base} · ${ui.shoppingPackageNote(
      item.packageCount,
      item.packageSize,
      unitLabel(item.packageUnit),
    )}`;
  }
  return base;
}

export function ShoppingTab() {
  const { state, dispatch } = useApp();

  if (!state.plan) {
    return (
      <div className="p-3.5">
        <div className="rounded-lg border-[0.5px] border-border-tertiary bg-bg-primary p-8 text-center text-text-secondary">
          {ui.shoppingEmpty}
        </div>
      </div>
    );
  }

  const items = aggregateShopping(
    state.plan,
    state.people,
    state.packageProducts,
  );
  const groups = groupShoppingByCategory(items);
  const n = state.people.length;

  return (
    <div className="p-3.5 pb-6">
      <p className="mb-2.5 text-xs text-text-secondary">
        {ui.shoppingIntro(n)}
      </p>
      <div className="flex flex-col gap-4">
        {groups.map(({ category, items: categoryItems }) => (
          <section
            key={category}
            className="overflow-hidden rounded-lg border-[0.5px] border-border-tertiary bg-bg-primary"
          >
            <h2 className="border-b-[0.5px] border-border-tertiary px-4 py-3 text-[11px] uppercase tracking-[0.5px] text-text-secondary">
              {shoppingCategoryLabel(category)}
            </h2>
            <ul className="m-0 list-none p-0">
              {categoryItems.map((item, index) => {
                const checked = Boolean(state.checkedShopping[item.id]);
                const isLast = index === categoryItems.length - 1;
                const displayName = ingredientLabel(item.name);
                return (
                  <li key={item.id}>
                    <label
                      className={`flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ${
                        checked ? 'bg-bg-success' : 'bg-bg-primary'
                      } ${!isLast ? 'border-b-[0.5px] border-border-tertiary' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          dispatch({
                            type: 'TOGGLE_SHOPPING_CHECK',
                            payload: { itemId: item.id },
                          })
                        }
                        className="h-5 w-5 shrink-0 accent-text-success"
                        aria-label={ui.markBought(displayName)}
                      />
                      <span
                        className={`min-w-0 flex-1 ${checked ? 'text-text-success' : ''}`}
                      >
                        {displayName}
                      </span>
                      <span
                        className={`shrink-0 tabular-nums text-right ${
                          checked ? 'text-text-success' : 'text-text-secondary'
                        }`}
                      >
                        {formatShoppingQty(item)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
