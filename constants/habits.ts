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

export function getTodayDayKey(date = new Date()): DayKey {
  return JS_DAY_TO_DAY_KEY[date.getDay()];
}

export function getWeekStartDate(date = new Date()) {
  const start = new Date(date);
  const currentDay = date.getDay();
  const daysSinceSaturday = currentDay === 6 ? 0 : currentDay + 1;

  start.setHours(0, 0, 0, 0);
  start.setDate(date.getDate() - daysSinceSaturday);

  return start;
}

export function getCurrentWeekId(date = new Date()) {
  const start = getWeekStartDate(date);

  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
}

export function buildWeekDays(filledByDay: Partial<Record<DayKey, boolean>> = {}, date = new Date()): DayItem[] {
  const weekStart = getWeekStartDate(date);

  return WEEK_DAY_KEYS.map((key, index) => {
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

export const defaultHabits: HabitItem[] = [
  {
    id: 'seed-read-book',
    titleKey: 'habits.readBook',
    icon: 'book-open-page-variant-outline',
    completionVariant: 'light',
    scheduledDays: [...WEEK_DAY_KEYS],
    reminderEnabled: true,
    reminderMinutes: 19 * 60,
    theme: {
      iconBg: '#5DA8E8',
      accent: '#78BDF7',
      gradientStart: 'rgba(23,60,96,0.88)',
      gradientMid: 'rgba(8,19,34,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: buildWeekDays({ tue: true, wed: true, fri: true }),
  },
  {
    id: 'seed-go-to-gym',
    titleKey: 'habits.goToGym',
    icon: 'dumbbell',
    completionVariant: 'dark',
    scheduledDays: ['sat', 'mon', 'wed', 'fri'],
    reminderEnabled: true,
    reminderMinutes: 18 * 60,
    theme: {
      iconBg: '#D2A12C',
      accent: '#D8AA38',
      gradientStart: 'rgba(73,52,16,0.88)',
      gradientMid: 'rgba(28,20,6,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: buildWeekDays({ sat: true, mon: true, wed: true }),
  },
  {
    id: 'seed-homemade-food-only',
    titleKey: 'habits.homemadeFoodOnly',
    icon: 'silverware-fork-knife',
    completionVariant: 'dark',
    scheduledDays: [...WEEK_DAY_KEYS],
    reminderEnabled: false,
    reminderMinutes: 13 * 60,
    theme: {
      iconBg: '#D67C50',
      accent: '#E08A5C',
      gradientStart: 'rgba(79,40,24,0.88)',
      gradientMid: 'rgba(32,16,9,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: buildWeekDays({ mon: true, tue: true, thu: true }),
  },
  {
    id: 'seed-six-hours-sleep',
    titleKey: 'habits.sixHoursSleep',
    icon: 'moon-waning-crescent',
    completionVariant: 'light',
    scheduledDays: [...WEEK_DAY_KEYS],
    reminderEnabled: true,
    reminderMinutes: 23 * 60,
    theme: {
      iconBg: '#D86C8E',
      accent: '#E784A3',
      gradientStart: 'rgba(79,23,39,0.88)',
      gradientMid: 'rgba(31,10,18,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: buildWeekDays({ tue: true, fri: true }),
  },
  {
    id: 'seed-mindfulness-practices',
    titleKey: 'habits.mindfulnessPractices',
    icon: 'leaf',
    completionVariant: 'dark',
    scheduledDays: ['sat', 'sun', 'tue', 'thu', 'fri'],
    reminderEnabled: true,
    reminderMinutes: 7 * 60,
    theme: {
      iconBg: '#1FA052',
      accent: '#2DB860',
      gradientStart: 'rgba(12,63,31,0.90)',
      gradientMid: 'rgba(7,24,12,0.93)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: buildWeekDays({ sat: true, tue: true, fri: true }),
  },
];
