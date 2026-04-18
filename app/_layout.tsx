import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useNameMigrationRedirect } from '@/hooks/use-name-migration';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { HabitsProvider } from '@/providers/habits-provider';
import { LanguageProvider, useI18n } from '@/providers/language-provider';
import { NotificationsProvider } from '@/providers/notifications-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { user, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useNameMigrationRedirect();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [hasMounted, isInitializing, router, segments, user]);

  const navigationTheme = {
    ...(resolvedTheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolvedTheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      text: colors.text,
      primary: colors.tint,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="new-habit" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="habit-session" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="profile-edit" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="export-data" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="permissions" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="start-of-week" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="name-migration" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: t('modal.title') }} />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <AppThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <HabitsProvider>
                <NotificationsProvider>
                  <BottomSheetModalProvider>
                    <RootLayoutNav />
                  </BottomSheetModalProvider>
                </NotificationsProvider>
              </HabitsProvider>
            </SettingsProvider>
          </AuthProvider>
        </AppThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
