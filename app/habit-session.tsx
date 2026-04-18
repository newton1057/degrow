import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTodayDayKey } from '@/constants/habits';
import { useHaptics } from '@/hooks/use-haptics';
import { useHabits } from '@/providers/habits-provider';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';
import {
  cancelHabitTimerNotification,
  scheduleHabitTimerNotification,
} from '@/services/local-notifications';

const SESSION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function HabitSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ habitId?: string | string[] }>();
  const { habits, completeHabitToday } = useHabits();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const haptics = useHaptics();
  const isLight = resolvedTheme === 'light';

  const habitId = Array.isArray(params.habitId) ? params.habitId[0] : params.habitId;
  const habit = habits.find((item) => item.id === habitId);
  const habitLabel = habit?.titleKey ? t(habit.titleKey) : habit?.title ?? t('timer.missingHabit');
  const alreadyCompletedToday = habit?.days.find((day) => day.key === getTodayDayKey())?.filled ?? false;

  const [selectedMinutes, setSelectedMinutes] = useState(habit?.targetMinutes ?? 10);
  const [remainingSeconds, setRemainingSeconds] = useState((habit?.targetMinutes ?? 10) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const completeTimer = useCallback(async () => {
    if (!habit || completedRef.current) {
      return;
    }

    completedRef.current = true;
    clearTimerInterval();
    setRemainingSeconds(0);
    setIsRunning(false);
    setHasStarted(true);
    setCompleted(true);
    setEndTimeMs(null);
    completeHabitToday(habit.id);
    await cancelHabitTimerNotification(habit.id);
    await haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
  }, [clearTimerInterval, completeHabitToday, habit, haptics]);

  const tick = useCallback(
    (targetEndTimeMs: number) => {
      const nextRemaining = Math.max(0, Math.ceil((targetEndTimeMs - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        void completeTimer();
      }
    },
    [completeTimer],
  );

  const startTimer = useCallback(async () => {
    if (!habit || remainingSeconds <= 0) {
      return;
    }

    const nextEndTimeMs = Date.now() + remainingSeconds * 1000;
    completedRef.current = false;
    clearTimerInterval();
    setHasStarted(true);
    setCompleted(false);
    setIsRunning(true);
    setEndTimeMs(nextEndTimeMs);
    intervalRef.current = setInterval(() => tick(nextEndTimeMs), 1000);

    await haptics.selectionAsync();
    await scheduleHabitTimerNotification({
      habitId: habit.id,
      seconds: remainingSeconds,
      copy: {
        title: t('notifications.timerCompleteTitle'),
        body: t('notifications.timerCompleteBody', { habit: habitLabel, minutes: String(selectedMinutes) }),
      },
    });
  }, [clearTimerInterval, habit, habitLabel, haptics, remainingSeconds, selectedMinutes, t, tick]);

  const pauseTimer = useCallback(async () => {
    if (!habit) {
      return;
    }

    clearTimerInterval();
    setIsRunning(false);
    setEndTimeMs(null);
    await cancelHabitTimerNotification(habit.id);
    await haptics.selectionAsync();
  }, [clearTimerInterval, habit, haptics]);

  const resetTimer = useCallback(async () => {
    if (!habit) {
      return;
    }

    clearTimerInterval();
    completedRef.current = false;
    setRemainingSeconds(selectedMinutes * 60);
    setIsRunning(false);
    setHasStarted(false);
    setCompleted(false);
    setEndTimeMs(null);
    await cancelHabitTimerNotification(habit.id);
    await haptics.selectionAsync();
  }, [clearTimerInterval, habit, haptics, selectedMinutes]);

  const finishEarly = useCallback(async () => {
    await completeTimer();
  }, [completeTimer]);

  useEffect(() => {
    if (!habit || hasStarted) {
      return;
    }

    const nextMinutes = habit.targetMinutes ?? 10;
    setSelectedMinutes(nextMinutes);
    setRemainingSeconds(nextMinutes * 60);
    setCompleted(alreadyCompletedToday);
    completedRef.current = alreadyCompletedToday;
  }, [alreadyCompletedToday, habit, hasStarted]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isRunning && endTimeMs) {
        tick(endTimeMs);
      }
    });

    return () => subscription.remove();
  }, [endTimeMs, isRunning, tick]);

  useEffect(() => () => clearTimerInterval(), [clearTimerInterval]);

  const updateSelectedMinutes = async (minutes: number) => {
    if (isRunning) {
      return;
    }

    completedRef.current = false;
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setHasStarted(false);
    setCompleted(false);

    if (habit) {
      await cancelHabitTimerNotification(habit.id);
    }

    await haptics.selectionAsync();
  };

  if (!habit) {
    return (
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <View style={styles.contentColumn}>
            <View style={styles.header}>
              <Pressable
                accessibilityLabel={t('timer.backToHabits')}
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Ionicons name="chevron-back" size={22} color={colors.icon} />
              </Pressable>
              <Text style={[styles.screenTitle, { color: colors.text }]}>{t('timer.title')}</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="timer-outline" size={36} color={colors.iconMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('timer.missingHabit')}</Text>
              <Pressable
                onPress={() => router.replace('/')}
                style={[styles.emptyButton, { backgroundColor: colors.text }]}>
                <Text style={[styles.emptyButtonText, { color: colors.background }]}>{t('timer.backToHabits')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / Math.max(1, selectedMinutes * 60)));
  const completedToday = completed || alreadyCompletedToday;
  const actionTitle = completedToday
    ? t('timer.completed')
    : isRunning
      ? t('timer.pause')
      : hasStarted
        ? t('timer.resume')
        : t('timer.start');
  const timerHint = completedToday
    ? t('timer.completedHint')
    : isRunning
      ? t('timer.runningHint')
      : hasStarted
        ? t('timer.pausedHint')
        : t('timer.readyHint');
  const iconColor = habit.theme.iconColor ?? (isLight ? '#FFFFFF' : '#F6F8FB');
  const accentForeground = habit.theme.onAccent ?? '#FFFFFF';
  const shadeStart = isLight ? `${habit.theme.iconBg}25` : habit.theme.gradientStart;
  const shadeMid = isLight ? `${habit.theme.iconBg}10` : habit.theme.gradientMid;
  const shadeEnd = isLight ? 'transparent' : habit.theme.gradientEnd;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel={t('timer.backToHabits')}
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </Pressable>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('timer.title')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: isLight ? colors.surface : '#050505',
                  borderColor: isLight ? colors.border : 'rgba(255,255,255,0.08)',
                },
              ]}>
              <View style={[styles.cardGlow, { backgroundColor: habit.theme.iconBg, opacity: isLight ? 0.08 : 0.18 }]} />
              <View style={[styles.cardShade, { backgroundColor: shadeStart }]} />
              <View style={[styles.cardShadeMid, { backgroundColor: shadeMid }]} />
              <View style={[styles.cardShadeRight, { backgroundColor: shadeEnd }]} />

              <View style={styles.heroContent}>
                <View style={[styles.iconBox, { backgroundColor: habit.theme.iconBg }]}>
                  <MaterialCommunityIcons name={habit.icon} size={22} color={iconColor} />
                </View>
                <View style={styles.heroTextWrap}>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>{habitLabel}</Text>
                  <Text style={[styles.heroSubtitle, { color: isLight ? colors.textMuted : 'rgba(255,255,255,0.66)' }]}>
                    {t('timer.subtitle')}
                  </Text>
                </View>
                <View style={[styles.targetPill, { backgroundColor: isLight ? colors.surfaceAlt : 'rgba(255,255,255,0.08)' }]}>
                  <Ionicons name="timer-outline" size={13} color={habit.theme.accent} />
                  <Text style={[styles.targetPillText, { color: habit.theme.accent }]}>
                    {t('timer.minutesLabel', { minutes: String(selectedMinutes) })}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.timerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.timerHeader}>
                <Text style={[styles.sectionEyebrow, { color: colors.textSoft }]}>{t('timer.setDuration')}</Text>
                {completedToday ? (
                  <View style={[styles.doneBadge, { backgroundColor: `${habit.theme.accent}22` }]}>
                    <Ionicons name="checkmark-circle" size={15} color={habit.theme.accent} />
                    <Text style={[styles.doneBadgeText, { color: habit.theme.accent }]}>{t('timer.completed')}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.optionsRow}>
                {SESSION_OPTIONS.map((minutes) => {
                  const isSelected = selectedMinutes === minutes;

                  return (
                    <Pressable
                      key={minutes}
                      disabled={isRunning}
                      onPress={() => void updateSelectedMinutes(minutes)}
                      style={[
                        styles.minuteChip,
                        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                        isSelected && { backgroundColor: habit.theme.accent, borderColor: habit.theme.accent },
                        isRunning && styles.disabledControl,
                      ]}>
                      <Text
                        style={[
                          styles.minuteChipText,
                          { color: colors.textSecondary },
                          isSelected && { color: accentForeground },
                        ]}>
                        {t('timer.minutesLabel', { minutes: String(minutes) })}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={[styles.timerPanel, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <View style={[styles.timerHalo, { backgroundColor: habit.theme.accent }]} />
                <Text style={[styles.timerValue, { color: colors.text }]}>{formatTimer(remainingSeconds)}</Text>
                <Text style={[styles.timerCaption, { color: colors.textMuted }]}>
                  {t('timer.target', { minutes: String(selectedMinutes) })}
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: isLight ? colors.surfaceMuted : 'rgba(255,255,255,0.08)' }]}>
                  <View style={[styles.progressFill, { backgroundColor: habit.theme.accent, width: `${progress * 100}%` }]} />
                </View>
                <Text style={[styles.timerHint, { color: colors.textSoft }]}>{timerHint}</Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  disabled={completedToday}
                  onPress={() => (isRunning ? void pauseTimer() : void startTimer())}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: completedToday ? colors.surfaceAlt : habit.theme.accent,
                      opacity: completedToday || pressed ? 0.74 : 1,
                    },
                  ]}>
                  <Ionicons
                    name={completedToday ? 'checkmark' : isRunning ? 'pause' : 'play'}
                    size={19}
                    color={completedToday ? colors.textMuted : accentForeground}
                  />
                  <Text style={[styles.primaryButtonText, { color: completedToday ? colors.textMuted : accentForeground }]}>
                    {actionTitle}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!hasStarted && !completed}
                  onPress={() => void resetTimer()}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: colors.border,
                      opacity: (!hasStarted && !completed) || pressed ? 0.58 : 1,
                    },
                  ]}>
                  <Ionicons name="refresh" size={18} color={colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('timer.reset')}</Text>
                </Pressable>
              </View>

              {hasStarted && !completedToday ? (
                <Pressable
                  onPress={() => void finishEarly()}
                  style={({ pressed }) => [styles.finishButton, pressed && { opacity: 0.68 }]}>
                  <Ionicons name="flag-outline" size={16} color={habit.theme.accent} />
                  <Text style={[styles.finishButtonText, { color: habit.theme.accent }]}>{t('timer.finish')}</Text>
                </Pressable>
              ) : null}
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
    color: '#F5F5F7',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 104,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: '#050505',
    overflow: 'hidden',
    padding: 16,
  },
  cardGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    left: -28,
    top: -42,
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
  heroContent: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    color: '#F5F5F7',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.35,
  },
  heroSubtitle: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.66)',
    fontSize: 12.5,
    lineHeight: 17,
  },
  targetPill: {
    height: 30,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
  },
  targetPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  timerCard: {
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: '#0C0C0D',
    padding: 18,
    gap: 16,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  doneBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  minuteChip: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 68,
  },
  minuteChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  disabledControl: {
    opacity: 0.54,
  },
  timerPanel: {
    borderRadius: 28,
    borderWidth: 1,
    minHeight: 214,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 22,
  },
  timerHalo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 999,
    opacity: 0.12,
    top: -70,
    right: -70,
  },
  timerValue: {
    color: '#F5F5F7',
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -3,
  },
  timerCaption: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  timerHint: {
    marginTop: 14,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
    maxWidth: 238,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    marginTop: 22,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1.22,
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  finishButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  emptyState: {
    flex: 1,
    minHeight: 280,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptyButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
