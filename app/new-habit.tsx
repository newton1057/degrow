import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { WEEK_DAY_KEYS } from '@/constants/habits';
import { useHabits } from '@/providers/habits-provider';
import { DEFAULT_HABIT_NAME_VALUES, useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

const previewDates = ['02', '03', '04', '05', '06', '07', '08'];
const REMINDER_DAY_MINUTES = 24 * 60;
const REMINDER_MINUTE_STEP = 15;

const iconOptions: (keyof typeof MaterialCommunityIcons.glyphMap)[] = [
  'book-open-page-variant-outline',
  'dumbbell',
  'silverware-fork-knife',
  'moon-waning-crescent',
  'leaf',
  'water-outline',
  'run',
  'bike',
  'heart-pulse',
  'target',
  'alarm-check',
  'notebook-outline',
];

const themeOptions = [
  {
    id: 'white',
    nameKey: 'newHabit.colors.white',
    isLight: true,
    iconBg: '#F3F3F5',
    iconColor: '#121315',
    accent: '#FFFFFF',
    dot: '#FFFFFF',
    onAccent: '#121315',
    gradientStart: 'rgba(72,72,76,0.92)',
    gradientMid: 'rgba(31,31,34,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'coral',
    nameKey: 'newHabit.colors.coral',
    iconBg: '#FF5F63',
    accent: '#FF6468',
    gradientStart: 'rgba(92,26,30,0.88)',
    gradientMid: 'rgba(33,11,13,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'orange',
    nameKey: 'newHabit.colors.orange',
    iconBg: '#FF8A47',
    accent: '#FF8A47',
    gradientStart: 'rgba(92,46,18,0.88)',
    gradientMid: 'rgba(34,18,7,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'yellow',
    nameKey: 'newHabit.colors.yellow',
    iconBg: '#F8C742',
    accent: '#FFD14B',
    gradientStart: 'rgba(94,76,18,0.88)',
    gradientMid: 'rgba(35,28,8,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'mint',
    nameKey: 'newHabit.colors.mint',
    iconBg: '#43C977',
    accent: '#43C977',
    gradientStart: 'rgba(16,72,41,0.90)',
    gradientMid: 'rgba(8,27,16,0.93)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'blue',
    nameKey: 'newHabit.colors.blue',
    iconBg: '#5DA8E8',
    accent: '#78BDF7',
    gradientStart: 'rgba(23,60,96,0.88)',
    gradientMid: 'rgba(8,19,34,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'purple',
    nameKey: 'newHabit.colors.purple',
    iconBg: '#9B6DE5',
    accent: '#A06EF0',
    gradientStart: 'rgba(55,28,84,0.90)',
    gradientMid: 'rgba(21,10,33,0.93)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'gold',
    nameKey: 'newHabit.colors.gold',
    iconBg: '#D2A12C',
    accent: '#D8AA38',
    gradientStart: 'rgba(73,52,16,0.88)',
    gradientMid: 'rgba(28,20,6,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'rose',
    nameKey: 'newHabit.colors.rose',
    iconBg: '#D86C8E',
    accent: '#E784A3',
    gradientStart: 'rgba(79,23,39,0.88)',
    gradientMid: 'rgba(31,10,18,0.92)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'green',
    nameKey: 'newHabit.colors.green',
    iconBg: '#1FA052',
    accent: '#2DB860',
    gradientStart: 'rgba(12,63,31,0.90)',
    gradientMid: 'rgba(7,24,12,0.93)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'pink',
    nameKey: 'newHabit.colors.pink',
    iconBg: '#F178B6',
    accent: '#F47CBD',
    gradientStart: 'rgba(86,28,58,0.90)',
    gradientMid: 'rgba(33,10,21,0.93)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
  {
    id: 'teal',
    nameKey: 'newHabit.colors.teal',
    iconBg: '#22B8C9',
    accent: '#2CC7D9',
    gradientStart: 'rgba(10,72,78,0.90)',
    gradientMid: 'rgba(6,27,30,0.93)',
    gradientEnd: 'rgba(0,0,0,0.96)',
  },
];

function Section({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionEyebrow, { color: colors.textSoft }]}>{eyebrow}</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function getReminderParts(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hour = hours24 % 12 || 12;

  return {
    hour: String(hour),
    minute: String(minutes).padStart(2, '0'),
    period,
  };
}

export default function NewHabitScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { addHabit } = useHabits();
  const defaultHabitName = t('newHabit.defaults.habitName');
  const [habitName, setHabitName] = useState(DEFAULT_HABIT_NAME_VALUES[0]);
  const [selectedIcon, setSelectedIcon] =
    useState<keyof typeof MaterialCommunityIcons.glyphMap>('book-open-page-variant-outline');
  const [selectedThemeId, setSelectedThemeId] = useState('blue');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderSheetVisible, setReminderSheetVisible] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(19 * 60);
  const [selectedDays, setSelectedDays] = useState([true, false, true, true, false, true, false]);

  const selectedTheme = themeOptions.find((theme) => theme.id === selectedThemeId) ?? themeOptions[0];
  const accentForeground = selectedTheme.onAccent ?? '#F6F9FE';
  const previewIconColor = selectedTheme.iconColor ?? '#F7F8FB';
  const reminderParts = getReminderParts(reminderMinutes);
  const selectedScheduledDays = WEEK_DAY_KEYS.filter((_, index) => selectedDays[index]);
  const canCreateHabit = habitName.trim().length > 0 && selectedScheduledDays.length > 0;
  const selectedIconChoiceBg = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(17,19,21,0.05)';
  const reminderTimeLabel = `${reminderParts.hour}:${reminderParts.minute} ${t(
    `newHabit.time.${reminderParts.period.toLowerCase()}`
  )}`;

  useEffect(() => {
    setHabitName((current) => (DEFAULT_HABIT_NAME_VALUES.includes(current) ? defaultHabitName : current));
  }, [defaultHabitName]);

  const toggleDay = (index: number) => {
    setSelectedDays((current) => current.map((value, currentIndex) => (currentIndex === index ? !value : value)));
  };

  const shiftReminderTime = (delta: number) => {
    setReminderMinutes((current) => (current + delta + REMINDER_DAY_MINUTES) % REMINDER_DAY_MINUTES);
  };

  const setReminderPeriod = (period: 'AM' | 'PM') => {
    setReminderMinutes((current) => {
      const isPm = current >= 12 * 60;

      if ((period === 'PM') === isPm) {
        return current;
      }

      return (current + 12 * 60) % REMINDER_DAY_MINUTES;
    });
  };

  const handleReminderToggle = (value: boolean) => {
    setReminderEnabled(value);

    if (!value) {
      setReminderSheetVisible(false);
    }
  };

  const handleCreateHabit = () => {
    if (!canCreateHabit) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    addHabit({
      title: habitName.trim(),
      icon: selectedIcon,
      theme: {
        iconBg: selectedTheme.iconBg,
        iconColor: selectedTheme.iconColor,
        accent: selectedTheme.accent,
        onAccent: selectedTheme.onAccent,
        gradientStart: selectedTheme.gradientStart,
        gradientMid: selectedTheme.gradientMid,
        gradientEnd: selectedTheme.gradientEnd,
      },
      completionVariant: selectedTheme.isLight ? 'light' : 'dark',
      scheduledDays: selectedScheduledDays,
      reminderEnabled,
      reminderMinutes,
    });

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

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
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('newHabit.title')}</Text>
            <Pressable style={styles.headerActionGhost}>
              <Text style={[styles.headerActionGhostText, { color: colors.textSoft }]}>{t('newHabit.draft')}</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.previewCard}>
              <View style={[styles.previewGlow, { backgroundColor: selectedTheme.iconBg }]} />
              <View style={[styles.previewShade, { backgroundColor: selectedTheme.gradientStart }]} />
              <View style={[styles.previewShadeMid, { backgroundColor: selectedTheme.gradientMid }]} />
              <View style={[styles.previewShadeRight, { backgroundColor: selectedTheme.gradientEnd }]} />

              <View style={styles.previewMain}>
                <View style={styles.previewTitleRow}>
                  <View style={[styles.previewIconBox, { backgroundColor: selectedTheme.iconBg }]}>
                    <MaterialCommunityIcons name={selectedIcon} size={18} color={previewIconColor} />
                  </View>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {habitName.trim() || t('newHabit.previewFallback')}
                  </Text>
                </View>

                <View style={styles.previewWeekdayRow}>
                  {WEEK_DAY_KEYS.map((weekday) => (
                    <Text key={weekday} style={styles.previewWeekdayLabel}>
                      {t(`daysShort.${weekday}`)}
                    </Text>
                  ))}
                </View>

                <View style={styles.previewDaysRow}>
                  {previewDates.map((date, index) => {
                    const filled = selectedDays[index];

                    return (
                      <View
                        key={`${date}-${WEEK_DAY_KEYS[index]}`}
                        style={[
                          styles.previewDayCircle,
                          {
                            backgroundColor: filled ? selectedTheme.accent : 'transparent',
                            borderColor: selectedTheme.accent,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.previewDayText,
                            { color: filled ? accentForeground : 'rgba(255,255,255,0.84)' },
                          ]}>
                          {date}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            <Section eyebrow={t('newHabit.sections.identityEyebrow')} title={t('newHabit.sections.habitBasics')}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('newHabit.labels.habitName')}</Text>
              <TextInput
                value={habitName}
                onChangeText={setHabitName}
                placeholder={t('newHabit.placeholders.habitName')}
                placeholderTextColor={colors.textDim}
                style={[styles.textInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              />

              <Text style={[styles.fieldLabel, styles.fieldSpacer, { color: colors.text }]}>{t('newHabit.labels.icon')}</Text>
              <View style={styles.iconGrid}>
                {iconOptions.map((icon) => {
                  const isSelected = selectedIcon === icon;

                  return (
                    <Pressable
                      key={icon}
                      onPress={() => setSelectedIcon(icon)}
                      style={[
                        styles.iconChoice,
                        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                        isSelected && { borderColor: selectedTheme.accent, backgroundColor: selectedIconChoiceBg },
                      ]}>
                      <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={isSelected ? selectedTheme.accent : colors.textSecondary}
                      />
                    </Pressable>
                  );
                })}
              </View>
              
              <Text style={[styles.fieldLabel, styles.fieldSpacer, { color: colors.text }]}>{t('newHabit.labels.cardColor')}</Text>
              <View style={styles.colorPickerWrap}>
                {themeOptions.map((theme) => {
                  const isSelected = theme.id === selectedThemeId;

                  return (
                    <Pressable
                      key={theme.id}
                      onPress={() => setSelectedThemeId(theme.id)}
                      accessibilityLabel={t(theme.nameKey)}
                      style={styles.colorChipCell}>
                      <View
                      style={[
                        styles.colorChipOuter,
                        isSelected && [styles.colorChipOuterSelected, { borderColor: colors.text }],
                      ]}>
                        <View
                          style={[
                            styles.colorChipInner,
                            theme.isLight && styles.colorChipInnerLight,
                            { backgroundColor: theme.dot ?? theme.accent },
                          ]}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Section>

            <Section eyebrow={t('newHabit.sections.scheduleEyebrow')} title={t('newHabit.sections.repeatPattern')}>
              <View style={styles.daysToggleRow}>
                {WEEK_DAY_KEYS.map((day, index) => {
                  const active = selectedDays[index];

                  return (
                    <Pressable
                      key={day}
                      onPress={() => toggleDay(index)}
                      style={[
                        styles.dayToggle,
                        { backgroundColor: colors.surfaceAlt, borderColor: colors.borderStrong },
                        active && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent },
                      ]}>
                      <Text style={[styles.dayToggleText, { color: colors.textSecondary }, active && { color: accentForeground }]}>
                        {t(`daysShort.${day}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.reminderRow}>
                <View style={styles.reminderTextWrap}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{t('newHabit.labels.dailyReminder')}</Text>
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                    {reminderEnabled
                      ? t('newHabit.reminder.onDescription', { time: reminderTimeLabel })
                      : t('newHabit.reminder.offDescription')}
                  </Text>
                </View>
                <View style={styles.reminderControls}>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={handleReminderToggle}
                    thumbColor={reminderEnabled ? '#F7F7F8' : colors.switchFalseThumb}
                    trackColor={{ false: colors.switchFalseTrack, true: selectedTheme.accent }}
                    ios_backgroundColor={colors.switchFalseTrack}
                  />
                </View>
              </View>

              {reminderEnabled ? (
                <Pressable
                  onPress={() => setReminderSheetVisible(true)}
                  style={[styles.reminderTimeTrigger, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <View>
                    <Text style={[styles.reminderTimeTriggerLabel, { color: colors.text }]}>
                      {t('newHabit.labels.reminderTime')}
                    </Text>
                    <Text style={[styles.reminderTimeTriggerHint, { color: colors.textSoft }]}>
                      {t('newHabit.reminder.timeHint')}
                    </Text>
                  </View>
                  <View style={styles.reminderTimeTriggerMeta}>
                    <Text style={[styles.reminderTimeTriggerValue, { color: selectedTheme.accent }]}>{reminderTimeLabel}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
                  </View>
                </Pressable>
              ) : null}
            </Section>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => router.back()}
                style={[styles.secondaryButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('newHabit.buttons.cancel')}</Text>
              </Pressable>
              <Pressable
                disabled={!canCreateHabit}
                onPress={handleCreateHabit}
                style={[
                  styles.primaryButton,
                  { backgroundColor: selectedTheme.accent },
                  !canCreateHabit && styles.primaryButtonDisabled,
                ]}>
                <Text style={styles.primaryButtonText}>{t('newHabit.buttons.createHabit')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={reminderSheetVisible}
        onRequestClose={() => setReminderSheetVisible(false)}>
        <View style={[styles.bottomSheetBackdrop, { backgroundColor: colors.overlay }]}>
          <Pressable style={styles.bottomSheetDismissArea} onPress={() => setReminderSheetVisible(false)} />
          <View style={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.textDim }]} />

            <View style={styles.bottomSheetHeader}>
              <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>{t('newHabit.reminder.bottomSheetTitle')}</Text>
              <Text style={[styles.bottomSheetSubtitle, { color: colors.textMuted }]}>
                {t('newHabit.reminder.bottomSheetSubtitle')}
              </Text>
            </View>

            <View style={styles.reminderTimeControls}>
              <View style={styles.timeUnit}>
                <Pressable
                  onPress={() => shiftReminderTime(-60)}
                  style={[styles.timeStepButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="chevron-up" size={15} color={colors.icon} />
                </Pressable>
                <View style={[styles.timeValueChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Text style={[styles.timeValueText, { color: colors.text }]}>{reminderParts.hour}</Text>
                </View>
                <Pressable
                  onPress={() => shiftReminderTime(60)}
                  style={[styles.timeStepButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="chevron-down" size={15} color={colors.icon} />
                </Pressable>
                <Text style={[styles.timeUnitCaption, { color: colors.textSoft }]}>{t('newHabit.time.hour')}</Text>
              </View>

              <Text style={[styles.timeSeparator, { color: colors.textMuted }]}>:</Text>

              <View style={styles.timeUnit}>
                <Pressable
                  onPress={() => shiftReminderTime(-REMINDER_MINUTE_STEP)}
                  style={[styles.timeStepButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="chevron-up" size={15} color={colors.icon} />
                </Pressable>
                <View style={[styles.timeValueChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Text style={[styles.timeValueText, { color: colors.text }]}>{reminderParts.minute}</Text>
                </View>
                <Pressable
                  onPress={() => shiftReminderTime(REMINDER_MINUTE_STEP)}
                  style={[styles.timeStepButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Ionicons name="chevron-down" size={15} color={colors.icon} />
                </Pressable>
                <Text style={[styles.timeUnitCaption, { color: colors.textSoft }]}>{t('newHabit.time.minute')}</Text>
              </View>

              <View style={styles.periodToggle}>
                {(['AM', 'PM'] as const).map((period) => {
                  const active = reminderParts.period === period;

                  return (
                    <Pressable
                      key={period}
                      onPress={() => setReminderPeriod(period)}
                      style={[
                        styles.periodChip,
                        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                        active && { backgroundColor: selectedTheme.accent, borderColor: selectedTheme.accent },
                      ]}>
                      <Text style={[styles.periodChipText, { color: colors.textSecondary }, active && { color: accentForeground }]}>
                        {t(`newHabit.time.${period.toLowerCase()}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.bottomSheetActions}>
              <Pressable
                onPress={() => setReminderSheetVisible(false)}
                style={[styles.bottomSheetSecondaryButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <Text style={[styles.bottomSheetSecondaryText, { color: colors.text }]}>{t('newHabit.buttons.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setReminderSheetVisible(false)}
                style={[styles.bottomSheetPrimaryButton, { backgroundColor: selectedTheme.accent }]}>
                <Text style={[styles.bottomSheetPrimaryText, { color: accentForeground }]}>
                  {t('newHabit.buttons.done')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  screenTitle: {
    color: '#F5F5F7',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  headerActionGhost: {
    minWidth: 42,
    alignItems: 'flex-end',
  },
  headerActionGhostText: {
    color: 'rgba(255,255,255,0.46)',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 44,
  },
  previewCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#050505',
    paddingHorizontal: 14,
    paddingVertical: 13,
    overflow: 'hidden',
  },
  previewGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 999,
    left: -20,
    top: -34,
    opacity: 0.18,
  },
  previewShade: {
    position: 'absolute',
    left: -18,
    top: -10,
    bottom: -10,
    width: '58%',
    opacity: 0.78,
    transform: [{ skewX: '-12deg' }],
  },
  previewShadeMid: {
    position: 'absolute',
    left: '38%',
    top: -6,
    bottom: -6,
    width: '26%',
    opacity: 0.46,
    transform: [{ skewX: '-10deg' }],
  },
  previewShadeRight: {
    position: 'absolute',
    right: -8,
    top: 0,
    bottom: 0,
    width: '36%',
    opacity: 0.66,
  },
  previewMain: {
    zIndex: 2,
    gap: 7,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewIconBox: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    flex: 1,
    color: '#F5F5F7',
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: -0.24,
  },
  previewWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewWeekdayLabel: {
    color: 'rgba(255,255,255,0.72)',
    width: 29,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '500',
  },
  previewDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewDayCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDayText: {
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: -0.1,
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
  fieldLabel: {
    color: '#F5F5F7',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldSpacer: {
    marginTop: 18,
  },
  textInput: {
    marginTop: 10,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#111113',
    color: '#F5F5F7',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  iconGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  iconChoice: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayToggle: {
    width: '13.15%',
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToggleText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '600',
  },
  reminderRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reminderControls: {
    alignItems: 'center',
  },
  reminderTextWrap: {
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
  reminderTimeTrigger: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111113',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reminderTimeTriggerLabel: {
    color: '#F5F5F7',
    fontSize: 13.5,
    fontWeight: '600',
  },
  reminderTimeTriggerHint: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 12.5,
    lineHeight: 17,
  },
  reminderTimeTriggerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderTimeTriggerValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'flex-end',
  },
  bottomSheetDismissArea: {
    flex: 1,
  },
  bottomSheetPanel: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111113',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 18,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bottomSheetHeader: {
    gap: 4,
  },
  bottomSheetTitle: {
    color: '#F5F5F7',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bottomSheetSubtitle: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  reminderTimeControls: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeUnit: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  timeStepButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#17171A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValueChip: {
    minWidth: 58,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#17171A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  timeValueText: {
    color: '#F5F5F7',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  timeUnitCaption: {
    color: 'rgba(255,255,255,0.46)',
    fontSize: 11.5,
    fontWeight: '600',
  },
  timeSeparator: {
    marginTop: 34,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 22,
    fontWeight: '700',
  },
  periodToggle: {
    gap: 8,
    paddingTop: 1,
  },
  periodChip: {
    minWidth: 58,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#17171A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  periodChipText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  bottomSheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomSheetSecondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#17171A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetSecondaryText: {
    color: '#F5F5F7',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSheetPrimaryButton: {
    flex: 1.15,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  colorPickerWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  colorChipCell: {
    width: '16.66%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChipOuter: {
    width: 48,
    height: 48,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChipOuterSelected: {
    borderColor: '#F5F5F7',
  },
  colorChipInner: {
    width: 32,
    height: 32,
    borderRadius: 999,
  },
  colorChipInnerLight: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#F5F5F7',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1.2,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#041018',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
