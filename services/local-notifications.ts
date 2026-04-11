import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

import { type DayKey, type HabitItem } from '@/constants/habits';

export const HABIT_REMINDER_CHANNEL_ID = 'habit-reminders';
export const HABIT_TIMER_CHANNEL_ID = 'habit-timers';

const HABIT_REMINDER_PREFIX = 'habit-reminder';
const HABIT_TIMER_PREFIX = 'habit-timer';

const DAY_KEY_TO_WEEKDAY: Record<DayKey, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

let hasConfiguredNotificationHandler = false;
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let hasLoggedMissingNotificationsModule = false;

const COMMON_EXPO_NOTIFICATIONS_NATIVE_MODULES = [
  'ExpoBadgeModule',
  'ExpoBackgroundNotificationTasksModule',
  'ExpoNotificationCategoriesModule',
  'ExpoNotificationPermissionsModule',
  'ExpoNotificationPresenter',
  'ExpoNotificationScheduler',
  'ExpoNotificationsEmitter',
  'ExpoNotificationsHandlerModule',
  'ExpoPushTokenManager',
  'NotificationsServerRegistrationModule',
];

const ANDROID_EXPO_NOTIFICATIONS_NATIVE_MODULES = [
  'ExpoNotificationChannelGroupManager',
  'ExpoNotificationChannelManager',
];

type NotificationsModule = typeof import('expo-notifications');
type NotificationPermissionsStatus = import('expo-notifications').NotificationPermissionsStatus;
type NotificationData = Record<string, unknown>;

type HabitNotificationCopy = {
  body: (habitTitle: string) => string;
  title: string;
};

type TimerNotificationCopy = {
  body: string;
  title: string;
};

function getReminderIdentifier(habitId: string, suffix: string) {
  return `${HABIT_REMINDER_PREFIX}-${habitId}-${suffix}`;
}

function getTimerIdentifier(habitId: string) {
  return `${HABIT_TIMER_PREFIX}-${habitId}`;
}

function getTimeParts(totalMinutes: number) {
  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60,
  };
}

function allowsNotifications(settings: NotificationPermissionsStatus, Notifications: NotificationsModule) {
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

function hasNativeExpoModule(moduleName: string) {
  return Boolean(requireOptionalNativeModule(moduleName));
}

function canImportExpoNotifications() {
  const requiredModules =
    Platform.OS === 'android'
      ? [...COMMON_EXPO_NOTIFICATIONS_NATIVE_MODULES, ...ANDROID_EXPO_NOTIFICATIONS_NATIVE_MODULES]
      : COMMON_EXPO_NOTIFICATIONS_NATIVE_MODULES;

  return requiredModules.every(hasNativeExpoModule);
}

function isNotificationsModuleReady(module: NotificationsModule | null): module is NotificationsModule {
  return (
    !!module &&
    typeof module.setNotificationHandler === 'function' &&
    typeof module.getPermissionsAsync === 'function' &&
    typeof module.requestPermissionsAsync === 'function' &&
    typeof module.getAllScheduledNotificationsAsync === 'function' &&
    typeof module.scheduleNotificationAsync === 'function' &&
    typeof module.cancelScheduledNotificationAsync === 'function' &&
    typeof module.addNotificationReceivedListener === 'function' &&
    typeof module.addNotificationResponseReceivedListener === 'function'
  );
}

function logMissingNotificationsModule(error?: unknown) {
  if (hasLoggedMissingNotificationsModule) {
    return;
  }

  console.warn(
    'Local notifications are disabled because expo-notifications is not available in this native build. Rebuild the iOS/Android dev client to enable them.',
    error,
  );
  hasLoggedMissingNotificationsModule = true;
}

async function getNotificationsModule() {
  if (!canImportExpoNotifications()) {
    logMissingNotificationsModule();
    return null;
  }

  notificationsModulePromise ??= import('expo-notifications').catch((error) => {
    logMissingNotificationsModule(error);

    return null;
  });

  const Notifications = await notificationsModulePromise;

  if (!isNotificationsModuleReady(Notifications)) {
    logMissingNotificationsModule();
    return null;
  }

  return Notifications;
}

export async function configureLocalNotifications() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return false;
  }

  if (!hasConfiguredNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    hasConfiguredNotificationHandler = true;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(HABIT_REMINDER_CHANNEL_ID, {
      name: 'Habit reminders',
      description: 'Scheduled reminders for DeGrow habits.',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2CC7D9',
    });

    await Notifications.setNotificationChannelAsync(HABIT_TIMER_CHANNEL_ID, {
      name: 'Habit timers',
      description: 'Focus session completion notifications.',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2CC7D9',
    });
  }

  return true;
}

export async function ensureNotificationPermissions() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return false;
  }

  await configureLocalNotifications();

  const current = await Notifications.getPermissionsAsync();

  if (allowsNotifications(current, Notifications)) {
    return true;
  }

  if (current.status !== Notifications.PermissionStatus.UNDETERMINED) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return allowsNotifications(requested, Notifications);
}

export async function cancelHabitReminderNotifications() {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return;
  }

  await configureLocalNotifications();

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const reminderNotifications = scheduledNotifications.filter((request) =>
    request.identifier.startsWith(HABIT_REMINDER_PREFIX)
  );

  await Promise.all(
    reminderNotifications.map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier))
  );
}

export async function syncHabitReminderNotifications({
  copy,
  getHabitTitle,
  habits,
}: {
  copy: HabitNotificationCopy;
  getHabitTitle: (habit: HabitItem) => string;
  habits: HabitItem[];
}) {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return { permissionGranted: false, scheduledCount: 0 };
  }

  await cancelHabitReminderNotifications();

  const enabledHabits = habits.filter((habit) => habit.reminderEnabled && habit.scheduledDays.length > 0);

  if (enabledHabits.length === 0) {
    return { permissionGranted: true, scheduledCount: 0 };
  }

  const permissionGranted = await ensureNotificationPermissions();

  if (!permissionGranted) {
    return { permissionGranted: false, scheduledCount: 0 };
  }

  let scheduledCount = 0;

  for (const habit of enabledHabits) {
    const { hour, minute } = getTimeParts(habit.reminderMinutes);
    const habitTitle = getHabitTitle(habit);
    const url = `/habit-session?habitId=${encodeURIComponent(habit.id)}`;

    if (habit.scheduledDays.length === 7) {
      await Notifications.scheduleNotificationAsync({
        identifier: getReminderIdentifier(habit.id, 'daily'),
        content: {
          title: copy.title,
          body: copy.body(habitTitle),
          sound: true,
          data: {
            habitId: habit.id,
            kind: HABIT_REMINDER_PREFIX,
            url,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: HABIT_REMINDER_CHANNEL_ID,
          hour,
          minute,
        },
      });
      scheduledCount += 1;
      continue;
    }

    for (const dayKey of habit.scheduledDays) {
      await Notifications.scheduleNotificationAsync({
        identifier: getReminderIdentifier(habit.id, dayKey),
        content: {
          title: copy.title,
          body: copy.body(habitTitle),
          sound: true,
          data: {
            dayKey,
            habitId: habit.id,
            kind: HABIT_REMINDER_PREFIX,
            url,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId: HABIT_REMINDER_CHANNEL_ID,
          weekday: DAY_KEY_TO_WEEKDAY[dayKey],
          hour,
          minute,
        },
      });
      scheduledCount += 1;
    }
  }

  return { permissionGranted: true, scheduledCount };
}

export async function scheduleHabitTimerNotification({
  copy,
  habitId,
  seconds,
}: {
  copy: TimerNotificationCopy;
  habitId: string;
  seconds: number;
}) {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return false;
  }

  const permissionGranted = await ensureNotificationPermissions();

  if (!permissionGranted) {
    return false;
  }

  await Notifications.cancelScheduledNotificationAsync(getTimerIdentifier(habitId));
  await Notifications.scheduleNotificationAsync({
    identifier: getTimerIdentifier(habitId),
    content: {
      title: copy.title,
      body: copy.body,
      sound: true,
      data: {
        habitId,
        kind: HABIT_TIMER_PREFIX,
        url: '/',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: HABIT_TIMER_CHANNEL_ID,
      seconds: Math.max(1, Math.ceil(seconds)),
    },
  });

  return true;
}

export async function cancelHabitTimerNotification(habitId: string) {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return;
  }

  await configureLocalNotifications();
  await Notifications.cancelScheduledNotificationAsync(getTimerIdentifier(habitId));
}

export async function addLocalNotificationListeners({
  onReceived,
  onResponse,
}: {
  onReceived?: (data: NotificationData) => void;
  onResponse?: (data: NotificationData) => void;
}) {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return {
      remove() {},
    };
  }

  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    onReceived?.(notification.request.content.data);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    onResponse?.(response.notification.request.content.data);
  });

  return {
    remove() {
      receivedSubscription.remove();
      responseSubscription.remove();
    },
  };
}
