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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id ?? null;

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
  }, [user?.id]);

  const updateSettings = async (partialSettings: Partial<UserSettings>) => {
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
