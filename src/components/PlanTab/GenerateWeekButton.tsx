import { useState } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { fetchSmartPlan } from '../../api/fetchSmartPlan';
import { ui } from '../../i18n';
import { useApp } from '../../state/AppContext';

export function GenerateWeekButton() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const picks = await fetchSmartPlan(state.people);
      if (picks) {
        dispatch({ type: 'GENERATE_PLAN_WITH_PICKS', payload: picks });
      } else {
        dispatch({ type: 'GENERATE_PLAN' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleClick()}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-text-info py-3.5 font-medium text-white disabled:opacity-60"
    >
      <IconSparkles size={18} aria-hidden />
      {loading ? ui.generateWeekLoading : ui.generateWeek}
    </button>
  );
}
