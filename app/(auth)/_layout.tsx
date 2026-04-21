import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function AuthLayout() {
  const { user, isInitializing, isGuest } = useAuth();
  const { colors } = useAppTheme();

  if (isInitializing) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  // Allow guests to visit auth screens (to create account / log in)
  if (user && !isGuest) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="register" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
