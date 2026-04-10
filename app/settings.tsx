import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useI18n, type AppLanguage } from '@/providers/language-provider';
import { useAppTheme, type ThemePreference } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';

type SettingToggleRowProps = {
  description?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

type SettingValueRowProps = {
  description?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
};

function SettingToggleRow({
  description,
  icon,
  title,
  value,
  onValueChange,
}: SettingToggleRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingRowMain}>
        <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialCommunityIcons name={icon} size={18} color={colors.icon} />
        </View>
        <View style={styles.settingTextWrap}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {description ? <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{description}</Text> : null}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? '#F4F4F5' : colors.switchFalseThumb}
        trackColor={{ false: colors.switchFalseTrack, true: colors.text }}
        ios_backgroundColor={colors.switchFalseTrack}
      />
    </View>
  );
}

function SettingValueRow({ description, icon, title, value }: SettingValueRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable style={styles.settingRow}>
      <View style={styles.settingRowMain}>
        <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialCommunityIcons name={icon} size={18} color={colors.icon} />
        </View>
        <View style={styles.settingTextWrap}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {description ? <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{description}</Text> : null}
        </View>
      </View>

      <View style={styles.settingValueWrap}>
        <Text style={[styles.settingValue, { color: colors.textSoft }]}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
      </View>
    </Pressable>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionEyebrow, { color: colors.textSoft }]}>{eyebrow}</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function OptionChip({
  label,
  active,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.languageChip,
        { backgroundColor: colors.chipBg, borderColor: colors.border },
        active && { backgroundColor: colors.chipActiveBg, borderColor: colors.chipActiveBg },
      ]}>
      <Text style={[styles.languageChipText, { color: colors.text }, active && { color: colors.chipTextOnActive }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();
  const { colors, resolvedTheme, themePreference, setThemePreference } = useAppTheme();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [habitRemindersEnabled, setHabitRemindersEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [weeklyReviewEnabled, setWeeklyReviewEnabled] = useState(false);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </Pressable>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('settings.title')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="settings-outline" size={26} color={colors.icon} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{t('settings.heroTitle')}</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{t('settings.heroSubtitle')}</Text>
              </View>
            </View>

            <Section eyebrow={t('settings.sections.focusEyebrow')} title={t('settings.sections.habitsAndReminders')}>
              <SettingToggleRow
                icon="bell-badge-outline"
                title={t('settings.rows.pushNotificationsTitle')}
                description={t('settings.rows.pushNotificationsDescription')}
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingToggleRow
                icon="clock-outline"
                title={t('settings.rows.dailyHabitRemindersTitle')}
                description={t('settings.rows.dailyHabitRemindersDescription')}
                value={habitRemindersEnabled}
                onValueChange={setHabitRemindersEnabled}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingValueRow
                icon="calendar-start"
                title={t('settings.rows.startOfWeekTitle')}
                description={t('settings.rows.startOfWeekDescription')}
                value={t('daysFull.sat')}
              />
            </Section>

            <Section eyebrow={t('settings.sections.experienceEyebrow')} title={t('settings.sections.appBehavior')}>
              <SettingToggleRow
                icon="vibrate"
                title={t('settings.rows.hapticsTitle')}
                description={t('settings.rows.hapticsDescription')}
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingToggleRow
                icon="chart-timeline-variant"
                title={t('settings.rows.weeklyReviewTitle')}
                description={t('settings.rows.weeklyReviewDescription')}
                value={weeklyReviewEnabled}
                onValueChange={setWeeklyReviewEnabled}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.preferenceBlock}>
                <View style={styles.settingRowMain}>
                  <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceMuted }]}>
                    <MaterialCommunityIcons name="theme-light-dark" size={18} color={colors.icon} />
                  </View>
                  <View style={styles.settingTextWrap}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.rows.appearanceTitle')}</Text>
                    <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                      {t('settings.rows.appearanceDescription')}
                    </Text>
                  </View>
                </View>
                <View style={styles.languageRow}>
                  {(['system', 'light', 'dark'] as const).map((option) => (
                    <OptionChip
                      key={option}
                      active={themePreference === option}
                      label={t(`settings.values.${option}`)}
                      onPress={() => setThemePreference(option as ThemePreference)}
                    />
                  ))}
                </View>
              </View>
            </Section>

            <Section eyebrow={t('settings.sections.languageEyebrow')} title={t('settings.sections.language')}>
              <Text style={[styles.languageDescription, { color: colors.textMuted }]}>{t('settings.languageDescription')}</Text>
              <View style={styles.languageRow}>
                {(['en', 'es'] as const).map((option) => (
                  <OptionChip
                    key={option}
                    active={language === option}
                    label={t(`languageNames.${option}`)}
                    onPress={() => setLanguage(option as AppLanguage)}
                  />
                ))}
              </View>
            </Section>

            <Section eyebrow={t('settings.sections.accountEyebrow')} title={t('settings.sections.profileAndData')}>
              <SettingValueRow
                icon="account-circle-outline"
                title={t('settings.rows.profileTitle')}
                description={t('settings.rows.profileDescription')}
                value={t('settings.values.personal')}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingValueRow
                icon="database-export-outline"
                title={t('settings.rows.exportDataTitle')}
                description={t('settings.rows.exportDataDescription')}
                value={t('settings.values.available')}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingValueRow
                icon="shield-check-outline"
                title={t('settings.rows.privacyTitle')}
                description={t('settings.rows.privacyDescription')}
                value={t('settings.values.review')}
              />
            </Section>

            <Pressable
              onPress={signOut}
              style={({ pressed }) => [
                styles.signOutButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 }
              ]}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#FF453A" />
              <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screen: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerSpacer: {
    width: 34,
    height: 34,
  },
  screenTitle: {
    color: '#F5F5F7',
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
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#F5F5F7',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  heroSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  sectionCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
  },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    marginTop: 4,
    color: '#F5F5F7',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sectionBody: {
    marginTop: 16,
  },
  preferenceBlock: {
    gap: 14,
  },
  settingRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    color: '#F5F5F7',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  settingDescription: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12.5,
    lineHeight: 17,
  },
  settingValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  settingValue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  languageDescription: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12.5,
    lineHeight: 17,
  },
  languageRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  languageChip: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageChipText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  signOutButton: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
  },
});
