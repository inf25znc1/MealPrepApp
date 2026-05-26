import { PersonLabel, PersonMacroPill } from '../PersonMacroPill';
import { dailyTargetFor } from '../../domain/scaling';
import { weeklyAverageFor } from '../../domain/intake';
import type { Person, Plan } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { personColorClasses } from '../../data/personColors';

interface CompactMacroBarProps {
  shortLabel: string;
  title: string;
  actual: number;
  target: number;
  colorClass: string;
}

function CompactMacroBar({
  shortLabel,
  title,
  actual,
  target,
  colorClass,
}: CompactMacroBarProps) {
  const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
  return (
    <div className="min-w-0 flex-1" title={title}>
      <div className="mb-0.5 flex items-baseline justify-between gap-0.5">
        <span className="text-[10px] text-text-secondary">{shortLabel}</span>
        <span className="truncate text-[10px] tabular-nums text-text-secondary">
          {actual}
        </span>
      </div>
      <div
        className="h-1 overflow-hidden rounded bg-bg-tertiary"
        role="progressbar"
        aria-label={title}
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

function PersonIntake({ person, plan }: { person: Person; plan: Plan | null }) {
  const target = dailyTargetFor(person);
  const colors = personColorClasses(person.colorSlot);

  if (!plan) {
    return (
      <PersonMacroPill person={person} className="w-full">
        {' · '}
        {target.kcal} kcal · {target.p}P {target.c}C {target.f}F
      </PersonMacroPill>
    );
  }

  const actual = weeklyAverageFor(person, plan);

  return (
    <div className="flex gap-1.5">
      <CompactMacroBar
        shortLabel="K"
        title={`Kcal ${actual.kcal} of ${target.kcal}`}
        actual={actual.kcal}
        target={target.kcal}
        colorClass={colors.bar}
      />
      <CompactMacroBar
        shortLabel="P"
        title={`Protein ${actual.p}g of ${target.p}g`}
        actual={actual.p}
        target={target.p}
        colorClass="bg-text-success"
      />
      <CompactMacroBar
        shortLabel="C"
        title={`Carbs ${actual.c}g of ${target.c}g`}
        actual={actual.c}
        target={target.c}
        colorClass="bg-text-warning"
      />
      <CompactMacroBar
        shortLabel="F"
        title={`Fat ${actual.f}g of ${target.f}g`}
        actual={actual.f}
        target={target.f}
        colorClass="bg-text-danger"
      />
    </div>
  );
}

export function DailyIntakeCard() {
  const { state } = useApp();

  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-[0.5px] text-text-secondary mb-2">
        {state.plan ? 'Daily intake' : 'Daily targets'}
      </p>
      <div className="flex flex-col gap-2">
        {state.people.map((person) => (
          <div
            key={person.id}
            className="rounded-lg border-[0.5px] border-border-tertiary bg-bg-primary p-4"
          >
            {state.plan ? (
              <>
                <div className="mb-2">
                  <PersonLabel person={person} />
                </div>
                <PersonIntake person={person} plan={state.plan} />
              </>
            ) : (
              <PersonIntake person={person} plan={null} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
