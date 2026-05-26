import type { PeriodMeta } from '../domain/picker';

export const PERIOD_A_META: PeriodMeta = {
  label: 'Період А',
  key: 'A',
  days: 4,
  dayList: ['Mon', 'Tue', 'Wed', 'Thu'],
  cookDay: 'Sun',
  eatRange: 'Mon–Thu',
};

export const PERIOD_B_META: PeriodMeta = {
  label: 'Період Б',
  key: 'B',
  days: 3,
  dayList: ['Fri', 'Sat', 'Sun'],
  cookDay: 'Thu',
  eatRange: 'Fri–Sun',
};
