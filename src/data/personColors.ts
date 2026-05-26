import type { Person } from '../domain/types';

export const PERSON_COLOR_COUNT = 6;

export interface PersonColorClasses {
  bg: string;
  text: string;
  /** Progress bar fill for daily intake kcal row. */
  bar: string;
}

/** Stable palette — slot index is stored on each person. */
export const PERSON_COLOR_SLOTS: readonly PersonColorClasses[] = [
  { bg: 'bg-bg-info', text: 'text-text-info', bar: 'bg-text-info' },
  { bg: 'bg-bg-success', text: 'text-text-success', bar: 'bg-text-success' },
  { bg: 'bg-bg-warning', text: 'text-text-warning', bar: 'bg-text-warning' },
  { bg: 'bg-bg-danger', text: 'text-text-danger', bar: 'bg-text-danger' },
  {
    bg: 'bg-bg-person-5',
    text: 'text-text-person-5',
    bar: 'bg-text-person-5',
  },
  {
    bg: 'bg-bg-person-6',
    text: 'text-text-person-6',
    bar: 'bg-text-person-6',
  },
];

export function personColorClasses(
  colorSlot: number | undefined,
): PersonColorClasses {
  if (typeof colorSlot !== 'number' || !Number.isFinite(colorSlot)) {
    return PERSON_COLOR_SLOTS[0];
  }
  return PERSON_COLOR_SLOTS[colorSlot % PERSON_COLOR_SLOTS.length];
}

export function nextColorSlot(people: Person[]): number {
  const used = new Set(people.map((p) => p.colorSlot));
  for (let i = 0; i < PERSON_COLOR_SLOTS.length; i++) {
    if (!used.has(i)) return i;
  }
  return people.length % PERSON_COLOR_SLOTS.length;
}
