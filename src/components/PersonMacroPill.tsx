import type { ReactNode } from 'react';
import { personColorClasses } from '../data/personColors';
import type { Person } from '../domain/types';

interface PersonLabelProps {
  person: Person;
  /** Shorter label (e.g. first name in table headers). */
  displayName?: string;
  className?: string;
}

export function PersonLabel({ person, displayName, className = '' }: PersonLabelProps) {
  const colors = personColorClasses(person.colorSlot);
  return (
    <span
      className={`inline-block max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium leading-snug ${colors.bg} ${colors.text} ${className}`}
    >
      {displayName ?? person.name}
    </span>
  );
}

interface PersonMacroPillProps {
  person: Person;
  children: ReactNode;
  className?: string;
}

export function PersonMacroPill({
  person,
  children,
  className = '',
}: PersonMacroPillProps) {
  const colors = personColorClasses(person.colorSlot);
  return (
    <span
      className={`inline-flex max-w-full items-baseline gap-1 rounded-full px-2 py-1 text-xs leading-snug ${colors.bg} ${colors.text} ${className}`}
    >
      <span className="shrink-0 font-medium">{person.name}</span>
      <span className="min-w-0">{children}</span>
    </span>
  );
}
