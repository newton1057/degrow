import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useHabits } from '@/providers/habits-provider';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

function getHabitLabel(
  titleKey: string | undefined,
  title: string | undefined,
  t: (key: string) => string
) {
  return titleKey ? t(titleKey) : title ?? t('newHabit.previewFallback');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { habits } = useHabits();

  const totalCompleted = habits.reduce((acc, habit) => {
    return acc + habit.days.filter((day) => day.filled).length;
  }, 0);

  const longestStreak = Math.max(
    0,
    ...habits.map((habit) => {
      let current = 0;
      let best = 0;

      for (const day of habit.days) {
        if (day.filled) {
          current += 1;
          best = Math.max(best, current);
        } else {
          current = 0;
        }
      }

      return best;
    })
  );

  const strongestHabit = habits.reduce<(typeof habits)[number] | null>((best, habit) => {
    if (!best) {
      return habit;
    }

    const bestCount = best.days.filter((day) => day.filled).length;
    const currentCount = habit.days.filter((day) => day.filled).length;

    return currentCount > bestCount ? habit : best;
  }, null);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('profile.title')}</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/settings')} style={styles.iconAction}>
                <Ionicons name="settings-outline" size={23} color={colors.icon} />
              </Pressable>
              <Pressable style={styles.iconAction}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.icon} />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.avatarWrap, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>DG</Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>{t('profile.heroTitle')}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{t('profile.heroSubtitle')}</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{totalCompleted}</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{t('profile.completed')}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{longestStreak}</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{t('profile.bestStreak')}</Text>
              </View>
            </View>

            {strongestHabit ? (
              <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: strongestHabit.theme.iconBg }]}>
                    <MaterialCommunityIcons
                      name={strongestHabit.icon}
                      size={18}
                      color={strongestHabit.theme.iconColor ?? '#F7F8FB'}
                    />
                  </View>
                  <View style={styles.featureTextWrap}>
                    <Text style={[styles.featureEyebrow, { color: colors.textSoft }]}>{t('profile.topHabit')}</Text>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>
                      {getHabitLabel(strongestHabit.titleKey, strongestHabit.title, t)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.featureBody, { color: colors.textMuted }]}>{t('profile.featureBody')}</Text>
              </View>
            ) : null}

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.thisWeek')}</Text>
              {habits.map((habit) => {
                const completed = habit.days.filter((day) => day.filled).length;
                const scheduledCount = habit.scheduledDays.length || 7;

                return (
                  <View key={habit.id} style={styles.habitRow}>
                    <View style={[styles.rowDot, { backgroundColor: habit.theme.accent }]} />
                    <Text style={[styles.habitRowTitle, { color: colors.text }]}>
                      {getHabitLabel(habit.titleKey, habit.title, t)}
                    </Text>
                    <Text style={[styles.habitRowMeta, { color: colors.textMuted }]}>
                      {completed}/{scheduledCount}
                    </Text>
                  </View>
                );
              })}
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
  screenTitle: {
    color: '#F5F5F7',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 104,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 20,
  },
  avatarWrap: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#F5F5F7',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroTitle: {
    color: '#F5F5F7',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.64)',
    fontSize: 14,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
  },
  metricValue: {
    color: '#F5F5F7',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
  },
  metricLabel: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12.5,
    fontWeight: '500',
  },
  featureCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureEyebrow: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  featureTitle: {
    marginTop: 2,
    color: '#F5F5F7',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  featureBody: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    color: '#F5F5F7',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginRight: 10,
  },
  habitRowTitle: {
    flex: 1,
    color: '#F5F5F7',
    fontSize: 14,
    fontWeight: '500',
  },
  habitRowMeta: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    fontWeight: '600',
  },
});
