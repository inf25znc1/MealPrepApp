import { useId, useRef, useState } from 'react';
import {
  packageProductDisplayName,
  searchPackageProductSuggestions,
} from '../../domain/packageProducts';
import { ingredientLabel, ui } from '../../i18n';

interface SearchableProductInputProps {
  value: string;
  selectedKey: string | null;
  onValueChange: (value: string) => void;
  onSelectedKeyChange: (key: string | null) => void;
}

export function SearchableProductInput({
  value,
  selectedKey,
  onValueChange,
  onSelectedKeyChange,
}: SearchableProductInputProps) {
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const suggestions = searchPackageProductSuggestions(value);
  const showCreate = value.trim().length > 0 && !selectedKey;

  const pick = (key: string) => {
    onSelectedKeyChange(key);
    onValueChange(packageProductDisplayName(key));
    setOpen(false);
  };

  const pickCustom = () => {
    onSelectedKeyChange(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <label className="text-xs text-text-secondary" htmlFor={listId}>
        {ui.packageIngredient}
        <input
          id={listId}
          type="search"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            onSelectedKeyChange(null);
            setOpen(true);
          }}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          placeholder={ui.packageIngredientSearchPlaceholder}
          className="mt-1 block w-full rounded-md border-[0.5px] border-border-tertiary bg-bg-primary px-2 py-1.5 text-sm"
        />
      </label>
      {open && (suggestions.length > 0 || showCreate) && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border-[0.5px] border-border-tertiary bg-bg-primary py-1 shadow-lg"
        >
          {suggestions.map((key) => (
            <li key={key} role="option">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-bg-secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(key)}
              >
                {ingredientLabel(key)}
              </button>
            </li>
          ))}
          {showCreate && (
            <li role="option">
              <button
                type="button"
                className="w-full border-t-[0.5px] border-border-tertiary px-3 py-2 text-left text-sm text-text-info hover:bg-bg-secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={pickCustom}
              >
                {ui.createPackageProduct(value.trim())}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
