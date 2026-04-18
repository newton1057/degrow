import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore';

import { type DayKey } from '@/constants/habits';
import { firestore } from '@/services/firebase';
import { toFirestoreData } from '@/services/firestore-utils';

export type UserSettings = {
  notifications: {
    pushEnabled: boolean;
    dailyRemindersEnabled: boolean;
  };
  experience: {
    hapticsEnabled: boolean;
    weeklyReviewEnabled: boolean;
    startOfWeek: DayKey;
  };
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifications: {
    pushEnabled: true,
    dailyRemindersEnabled: true,
  },
  experience: {
    hapticsEnabled: true,
    weeklyReviewEnabled: false,
    startOfWeek: 'sat',
  },
};

function getUserSettingsRef(userId: string) {
  return doc(firestore, 'users', userId, 'settings', 'preferences');
}

function mapUserSettings(data: Record<string, unknown> | undefined): UserSettings | null {
  if (!data) {
    return null;
  }

  const notifications = data.notifications as Record<string, unknown> | undefined;
  const experience = data.experience as Record<string, unknown> | undefined;

  return {
    notifications: {
      pushEnabled: typeof notifications?.pushEnabled === 'boolean' ? notifications.pushEnabled : DEFAULT_USER_SETTINGS.notifications.pushEnabled,
      dailyRemindersEnabled: typeof notifications?.dailyRemindersEnabled === 'boolean' ? notifications.dailyRemindersEnabled : DEFAULT_USER_SETTINGS.notifications.dailyRemindersEnabled,
    },
    experience: {
      hapticsEnabled: typeof experience?.hapticsEnabled === 'boolean' ? experience.hapticsEnabled : DEFAULT_USER_SETTINGS.experience.hapticsEnabled,
      weeklyReviewEnabled: typeof experience?.weeklyReviewEnabled === 'boolean' ? experience.weeklyReviewEnabled : DEFAULT_USER_SETTINGS.experience.weeklyReviewEnabled,
      startOfWeek: typeof experience?.startOfWeek === 'string' ? (experience.startOfWeek as DayKey) : DEFAULT_USER_SETTINGS.experience.startOfWeek,
    },
  };
}

export function subscribeToUserSettings(
  userId: string,
  onSettings: (settings: UserSettings) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    getUserSettingsRef(userId),
    (snapshot) => {
      const settings = snapshot.exists() ? mapUserSettings(snapshot.data()) : DEFAULT_USER_SETTINGS;
      onSettings(settings ?? DEFAULT_USER_SETTINGS);
    },
    onError
  );
}

export async function saveUserSettings(userId: string, settings: Partial<UserSettings>) {
  await setDoc(
    getUserSettingsRef(userId),
    toFirestoreData({
      ...settings,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
}
