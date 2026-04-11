import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  buildWeekDays,
  defaultHabits,
  filledMapFromDays,
  getCurrentWeekId,
  getHabitTitleKeyFallback,
  getTodayDayKey,
  type DayKey,
  type HabitItem,
  type HabitTheme,
} from '@/constants/habits';

type CreateHabitInput = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  theme: HabitTheme;
  completionVariant: 'light' | 'dark';
  scheduledDays: DayKey[];
  reminderEnabled: boolean;
  reminderMinutes: number;
  targetMinutes: number;
};

type HabitsContextValue = {
  habits: HabitItem[];
  addHabit: (input: CreateHabitInput) => HabitItem;
  completeHabitToday: (habitId: string) => boolean;
  toggleHabitToday: (habitId: string) => boolean;
  toggleHabitDay: (habitId: string, dayKey: DayKey) => boolean;
};

type StoredHabitsPayload = {
  habits: HabitItem[];
  weekId: string;
};

const HABITS_STORAGE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}degrow-habits.json`
  : null;

const HabitsContext = createContext<HabitsContextValue | null>(null);

function sanitizeHabit(habit: HabitItem): HabitItem {
  const titleKey = habit.titleKey ?? getHabitTitleKeyFallback(habit.id);
  const scheduledDays = habit.scheduledDays?.length ? habit.scheduledDays : habit.days.map((day) => day.key);

  return {
    ...habit,
    titleKey,
    scheduledDays,
    reminderEnabled: habit.reminderEnabled ?? false,
    reminderMinutes: habit.reminderMinutes ?? 19 * 60,
    targetMinutes: habit.targetMinutes ?? 10,
  };
}

function resetHabitForCurrentWeek(habit: HabitItem) {
  return {
    ...habit,
    days: buildWeekDays(),
  };
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<HabitItem[]>(defaultHabits);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const currentWeekId = useMemo(() => getCurrentWeekId(), []);

  useEffect(() => {
    let isMounted = true;

    const loadHabits = async () => {
      if (!HABITS_STORAGE_URI) {
        setHasLoadedStorage(true);
        return;
      }

      try {
        const info = await FileSystem.getInfoAsync(HABITS_STORAGE_URI);

        if (!info.exists) {
          return;
        }

        const content = await FileSystem.readAsStringAsync(HABITS_STORAGE_URI);
        const parsed = JSON.parse(content) as StoredHabitsPayload | HabitItem[];
        const storedHabits = Array.isArray(parsed) ? parsed : parsed.habits;
        const storedWeekId = Array.isArray(parsed) ? currentWeekId : parsed.weekId;
        const normalizedHabits = storedHabits.map(sanitizeHabit);

        if (isMounted) {
          setHabits(
            storedWeekId === currentWeekId
              ? normalizedHabits
              : normalizedHabits.map(resetHabitForCurrentWeek)
          );
        }
      } catch {
        // Ignore corrupt or missing local data and keep seeded defaults.
      } finally {
        if (isMounted) {
          setHasLoadedStorage(true);
        }
      }
    };

    void loadHabits();

    return () => {
      isMounted = false;
    };
  }, [currentWeekId]);

  useEffect(() => {
    if (!hasLoadedStorage || !HABITS_STORAGE_URI) {
      return;
    }

    const payload: StoredHabitsPayload = {
      weekId: currentWeekId,
      habits,
    };

    void FileSystem.writeAsStringAsync(HABITS_STORAGE_URI, JSON.stringify(payload)).catch(() => {
      // Ignore local persistence failures and keep in-memory state working.
    });
  }, [currentWeekId, habits, hasLoadedStorage]);

  const addHabit = (input: CreateHabitInput) => {
    const nextHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      title: input.title,
      icon: input.icon,
      theme: input.theme,
      completionVariant: input.completionVariant,
      scheduledDays: input.scheduledDays,
      reminderEnabled: input.reminderEnabled,
      reminderMinutes: input.reminderMinutes,
      targetMinutes: input.targetMinutes,
      days: buildWeekDays(),
    };

    setHabits((current) => [nextHabit, ...current]);

    return nextHabit;
  };

  const toggleHabitDay = (habitId: string, dayKey: DayKey) => {
    let didToggle = false;

    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId || !habit.scheduledDays.includes(dayKey)) {
          return habit;
        }

        didToggle = true;

        return {
          ...habit,
          days: buildWeekDays(
            {
              ...filledMapFromDays(habit.days),
              [dayKey]: !habit.days.find((day) => day.key === dayKey)?.filled,
            }
          ),
        };
      })
    );

    return didToggle;
  };

  const setHabitDayCompletion = (habitId: string, dayKey: DayKey, filled: boolean) => {
    let didUpdate = false;

    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        didUpdate = true;

        return {
          ...habit,
          days: buildWeekDays({
            ...filledMapFromDays(habit.days),
            [dayKey]: filled,
          }),
        };
      })
    );

    return didUpdate;
  };

  const toggleHabitToday = (habitId: string) => {
    return toggleHabitDay(habitId, getTodayDayKey());
  };

  const completeHabitToday = (habitId: string) => {
    return setHabitDayCompletion(habitId, getTodayDayKey(), true);
  };

  return (
    <HabitsContext.Provider value={{ habits, addHabit, completeHabitToday, toggleHabitToday, toggleHabitDay }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used inside HabitsProvider');
  }

  return context;
}
