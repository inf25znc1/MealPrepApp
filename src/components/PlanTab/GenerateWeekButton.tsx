import { useState } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { fetchAiWeekPlan } from '../../api/fetchAiPlan';
import { ui } from '../../i18n';
import { useApp } from '../../state/AppContext';

export function GenerateWeekButton() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAiWeekPlan(
        state.people,
        state.packageProducts ?? [],
        state.favoriteRecipes ?? [],
      );
      if (result.data) {
        dispatch({ type: 'GENERATE_PLAN_WITH_AI', payload: result.data });
      } else if (
        result.error === 'no_api' ||
        result.message === 'GEMINI_API_KEY_INVALID'
      ) {
        setError(ui.generateWeekFailedNoKey);
      } else if (result.error === 'quota') {
        setError(ui.generateWeekFailedQuota);
      } else if (result.error === 'overload') {
        setError(ui.generateWeekFailedOverload);
      } else if (result.error === 'network') {
        setError(ui.generateWeekFailedNetwork);
      } else if (result.error === 'invalid_response') {
        setError(ui.generateWeekFailedInvalid);
      } else {
        setError(ui.generateWeekFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-center text-xs text-text-danger" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleClick()}
        className="btn-primary w-full py-3.5"
      >
        <IconSparkles size={18} aria-hidden />
        {loading ? ui.generateWeekLoading : ui.generateWeek}
      </button>
    </div>
  );
}
