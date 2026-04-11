import { StatusBar } from 'expo-status-bar';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WEEK_DAY_KEYS, getTodayDayKey, type HabitItem } from '@/constants/habits';

import { TabBarBlurUnderlay } from '@/components/tab-bar-blur-underlay';
import { useHabits } from '@/providers/habits-provider';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

function getHabitLabel(habit: HabitItem, t: (key: string) => string) {
  return habit.titleKey ? t(habit.titleKey) : habit.title ?? t('newHabit.previewFallback');
}

function DayCircle({
  day,
  filled,
  accent,
  filledTextColor,
  emptyTextColor,
  onPress,
  disabled,
}: {
  day: string;
  filled: boolean;
  accent: string;
  filledTextColor: string;
  emptyTextColor: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.dayCircle,
        {
          borderColor: accent,
          backgroundColor: filled ? accent : 'transparent',
        },
        disabled && styles.dayCircleDisabled,
      ]}>
      <Text style={[styles.dayText, { color: filled ? filledTextColor : emptyTextColor }]}>{day}</Text>
    </Pressable>
  );
}

function HabitCard({
  habit,
  onToggleToday,
  onToggleDay,
  onOpenTimer,
}: {
  habit: HabitItem;
  onToggleToday: (habitId: string) => void;
  onToggleDay: (habitId: string, dayKey: (typeof WEEK_DAY_KEYS)[number]) => void;
  onOpenTimer: (habitId: string) => void;
}) {
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const todayKey = getTodayDayKey();
  const todayEntry = habit.days.find((day) => day.key === todayKey);
  const isScheduledToday = habit.scheduledDays.includes(todayKey);
  const isCompletedToday = todayEntry?.filled ?? false;
  const habitLabel = getHabitLabel(habit, t);
  const isLight = resolvedTheme === 'light';

  const iconColor = habit.theme.iconColor ?? (isLight ? '#FFFFFF' : '#F6F8FB');
  const filledTextColor = habit.theme.onAccent ?? (isLight ? '#FFFFFF' : '#EAF4FD');
  const hasWhiteAccent = habit.theme.accent.toUpperCase() === '#FFFFFF';
  const completedCheckColor = hasWhiteAccent ? (isLight ? colors.text : '#121315') : habit.theme.accent;
  
  const completionBg = isCompletedToday 
    ? (isLight ? (hasWhiteAccent ? colors.surface : `${habit.theme.accent}1F`) : '#FFFFFF')
    : isScheduledToday 
      ? (isLight ? colors.surfaceAlt : '#151517') 
      : (isLight ? colors.surface : '#111113');
      
  const checkColor = isCompletedToday
    ? completedCheckColor
    : isScheduledToday
      ? (isLight ? colors.textSoft : '#F3F3F4')
      : (isLight ? colors.border : 'rgba(255,255,255,0.32)');
      
  const completionBorder = isCompletedToday
    ? (isLight ? (hasWhiteAccent ? colors.borderStrong : `${habit.theme.accent}80`) : 'rgba(255,255,255,0.12)')
    : isScheduledToday
      ? habit.theme.accent
      : (isLight ? colors.border : 'rgba(255,255,255,0.06)');

  // Dynamic light mode gradient fallbacks
  const shadeStart = isLight ? `${habit.theme.iconBg}25` : habit.theme.gradientStart;
  const shadeMid = isLight ? `${habit.theme.iconBg}10` : habit.theme.gradientMid;
  const shadeEnd = isLight ? 'transparent' : habit.theme.gradientEnd;

  return (
    <View style={styles.cardWrap}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isLight ? colors.surface : '#050505',
            borderColor: isLight ? colors.border : 'rgba(255,255,255,0.08)',
          },
        ]}>
        <View style={[styles.cardGlow, { backgroundColor: habit.theme.iconBg, opacity: isLight ? 0.08 : 0.18 }]} />
        <View style={[styles.cardShade, { backgroundColor: shadeStart }]} />
        <View style={[styles.cardShadeMid, { backgroundColor: shadeMid }]} />
        <View style={[styles.cardShadeRight, { backgroundColor: shadeEnd }]} />

        <View style={styles.cardMain}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: habit.theme.iconBg }]}>
              <MaterialCommunityIcons name={habit.icon} size={18} color={iconColor} />
            </View>
            <Text style={[styles.habitTitle, { color: colors.text }]}>{habitLabel}</Text>
            <Pressable
              onPress={() => onOpenTimer(habit.id)}
              style={[
                styles.timerPill,
                { backgroundColor: isLight ? colors.surfaceAlt : 'rgba(255,255,255,0.08)' },
              ]}>
              <Ionicons name="timer-outline" size={13} color={habit.theme.accent} />
              <Text style={[styles.timerPillText, { color: habit.theme.accent }]}>{habit.targetMinutes}m</Text>
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEK_DAY_KEYS.map((weekday) => (
              <Text key={weekday} style={[styles.weekdayLabel, { color: isLight ? colors.textMuted : 'rgba(255,255,255,0.72)' }]}>
                {t(`daysShort.${weekday}`)}
              </Text>
            ))}
          </View>

          <View style={styles.daysRow}>
            {habit.days.map((day) => (
              <DayCircle
                key={`${habit.id}-${day.key}-${day.day}`}
                day={day.day}
                filled={day.filled}
                accent={habit.theme.accent}
                filledTextColor={filledTextColor}
                emptyTextColor={isLight ? colors.textMuted : 'rgba(255,255,255,0.84)'}
                disabled={!habit.scheduledDays.includes(day.key)}
                onPress={() => onToggleDay(habit.id, day.key)}
              />
            ))}
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => onToggleToday(habit.id)}
        style={[styles.completionButton, { backgroundColor: completionBg, borderColor: completionBorder }]}>
        <Ionicons name={isScheduledToday ? 'checkmark' : 'remove'} size={25} color={checkColor} />
      </Pressable>
    </View>
  );
}

export default function DeGrowScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { habits, toggleHabitDay, toggleHabitToday } = useHabits();
  const todayKey = getTodayDayKey();

  const completedTodayCount = habits.filter((habit) => habit.days.find((day) => day.key === todayKey)?.filled).length;
  const activeHabitsCount = habits.length;
  const bestRun = Math.max(
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

  const handleToggleToday = (habitId: string) => {
    const didToggle = toggleHabitToday(habitId);

    if (didToggle) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleDay = (habitId: string, dayKey: (typeof WEEK_DAY_KEYS)[number]) => {
    const didToggle = toggleHabitDay(habitId, dayKey);

    if (didToggle) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOpenTimer = (habitId: string) => {
    void Haptics.selectionAsync();
    router.push({ pathname: '/habit-session', params: { habitId } } as unknown as Href);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('appName')}</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/settings')} style={styles.iconAction}>
                <Ionicons name="settings-outline" size={23} color={colors.icon} />
              </Pressable>
              <Pressable onPress={() => router.push('/new-habit')} style={styles.iconAction}>
                <Ionicons name="add" size={30} color={colors.icon} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>{t('home.pulseTitle')}</Text>
                <Text style={[styles.summarySubtitle, { color: colors.textMuted }]}>{t('home.pulseSubtitle')}</Text>
              </View>
              <View style={styles.summaryMetrics}>
                <View style={[styles.summaryMetric, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.summaryMetricValue, { color: colors.text }]}>{activeHabitsCount}</Text>
                  <Text style={[styles.summaryMetricLabel, { color: colors.textMuted }]}>{t('home.activeHabits')}</Text>
                </View>
                <View style={[styles.summaryMetric, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.summaryMetricValue, { color: colors.text }]}>{completedTodayCount}</Text>
                  <Text style={[styles.summaryMetricLabel, { color: colors.textMuted }]}>
                    {t('home.completedToday')}
                  </Text>
                </View>
                <View style={[styles.summaryMetric, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.summaryMetricValue, { color: colors.text }]}>{bestRun}</Text>
                  <Text style={[styles.summaryMetricLabel, { color: colors.textMuted }]}>{t('home.bestRun')}</Text>
                </View>
              </View>
            </View>

            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleToday={handleToggleToday}
                onToggleDay={handleToggleDay}
                onOpenTimer={handleOpenTimer}
              />
            ))}
          </ScrollView>
        </View>
        <TabBarBlurUnderlay />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 160,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 16,
    gap: 14,
  },
  summaryHeader: {
    gap: 4,
  },
  summaryTitle: {
    color: '#F5F5F7',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  summarySubtitle: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  summaryMetrics: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryMetric: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#121214',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  summaryMetricValue: {
    color: '#F5F5F7',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  summaryMetricLabel: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 11.5,
    fontWeight: '600',
  },
  cardWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 21,
    paddingHorizontal: 14,
    paddingVertical: 13,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 999,
    left: -20,
    top: -34,
    opacity: 0.18,
  },
  cardShade: {
    position: 'absolute',
    left: -18,
    top: -10,
    bottom: -10,
    width: '58%',
    opacity: 0.78,
    transform: [{ skewX: '-12deg' }],
  },
  cardShadeMid: {
    position: 'absolute',
    left: '38%',
    top: -6,
    bottom: -6,
    width: '26%',
    opacity: 0.46,
    transform: [{ skewX: '-10deg' }],
  },
  cardShadeRight: {
    position: 'absolute',
    right: -8,
    top: 0,
    bottom: 0,
    width: '36%',
    opacity: 0.66,
  },
  cardMain: {
    zIndex: 2,
    gap: 7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    color: '#F5F5F7',
    flex: 1,
    flexShrink: 1,
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.24,
  },
  timerPill: {
    height: 26,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  timerPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayLabel: {
    color: 'rgba(255,255,255,0.72)',
    width: 29,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  dayCircleDisabled: {
    opacity: 0.5,
  },
  completionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
