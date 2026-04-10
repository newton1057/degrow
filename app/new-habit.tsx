import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';


import { WEEK_DAY_KEYS } from '@/constants/habits';
import { useHabits } from '@/providers/habits-provider';
import { DEFAULT_HABIT_NAME_VALUES, useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

const previewDates = ['02', '03', '04', '05', '06', '07', '08'];
const REMINDER_DAY_MINUTES = 24 * 60;

const WHEEL_ITEM_HEIGHT = 50;
const WHEEL_VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;

const HOURS_DATA = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
const MINUTES_DATA = Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: String(i * 5).padStart(2, '0') }));
const PERIOD_DATA = [{ value: 'AM' as const, label: 'a.m.' }, { value: 'PM' as const, label: 'p.m.' }];

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

/* ─── iOS-style scroll wheel column ─── */

type WheelItem<T> = { value: T; label: string };

function WheelColumn<T extends string | number>({
  data,
  selectedValue,
  onValueChange,
  textColor,
  accentColor,
}: {
  data: WheelItem<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  textColor: string;
  accentColor: string;
}) {
  const flatListRef = useRef<FlatList>(null);
  const lastSnappedIndex = useRef(-1);
  const isUserScrolling = useRef(false);

  const selectedIndex = data.findIndex((item) => item.value === selectedValue);
  const paddingItems = Math.floor(WHEEL_VISIBLE_ITEMS / 2);

  // Build the padded list: empty items at top/bottom so items can scroll to center
  const paddedData: (WheelItem<T> | null)[] = [
    ...Array(paddingItems).fill(null),
    ...data,
    ...Array(paddingItems).fill(null),
  ];

  // Scroll to current value on mount and when selectedValue changes externally
  useEffect(() => {
    if (selectedIndex >= 0 && !isUserScrolling.current) {
      const offset = selectedIndex * WHEEL_ITEM_HEIGHT;
      flatListRef.current?.scrollToOffset({ offset, animated: false });
      lastSnappedIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isUserScrolling.current = false;
      const offsetY = event.nativeEvent.contentOffset.y;
      let index = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
      index = Math.max(0, Math.min(index, data.length - 1));

      if (index !== lastSnappedIndex.current) {
        lastSnappedIndex.current = index;
        onValueChange(data[index].value);
        void Haptics.selectionAsync();
      }
    },
    [data, onValueChange],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: WHEEL_ITEM_HEIGHT,
      offset: WHEEL_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: WheelItem<T> | null; index: number }) => {
      if (!item) {
        return <View style={{ height: WHEEL_ITEM_HEIGHT }} />;
      }
      const dataIndex = index - paddingItems;
      const isSelected = dataIndex === selectedIndex;

      return (
        <View style={[wheelStyles.item, { height: WHEEL_ITEM_HEIGHT }]}>
          <Text
            style={[
              wheelStyles.itemText,
              { color: isSelected ? accentColor : textColor },
              isSelected && wheelStyles.itemTextSelected,
              !isSelected && wheelStyles.itemTextDimmed,
            ]}>
            {item.label}
          </Text>
        </View>
      );
    },
    [selectedIndex, accentColor, textColor, paddingItems],
  );

  const keyExtractor = useCallback(
    (item: WheelItem<T> | null, index: number) =>
      item ? `${item.value}` : `pad-${index}`,
    [],
  );

  return (
    <View style={[wheelStyles.column, { height: WHEEL_HEIGHT }]}>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled
      />
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  column: {
    flex: 1,
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  itemTextSelected: {
    fontWeight: '600',
  },
  itemTextDimmed: {
    opacity: 0.4,
  },
});

/* ─── Section component ─── */

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
  const [habitName, setHabitName] = useState<string>(DEFAULT_HABIT_NAME_VALUES[0]);
  const [selectedIcon, setSelectedIcon] =
    useState<keyof typeof MaterialCommunityIcons.glyphMap>('book-open-page-variant-outline');
  const [selectedThemeId, setSelectedThemeId] = useState('blue');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(19 * 60);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['52%'], []);
  const [selectedDays, setSelectedDays] = useState([true, false, true, true, false, true, false]);

  const selectedTheme = themeOptions.find((theme) => theme.id === selectedThemeId) ?? themeOptions[0];
  const accentForeground = selectedTheme.onAccent ?? '#F6F9FE';
  const isLight = resolvedTheme === 'light';
  const previewIconColor = selectedTheme.iconColor ?? (isLight ? '#FFFFFF' : '#F7F8FB');
  const previewFilledTextColor = selectedTheme.onAccent ?? (isLight ? '#FFFFFF' : '#EAF4FD');
  const previewEmptyTextColor = isLight ? colors.textMuted : 'rgba(255,255,255,0.84)';
  
  const shadeStart = isLight ? `${selectedTheme.iconBg}25` : selectedTheme.gradientStart;
  const shadeMid = isLight ? `${selectedTheme.iconBg}10` : selectedTheme.gradientMid;
  const shadeEnd = isLight ? 'transparent' : selectedTheme.gradientEnd;
  const reminderParts = getReminderParts(reminderMinutes);
  const selectedScheduledDays = WEEK_DAY_KEYS.filter((_, index) => selectedDays[index]);
  const canCreateHabit = habitName.trim().length > 0 && selectedScheduledDays.length > 0;
  const selectedIconChoiceBg = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(17,19,21,0.05)';
  const reminderTimeLabel = `${reminderParts.hour}:${reminderParts.minute} ${t(
    `newHabit.time.${reminderParts.period.toLowerCase()}`
  )}`;

  // Wheel-local state: work on copies until confirmed
  const [wheelHour, setWheelHour] = useState(0);
  const [wheelMinute, setWheelMinute] = useState(0);
  const [wheelPeriod, setWheelPeriod] = useState<'AM' | 'PM'>('AM');

  const openReminderSheet = useCallback(() => {
    const parts = getReminderParts(reminderMinutes);
    setWheelHour(Number(parts.hour));
    const rawMin = reminderMinutes % 60;
    setWheelMinute(Math.round(rawMin / 5) * 5 % 60);
    setWheelPeriod(parts.period as 'AM' | 'PM');
    bottomSheetRef.current?.present();
  }, [reminderMinutes]);

  const closeReminderSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" opacity={0.6} />
    ),
    [],
  );

  const confirmWheelTime = useCallback(() => {
    let hours24 = wheelHour % 12;
    if (wheelPeriod === 'PM') hours24 += 12;
    setReminderMinutes(hours24 * 60 + wheelMinute);
    bottomSheetRef.current?.dismiss();
  }, [wheelHour, wheelMinute, wheelPeriod]);

  useEffect(() => {
    setHabitName((current) => (DEFAULT_HABIT_NAME_VALUES.includes(current as typeof DEFAULT_HABIT_NAME_VALUES[number]) ? defaultHabitName : current));
  }, [defaultHabitName]);

  const toggleDay = (index: number) => {
    setSelectedDays((current) => current.map((value, currentIndex) => (currentIndex === index ? !value : value)));
  };

  const handleReminderToggle = (value: boolean) => {
    setReminderEnabled(value);

    if (!value) {
      bottomSheetRef.current?.dismiss();
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
            <View style={[
              styles.previewCard,
              {
                backgroundColor: isLight ? colors.surface : '#050505',
                borderColor: isLight ? colors.border : 'rgba(255,255,255,0.08)',
              }
            ]}>
              <View style={[styles.previewGlow, { backgroundColor: selectedTheme.iconBg, opacity: isLight ? 0.08 : 0.18 }]} />
              <View style={[styles.previewShade, { backgroundColor: shadeStart }]} />
              <View style={[styles.previewShadeMid, { backgroundColor: shadeMid }]} />
              <View style={[styles.previewShadeRight, { backgroundColor: shadeEnd }]} />

              <View style={styles.previewMain}>
                <View style={styles.previewTitleRow}>
                  <View style={[styles.previewIconBox, { backgroundColor: selectedTheme.iconBg }]}>
                    <MaterialCommunityIcons name={selectedIcon} size={18} color={previewIconColor} />
                  </View>
                  <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={1}>
                    {habitName.trim() || t('newHabit.previewFallback')}
                  </Text>
                </View>

                <View style={styles.previewWeekdayRow}>
                  {WEEK_DAY_KEYS.map((weekday) => (
                    <Text key={weekday} style={[styles.previewWeekdayLabel, { color: isLight ? colors.textMuted : 'rgba(255,255,255,0.72)' }]}>
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
                            { color: filled ? previewFilledTextColor : previewEmptyTextColor },
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
                  onPress={openReminderSheet}
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

      {/* ─── iOS-style wheel time picker bottom sheet ─── */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.bottomSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}
        handleIndicatorStyle={[styles.bottomSheetHandle, { backgroundColor: colors.textDim }]}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>{t('newHabit.reminder.bottomSheetTitle')}</Text>
            <Text style={[styles.bottomSheetSubtitle, { color: colors.textMuted }]}>
              {t('newHabit.reminder.bottomSheetSubtitle')}
            </Text>
          </View>

          {/* Wheel picker area */}
          <View style={styles.wheelPickerContainer}>
            {/* Selection highlight band */}
            <View
              style={[
                styles.wheelSelectionBand,
                {
                  backgroundColor: resolvedTheme === 'dark'
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(0,0,0,0.06)',
                  top: WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE_ITEMS / 2),
                  height: WHEEL_ITEM_HEIGHT,
                },
              ]}
            />

            {/* Hour column */}
            <WheelColumn
              data={HOURS_DATA}
              selectedValue={wheelHour}
              onValueChange={setWheelHour}
              textColor={colors.text}
              accentColor={colors.text}
            />

            {/* Colon separator */}
            <View style={styles.wheelSeparator}>
              <Text style={[styles.wheelSeparatorText, { color: colors.text }]}>:</Text>
            </View>

            {/* Minute column */}
            <WheelColumn
              data={MINUTES_DATA}
              selectedValue={wheelMinute}
              onValueChange={setWheelMinute}
              textColor={colors.text}
              accentColor={colors.text}
            />

            {/* AM / PM column */}
            <WheelColumn
              data={PERIOD_DATA}
              selectedValue={wheelPeriod}
              onValueChange={setWheelPeriod as (v: string) => void}
              textColor={colors.text}
              accentColor={colors.text}
            />

            {/* Top fade overlay */}
            <View style={styles.wheelFadeTop} pointerEvents="none">
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.95 }]} />
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.7 }]} />
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.35 }]} />
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.1 }]} />
            </View>
            {/* Bottom fade overlay */}
            <View style={styles.wheelFadeBottom} pointerEvents="none">
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.1 }]} />
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.35 }]} />
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.7 }]} />
              <View style={[styles.wheelFadeStrip, { backgroundColor: colors.surface, opacity: 0.95 }]} />
            </View>
          </View>

          <View style={styles.bottomSheetActions}>
            <Pressable
              onPress={closeReminderSheet}
              style={[styles.bottomSheetSecondaryButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.bottomSheetSecondaryText, { color: colors.text }]}>{t('newHabit.buttons.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={confirmWheelTime}
              style={[styles.bottomSheetPrimaryButton, { backgroundColor: selectedTheme.accent }]}>
              <Text style={[styles.bottomSheetPrimaryText, { color: accentForeground }]}>
                {t('newHabit.buttons.done')}
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
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
  bottomSheetPanel: {
    borderRadius: 0,
    backgroundColor: '#111113',
  },
  bottomSheetContent: {
    paddingHorizontal: 18,
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
  /* ─── Wheel picker styles ─── */
  wheelPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelSelectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 12,
    zIndex: 0,
  },
  wheelSeparator: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: WHEEL_HEIGHT,
  },
  wheelSeparatorText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  wheelFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_HEIGHT * 1.2,
    zIndex: 10,
  },
  wheelFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_HEIGHT * 1.2,
    zIndex: 10,
  },
  wheelFadeStrip: {
    flex: 1,
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
