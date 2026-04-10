import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { HabitsProvider } from '@/providers/habits-provider';
import { LanguageProvider, useI18n } from '@/providers/language-provider';
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="new-habit" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: t('modal.title') }} />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AppThemeProvider>
        <HabitsProvider>
          <RootLayoutNav />
        </HabitsProvider>
      </AppThemeProvider>
    </LanguageProvider>
  );
}
