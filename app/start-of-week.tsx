import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WEEK_DAY_KEYS, type DayKey } from '@/constants/habits';
import { useI18n } from '@/providers/language-provider';
import { useSettings } from '@/providers/settings-provider';
import { useAppTheme } from '@/providers/theme-provider';

type DayOptionProps = {
  dayKey: DayKey;
  isSelected: boolean;
  onPress: () => void;
};

function DayOption({ dayKey, isSelected, onPress }: DayOptionProps) {
  const { t } = useI18n();
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayOption,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isSelected && { backgroundColor: colors.tint, borderColor: colors.tint },
        pressed && { opacity: 0.7 },
      ]}>
      <View style={styles.dayOptionMain}>
        <Text style={[styles.dayOptionTitle, { color: isSelected ? colors.background : colors.text }]}>
          {t(`daysFull.${dayKey}`)}
        </Text>
        <Text style={[styles.dayOptionSubtitle, { color: isSelected ? colors.background : colors.textMuted }]}>
          {t(`daysShort.${dayKey}`)}
        </Text>
      </View>
      {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.background} />}
    </Pressable>
  );
}

export default function StartOfWeekScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { settings, updateSettings } = useSettings();
  const haptics = useHaptics();

  const handleSelectDay = async (dayKey: DayKey) => {
    void haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);

    await updateSettings({
      experience: {
        ...settings.experience,
        startOfWeek: dayKey,
      },
    });

    // Pequeño delay para feedback visual
    setTimeout(() => {
      router.back();
    }, 200);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </Pressable>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('startOfWeek.title')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="calendar-outline" size={26} color={colors.icon} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{t('startOfWeek.heroTitle')}</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                  {t('startOfWeek.heroSubtitle')}
                </Text>
              </View>
            </View>

            <View style={styles.daysContainer}>
              {WEEK_DAY_KEYS.map((dayKey) => (
                <DayOption
                  key={dayKey}
                  dayKey={dayKey}
                  isSelected={settings.experience.startOfWeek === dayKey}
                  onPress={() => handleSelectDay(dayKey)}
                />
              ))}
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSoft} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>{t('startOfWeek.infoText')}</Text>
            </View>
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
    paddingHorizontal: 2,
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
    flex: 1,
    textAlign: 'center',
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
  daysContainer: {
    gap: 10,
  },
  dayOption: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#0C0C0D',
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 68,
  },
  dayOptionMain: {
    flex: 1,
  },
  dayOptionTitle: {
    color: '#F5F5F7',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  dayOptionSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 13,
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0A0A0B',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12,
    lineHeight: 17,
  },
});
