import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '@/providers/auth-provider';
import {
    DEFAULT_USER_SETTINGS,
    saveUserSettings,
    subscribeToUserSettings,
    type UserSettings,
} from '@/services/user-settings';

type SettingsContextValue = {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const GUEST_SETTINGS_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}degrow-settings-guest.json`
  : null;

async function readGuestSettings(): Promise<UserSettings | null> {
  if (!GUEST_SETTINGS_URI) {
    return null;
  }

  try {
    const info = await FileSystem.getInfoAsync(GUEST_SETTINGS_URI);

    if (!info.exists) {
      return null;
    }

    return JSON.parse(await FileSystem.readAsStringAsync(GUEST_SETTINGS_URI)) as UserSettings;
  } catch {
    return null;
  }
}

async function writeGuestSettings(settings: UserSettings) {
  if (!GUEST_SETTINGS_URI) {
    return;
  }

  await FileSystem.writeAsStringAsync(GUEST_SETTINGS_URI, JSON.stringify(settings));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id ?? null;

    // Guest mode: load settings from local storage
    if (isGuest) {
      void readGuestSettings().then((stored) => {
        if (isMounted && stored) {
          setSettings(stored);
        }
      });

      return () => {
        isMounted = false;
      };
    }

    if (!userId) {
      setSettings(DEFAULT_USER_SETTINGS);
      return () => {
        isMounted = false;
      };
    }

    const unsubscribe = subscribeToUserSettings(
      userId,
      (remoteSettings) => {
        if (isMounted) {
          setSettings(remoteSettings);
        }
      },
      (error) => {
        console.warn('Unable to sync settings with Firestore.', error);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isGuest, user?.id]);

  const updateSettings = async (partialSettings: Partial<UserSettings>) => {
    // Guest mode: persist locally only
    if (isGuest) {
      setIsLoading(true);

      try {
        const updated: UserSettings = {
          notifications: {
            ...settings.notifications,
            ...partialSettings.notifications,
          },
          experience: {
            ...settings.experience,
            ...partialSettings.experience,
          },
        };

        setSettings(updated);
        await writeGuestSettings(updated);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    const userId = user?.id;

    if (!userId) {
      return;
    }

    setIsLoading(true);

    try {
      // Optimistic update
      setSettings((current) => ({
        notifications: {
          ...current.notifications,
          ...partialSettings.notifications,
        },
        experience: {
          ...current.experience,
          ...partialSettings.experience,
        },
      }));

      await saveUserSettings(userId, partialSettings);
    } catch (error) {
      console.warn('Unable to save settings to Firestore.', error);
      // Revert on error - the subscription will restore the correct state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }

  return context;
}
