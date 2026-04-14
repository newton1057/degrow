import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function AuthLayout() {
  const { user, isInitializing } = useAuth();
  const { colors } = useAppTheme();

  if (isInitializing) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="register" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
