import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { type HabitItem } from '@/constants/habits';
import { useAuth } from '@/providers/auth-provider';
import { useHabits } from '@/providers/habits-provider';
import { useI18n } from '@/providers/language-provider';
import { useSettings } from '@/providers/settings-provider';
import {
    addLocalNotificationListeners,
    cancelHabitReminderNotifications,
    configureLocalNotifications,
    syncHabitReminderNotifications,
} from '@/services/local-notifications';

function getHabitLabel(habit: HabitItem, t: (key: string) => string) {
  if (habit.titleKey) {
    return t(habit.titleKey);
  }

  return habit.title ?? t('newHabit.previewFallback');
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const { habits, completeHabitToday } = useHabits();
  const { language, t } = useI18n();
  const { settings } = useSettings();

  useEffect(() => {
    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    void configureLocalNotifications();

    void addLocalNotificationListeners({
      onReceived: (data) => {
        const { kind, habitId } = data;

        if (kind === 'habit-timer' && typeof habitId === 'string') {
          completeHabitToday(habitId);
        }
      },
      onResponse: (data) => {
        const { kind, habitId, url } = data;

        if (kind === 'habit-timer' && typeof habitId === 'string') {
          completeHabitToday(habitId);
        }

        if (typeof url === 'string') {
          router.push(url as Href);
        }
      },
    }).then((nextSubscription) => {
      if (!isMounted) {
        nextSubscription.remove();
        return;
      }

      subscription = nextSubscription;
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [completeHabitToday, router]);

  useEffect(() => {
    // Si no hay usuario o las notificaciones están deshabilitadas, cancelar todas
    if (!user || !settings.notifications.pushEnabled || !settings.notifications.dailyRemindersEnabled) {
      void cancelHabitReminderNotifications();
      return;
    }

    void syncHabitReminderNotifications({
      habits,
      getHabitTitle: (habit) => getHabitLabel(habit, t),
      copy: {
        title: t('notifications.habitReminderTitle'),
        body: (habitTitle) => t('notifications.habitReminderBody', { habit: habitTitle }),
      },
    });
  }, [habits, language, settings.notifications.dailyRemindersEnabled, settings.notifications.pushEnabled, t, user]);

  return children;
}
