import type { ReactNode } from 'react';
import type { DailyTargets, PersonMacros } from '../domain/types';

function MacroValue({ children }: { children: ReactNode }) {
  return (
    <span className="font-medium tabular-nums text-text-secondary">{children}</span>
  );
}

function MacroType({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-normal text-text-tertiary">{children}</span>
  );
}

interface PersonMacroValuesProps {
  macros: PersonMacros | DailyTargets;
  /** Suffix after kcal number, e.g. " kcal" or " kcal/day". */
  kcalLabel?: string;
  className?: string;
}

export function PersonMacroValues({
  macros,
  kcalLabel = ' kcal',
  className = '',
}: PersonMacroValuesProps) {
  return (
    <span className={`text-right text-xs leading-snug ${className}`.trim()}>
      <MacroValue>{macros.kcal}</MacroValue>
      <MacroType>{kcalLabel}</MacroType>
      <MacroType> · </MacroType>
      <MacroValue>{macros.p}</MacroValue>
      <MacroType> P</MacroType>
      <MacroType> · </MacroType>
      <MacroValue>{macros.c}</MacroValue>
      <MacroType> C</MacroType>
      <MacroType> · </MacroType>
      <MacroValue>{macros.f}</MacroValue>
      <MacroType> F</MacroType>
    </span>
  );
}
