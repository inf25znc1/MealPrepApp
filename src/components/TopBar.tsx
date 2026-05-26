import { IconSettings } from '@tabler/icons-react';
import { useApp } from '../state/AppContext';

interface TopBarProps {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: TopBarProps) {
  const { state } = useApp();
  const count = state.people.length;
  const label = count === 1 ? '1 person' : `${count} people`;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-border-tertiary">
      <div>
        <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary">
          This week
        </p>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <button
        type="button"
        className="flex items-center justify-center w-11 h-11"
        aria-label="Open household settings"
        onClick={onOpenSettings}
      >
        <IconSettings size={22} aria-hidden />
      </button>
    </header>
  );
}
