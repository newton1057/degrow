import { Ionicons } from '@expo/vector-icons';
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

export default function ProfileEditScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { user, updateProfile, isLoading } = useAuth();
  const haptics = useHaptics();
  const [name, setName] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = name.trim() !== (user?.name ?? '');
  const canSave = name.trim().length > 0 && hasChanges && !isLoading && !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    void haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      await updateProfile({ name: name.trim() });
      void haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('profileEdit.successTitle'),
        t('profileEdit.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      void haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('profileEdit.errorTitle'),
        t('profileEdit.errorMessage')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <View style={styles.contentColumn}>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="chevron-back" size={22} color={colors.icon} />
              </Pressable>
              <Text style={[styles.screenTitle, { color: colors.text }]}>{t('profileEdit.title')}</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                  <Ionicons name="person-outline" size={26} color={colors.icon} />
                </View>
                <View style={styles.heroTextWrap}>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>{t('profileEdit.heroTitle')}</Text>
                  <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{t('profileEdit.heroSubtitle')}</Text>
                </View>
              </View>

              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profileEdit.personalInfo')}</Text>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>{t('profileEdit.nameLabel')}</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('profileEdit.namePlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={50}
                  />
                  <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
                    {t('profileEdit.nameHint')}
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>{t('profileEdit.emailLabel')}</Text>
                  <View style={[styles.inputDisabled, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                    <Text style={[styles.inputDisabledText, { color: colors.textMuted }]}>
                      {user?.email ?? t('profileEdit.noEmail')}
                    </Text>
                  </View>
                  <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
                    {t('profileEdit.emailHint')}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleSave}
                disabled={!canSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    backgroundColor: canSave ? colors.tint : colors.surfaceMuted,
                    borderColor: canSave ? colors.tint : colors.border,
                  },
                  pressed && canSave && { opacity: 0.8 },
                  !canSave && { opacity: 0.5 },
                ]}>
                <Ionicons name="checkmark-circle" size={20} color={canSave ? '#FFFFFF' : colors.textMuted} />
                <Text style={[styles.saveButtonText, { color: canSave ? '#FFFFFF' : colors.textMuted }]}>
                  {isSaving ? t('profileEdit.saving') : t('profileEdit.saveChanges')}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
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
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  contentColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerSpacer: {
    width: 34,
    height: 34,
  },
  screenTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 44,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 19,
  },
  section: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  inputDisabled: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputDisabledText: {
    fontSize: 15,
    fontWeight: '500',
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
