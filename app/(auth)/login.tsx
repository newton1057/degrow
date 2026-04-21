import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHaptics } from '@/hooks/use-haptics';
import { useAuth } from '@/providers/auth-provider';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';
import { getFirebaseAuthErrorMessageKey } from '@/services/firebase-auth-errors';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { signIn, continueAsGuest, isLoading } = useAuth();
  const haptics = useHaptics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    void haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);

    if (!email.trim() || !password) {
      Alert.alert(t('auth.requiredFieldsTitle'), t('auth.requiredFieldsMessage'));
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(t('auth.logInErrorTitle'), t(getFirebaseAuthErrorMessageKey(error)));
    }
  };

  const handleContinueAsGuest = async () => {
    void haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);

    try {
      await continueAsGuest();
    } catch {
      // Guest mode should always work since it's local-only
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerArea}>
            <Text style={[styles.title, { color: colors.text }]}>{t('auth.logInTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('auth.logInSubtitle')}</Text>
          </View>

          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('auth.emailLabel')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={colors.textSoft}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('auth.passwordLabel')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={colors.textSoft}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.tint },
                isLoading && { opacity: 0.5 }
              ]}>
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {isLoading ? '...' : t('auth.logInAction')}
              </Text>
            </Pressable>

          </View>

          <Pressable
            onPress={handleContinueAsGuest}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.guestButton,
              { borderColor: colors.border },
              (pressed || isLoading) && { opacity: 0.7 },
            ]}>
            <Text style={[styles.guestButtonText, { color: colors.textMuted }]}>
              {t('guest.continueWithout')}
            </Text>
          </Pressable>

          <View style={styles.footerArea}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {t('auth.noAccount')}
            </Text>
            <Pressable onPress={() => { void haptics.selectionAsync(); router.push('/(auth)/register'); }}>
              <Text style={[styles.footerLink, { color: colors.tint }]}>{t('auth.goToSignUp')}</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  formArea: {
    gap: 20,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  guestButton: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
