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

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';
import { getFirebaseAuthErrorMessageKey } from '@/services/firebase-auth-errors';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { signIn, isLoading } = useAuth();
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

  const handleSocialLogin = () => {
    void haptics.selectionAsync();
    Alert.alert(t('auth.socialUnavailableTitle'), t('auth.socialUnavailableMessage'));
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

            <View style={styles.separatorContainer}>
              <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.separatorText, { color: colors.textMuted }]}>{t('auth.orContinueWith')}</Text>
              <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialContainer}>
              <Pressable
                style={[styles.socialButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={handleSocialLogin}
                disabled={isLoading}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>{t('auth.continueWithGoogle')}</Text>
              </Pressable>

              <Pressable
                style={[styles.socialButton, { backgroundColor: colors.text, borderColor: colors.text }]}
                onPress={handleSocialLogin}
                disabled={isLoading}>
                <Ionicons name="logo-apple" size={20} color={colors.background} />
                <Text style={[styles.socialButtonText, { color: colors.background }]}>{t('auth.continueWithApple')}</Text>
              </Pressable>
            </View>
          </View>

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
    marginBottom: 40,
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
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
