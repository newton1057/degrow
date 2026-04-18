import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
    buildWeekDays,
    filledMapFromDays,
    getCurrentWeekId,
    getHabitTitleKeyFallback,
    getTodayDayKey,
    type DayKey,
    type HabitItem,
    type HabitTheme
} from '@/constants/habits';
import { useAuth } from '@/providers/auth-provider';
import { useSettings } from '@/providers/settings-provider';
import {
    saveUserHabitsState,
    subscribeToUserHabitsState,
    type UserHabitsState,
} from '@/services/user-habits';

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

type StoredHabitsPayload = UserHabitsState;

const LEGACY_HABITS_STORAGE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}degrow-habits.json`
  : null;

const HabitsContext = createContext<HabitsContextValue | null>(null);

function sanitizeHabit(habit: HabitItem, startOfWeek: DayKey = 'sat'): HabitItem {
  const titleKey = habit.titleKey ?? getHabitTitleKeyFallback(habit.id);
  const days = habit.days?.length ? habit.days : buildWeekDays({}, new Date(), startOfWeek);
  const scheduledDays = habit.scheduledDays?.length ? habit.scheduledDays : days.map((day) => day.key);

  return {
    ...habit,
    titleKey,
    scheduledDays,
    days,
    reminderEnabled: habit.reminderEnabled ?? false,
    reminderMinutes: habit.reminderMinutes ?? 19 * 60,
    targetMinutes: habit.targetMinutes ?? 10,
  };
}

function resetHabitForCurrentWeek(habit: HabitItem, startOfWeek: DayKey = 'sat') {
  return {
    ...habit,
    days: buildWeekDays({}, new Date(), startOfWeek),
  };
}

function getUserHabitsStorageUri(userId: string) {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}degrow-habits-${userId}.json` : null;
}

function serializePayload(payload: StoredHabitsPayload) {
  return JSON.stringify(payload);
}

function normalizeHabitsPayload(
  payload: StoredHabitsPayload | HabitItem[] | null,
  currentWeekId: string,
  startOfWeek: DayKey = 'sat'
): StoredHabitsPayload | null {
  if (!payload) {
    return null;
  }

  const storedHabits = Array.isArray(payload) ? payload : payload.habits;

  if (!Array.isArray(storedHabits)) {
    return null;
  }

  const storedWeekId = Array.isArray(payload) ? currentWeekId : payload.weekId;
  const normalizedHabits = storedHabits.map(h => sanitizeHabit(h, startOfWeek));

  return {
    weekId: currentWeekId,
    habits:
      storedWeekId === currentWeekId
        ? normalizedHabits
        : normalizedHabits.map(h => resetHabitForCurrentWeek(h, startOfWeek)),
  };
}

async function readLocalHabitsPayload(userId: string, currentWeekId: string, startOfWeek: DayKey = 'sat') {
  const storageUris = [getUserHabitsStorageUri(userId), LEGACY_HABITS_STORAGE_URI].filter(
    (storageUri): storageUri is string => Boolean(storageUri)
  );

  for (const storageUri of storageUris) {
    const info = await FileSystem.getInfoAsync(storageUri);

    if (!info.exists) {
      continue;
    }

    const content = await FileSystem.readAsStringAsync(storageUri);
    const parsed = JSON.parse(content) as StoredHabitsPayload | HabitItem[];
    const payload = normalizeHabitsPayload(parsed, currentWeekId, startOfWeek);

    if (payload) {
      return payload;
    }
  }

  return null;
}

async function writeLocalHabitsPayload(userId: string, payload: StoredHabitsPayload) {
  const storageUri = getUserHabitsStorageUri(userId);

  if (!storageUri) {
    return;
  }

  await FileSystem.writeAsStringAsync(storageUri, JSON.stringify(payload));
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [hasLoadedLocalState, setHasLoadedLocalState] = useState(false);
  const [hasLoadedRemoteState, setHasLoadedRemoteState] = useState(false);
  const startOfWeek = settings.experience.startOfWeek;
  const currentWeekId = useMemo(() => getCurrentWeekId(new Date(), startOfWeek), [startOfWeek]);
  const activeUserIdRef = useRef<string | null>(null);
  const hasAppliedRemotePayloadRef = useRef(false);
  const lastSyncedPayloadRef = useRef<string | null>(null);
  const previousWeekIdRef = useRef<string>(currentWeekId);

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id ?? null;

    activeUserIdRef.current = userId;
    hasAppliedRemotePayloadRef.current = false;
    lastSyncedPayloadRef.current = null;
    setHasLoadedLocalState(false);
    setHasLoadedRemoteState(false);

    if (!userId) {
      setHabits([]);
      setHasLoadedLocalState(true);
      setHasLoadedRemoteState(true);
      return () => {
        isMounted = false;
      };
    }

    const loadHabits = async () => {
      try {
        const payload = await readLocalHabitsPayload(userId, currentWeekId, startOfWeek);

        if (isMounted && activeUserIdRef.current === userId && payload) {
          setHabits(payload.habits);
        }
      } catch (error) {
        console.warn('Unable to load local habits cache.', error);
        // Ignore corrupt or missing local data and keep seeded defaults.
      } finally {
        if (isMounted && activeUserIdRef.current === userId) {
          setHasLoadedLocalState(true);
        }
      }
    };

    void loadHabits();

    const unsubscribe = subscribeToUserHabitsState(
      userId,
      (remotePayload) => {
        if (!isMounted || activeUserIdRef.current !== userId) {
          return;
        }

        const normalizedPayload = normalizeHabitsPayload(remotePayload, currentWeekId, startOfWeek);

        if (normalizedPayload) {
          hasAppliedRemotePayloadRef.current = true;
          lastSyncedPayloadRef.current = serializePayload(normalizedPayload);
          setHabits(normalizedPayload.habits);
          void writeLocalHabitsPayload(userId, normalizedPayload).catch((error) => {
            console.warn('Unable to update local habits cache.', error);
          });
        }

        setHasLoadedRemoteState(true);
      },
      (error) => {
        console.warn('Unable to sync habits with Firestore.', error);

        if (isMounted && activeUserIdRef.current === userId) {
          setHasLoadedRemoteState(true);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentWeekId, startOfWeek, user?.id]);

  // Detectar cambio de semana y reiniciar progreso
  useEffect(() => {
    if (!hasLoadedLocalState || !hasLoadedRemoteState) {
      return;
    }

    if (previousWeekIdRef.current !== currentWeekId) {
      console.log('📅 Week changed, resetting habit progress:', previousWeekIdRef.current, '→', currentWeekId);
      
      // Reiniciar días de todos los hábitos para la nueva semana
      setHabits((currentHabits) =>
        currentHabits.map((habit) => ({
          ...habit,
          days: buildWeekDays({}, new Date(), startOfWeek),
        }))
      );

      previousWeekIdRef.current = currentWeekId;
    }
  }, [currentWeekId, hasLoadedLocalState, hasLoadedRemoteState, startOfWeek]);

  useEffect(() => {
    const userId = user?.id;

    if (!userId || !hasLoadedLocalState || !hasLoadedRemoteState) {
      return;
    }

    const payload: StoredHabitsPayload = {
      weekId: currentWeekId,
      habits,
    };
    const serializedPayload = serializePayload(payload);

    if (lastSyncedPayloadRef.current === serializedPayload) {
      return;
    }

    lastSyncedPayloadRef.current = serializedPayload;

    void writeLocalHabitsPayload(userId, payload).catch((error) => {
      console.warn('Unable to persist local habits cache.', error);
    });

    void saveUserHabitsState(userId, payload).catch((error) => {
      console.warn('Unable to persist habits to Firestore.', error);
      lastSyncedPayloadRef.current = null;
    });
  }, [currentWeekId, habits, hasLoadedLocalState, hasLoadedRemoteState, user?.id]);

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
      days: buildWeekDays({}, new Date(), startOfWeek),
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
            },
            new Date(),
            startOfWeek
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
          }, new Date(), startOfWeek),
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
