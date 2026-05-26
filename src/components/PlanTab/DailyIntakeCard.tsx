import { dailyTargetFor } from '../../domain/scaling';
import { weeklyAverageFor } from '../../domain/intake';
import { useApp } from '../../state/AppContext';

interface MacroBarProps {
  label: string;
  actual: number;
  target: number;
  colorClass: string;
}

function MacroBar({ label, actual, target, colorClass }: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-text-secondary mb-1">
        <span>{label}</span>
        <span>
          {actual} / {target}
        </span>
      </div>
      <div
        className="h-1 rounded bg-bg-tertiary overflow-hidden"
        role="progressbar"
        aria-valuenow={actual}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div
          className={`h-full rounded ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DailyIntakeCard() {
  const { state } = useApp();
  const person = state.people.find((p) => p.id === state.activePersonId);
  if (!person) return null;

  const target = dailyTargetFor(person);

  if (!state.plan) {
    return (
      <div className="mb-4 p-4 rounded-lg bg-bg-secondary">
        <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary mb-2">
          {person.name}&apos;s daily target
        </p>
        <div className="flex gap-4 text-lg font-medium">
          <span>{target.kcal} kcal</span>
          <span>{target.p}P</span>
          <span>{target.c}C</span>
          <span>{target.f}F</span>
        </div>
      </div>
    );
  }

  const actual = weeklyAverageFor(person, state.plan);

  return (
    <div className="mb-4 p-4 rounded-lg bg-bg-secondary">
      <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary mb-3">
        {person.name}&apos;s daily intake
      </p>
      <div className="grid grid-cols-2 gap-3">
        <MacroBar
          label="Kcal"
          actual={actual.kcal}
          target={target.kcal}
          colorClass="bg-text-info"
        />
        <MacroBar
          label="Protein"
          actual={actual.p}
          target={target.p}
          colorClass="bg-text-success"
        />
        <MacroBar
          label="Carbs"
          actual={actual.c}
          target={target.c}
          colorClass="bg-text-warning"
        />
        <MacroBar
          label="Fat"
          actual={actual.f}
          target={target.f}
          colorClass="bg-text-danger"
        />
      </div>
    </div>
  );
}
