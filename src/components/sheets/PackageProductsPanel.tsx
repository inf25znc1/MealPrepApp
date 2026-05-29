import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import {
  packageProductDisplayName,
  resolvePackageProductName,
} from '../../domain/packageProducts';
import { SearchableProductInput } from '../ui/SearchableProductInput';
import { ui, unitLabel } from '../../i18n';
import { useApp } from '../../state/AppContext';

interface PackageProductsPanelProps {
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
}

export function PackageProductsPanel({
  formOpen,
  onFormOpenChange,
}: PackageProductsPanelProps) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [packageQty, setPackageQty] = useState('190');

  const resetForm = () => {
    onFormOpenChange(false);
    setQuery('');
    setSelectedKey(null);
    setPackageQty('190');
  };

  const saveProduct = () => {
    const name = resolvePackageProductName(query, selectedKey);
    const qty = Number(packageQty);
    if (!name || !Number.isFinite(qty) || qty <= 0) return;
    dispatch({
      type: 'ADD_PACKAGE_PRODUCT',
      payload: { name, packageQty: qty },
    });
    resetForm();
  };

  const products = state.packageProducts ?? [];
  const g = unitLabel('g');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-secondary">{ui.packageProductsIntro}</p>

      {formOpen ? (
        <div className="flex flex-col gap-3 rounded-md border-[0.5px] border-border-tertiary bg-bg-secondary p-3">
          <SearchableProductInput
            value={query}
            selectedKey={selectedKey}
            onValueChange={setQuery}
            onSelectedKeyChange={setSelectedKey}
          />
          <label className="text-xs text-text-secondary">
            {ui.packageSizeLabel}
            <div className="mt-1 flex items-center gap-1 rounded-md border-[0.5px] border-border-tertiary bg-bg-primary pl-2.5">
              <span
                className="shrink-0 select-none text-sm text-text-tertiary"
                aria-hidden
              >
                {g}
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={packageQty}
                onChange={(e) => setPackageQty(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-1.5 pr-2.5 text-sm tabular-nums focus:outline-none"
              />
            </div>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveProduct}
              className="btn-primary flex-1 py-2.5"
            >
              {ui.savePackageProduct}
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
      ) : products.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">
          {ui.packageProductsEmpty}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-2 rounded-md bg-bg-secondary p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {packageProductDisplayName(product.name)}
                </p>
                <p className="text-xs text-text-secondary tabular-nums">
                  {product.packageQty} {g}
                </p>
              </div>
              <button
                type="button"
                aria-label={ui.removePackageProduct(
                  packageProductDisplayName(product.name),
                )}
                className="flex h-11 w-11 shrink-0 items-center justify-center"
                onClick={() =>
                  dispatch({
                    type: 'REMOVE_PACKAGE_PRODUCT',
                    payload: product.id,
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
