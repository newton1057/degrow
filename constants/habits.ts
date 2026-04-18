import { MaterialCommunityIcons } from '@expo/vector-icons';

export type DayKey = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type HabitTitleKey =
  | 'habits.readBook'
  | 'habits.goToGym'
  | 'habits.homemadeFoodOnly'
  | 'habits.sixHoursSleep'
  | 'habits.mindfulnessPractices';

export type DayItem = {
  key: DayKey;
  day: string;
  filled: boolean;
};

export type HabitTheme = {
  iconBg: string;
  iconColor?: string;
  accent: string;
  onAccent?: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
};

export type HabitItem = {
  id: string;
  title?: string;
  titleKey?: HabitTitleKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  days: DayItem[];
  scheduledDays: DayKey[];
  theme: HabitTheme;
  completionVariant: 'light' | 'dark';
  reminderEnabled: boolean;
  reminderMinutes: number;
  targetMinutes: number;
};

export const WEEK_DAY_KEYS: DayKey[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

const JS_DAY_TO_DAY_KEY: Record<number, DayKey> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const DAY_KEY_TO_JS_DAY: Record<DayKey, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function getTodayDayKey(date = new Date()): DayKey {
  return JS_DAY_TO_DAY_KEY[date.getDay()];
}

export function getWeekStartDate(date = new Date(), startOfWeek: DayKey = 'sat') {
  const start = new Date(date);
  const currentDay = date.getDay();
  const startDayNumber = DAY_KEY_TO_JS_DAY[startOfWeek];

  let daysSinceStart = currentDay - startDayNumber;
  if (daysSinceStart < 0) {
    daysSinceStart += 7;
  }

  start.setHours(0, 0, 0, 0);
  start.setDate(date.getDate() - daysSinceStart);

  return start;
}

export function getCurrentWeekId(date = new Date(), startOfWeek: DayKey = 'sat') {
  const start = getWeekStartDate(date, startOfWeek);

  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
}

export function buildWeekDays(
  filledByDay: Partial<Record<DayKey, boolean>> = {},
  date = new Date(),
  startOfWeek: DayKey = 'sat'
): DayItem[] {
  const weekStart = getWeekStartDate(date, startOfWeek);
  const startDayIndex = WEEK_DAY_KEYS.indexOf(startOfWeek);

  // Reordenar días para que empiecen con startOfWeek
  const orderedKeys = [
    ...WEEK_DAY_KEYS.slice(startDayIndex),
    ...WEEK_DAY_KEYS.slice(0, startDayIndex),
  ];

  return orderedKeys.map((key, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + index);

    return {
      key,
      day: String(dayDate.getDate()).padStart(2, '0'),
      filled: filledByDay[key] ?? false,
    };
  });
}

export function filledMapFromDays(days: DayItem[]) {
  return days.reduce<Partial<Record<DayKey, boolean>>>((acc, day) => {
    acc[day.key] = day.filled;

    return acc;
  }, {});
}

export function getHabitTitleKeyFallback(id: string): HabitTitleKey | undefined {
  const lookup: Record<string, HabitTitleKey> = {
    'seed-read-book': 'habits.readBook',
    'seed-go-to-gym': 'habits.goToGym',
    'seed-homemade-food-only': 'habits.homemadeFoodOnly',
    'seed-six-hours-sleep': 'habits.sixHoursSleep',
    'seed-mindfulness-practices': 'habits.mindfulnessPractices',
  };

  return lookup[id];
}
