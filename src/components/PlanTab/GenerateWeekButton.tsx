import { IconSparkles } from '@tabler/icons-react';
import { ui } from '../../i18n';
import { useApp } from '../../state/AppContext';

export function GenerateWeekButton() {
  const { dispatch } = useApp();

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'GENERATE_PLAN' })}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-text-info py-3.5 font-medium text-white"
    >
      <IconSparkles size={18} aria-hidden />
      {ui.generateWeek}
    </button>
  );
}
