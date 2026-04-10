import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type DayItem = {
  label: string;
  day: string;
  filled: boolean;
};

type HabitTheme = {
  iconBg: string;
  accent: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
};

type HabitItem = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  days: DayItem[];
  theme: HabitTheme;
  completionVariant: 'light' | 'dark';
};

const WEEK_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const habits: HabitItem[] = [
  {
    title: 'Read Book',
    icon: 'book-open-page-variant-outline',
    completionVariant: 'light',
    theme: {
      iconBg: '#5DA8E8',
      accent: '#78BDF7',
      gradientStart: 'rgba(23,60,96,0.88)',
      gradientMid: 'rgba(8,19,34,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: [
      { label: 'Sat', day: '02', filled: false },
      { label: 'Sun', day: '03', filled: false },
      { label: 'Mon', day: '04', filled: false },
      { label: 'Tue', day: '05', filled: true },
      { label: 'Wed', day: '06', filled: true },
      { label: 'Thu', day: '07', filled: false },
      { label: 'Fri', day: '08', filled: true },
    ],
  },
  {
    title: 'Go to Gym',
    icon: 'dumbbell',
    completionVariant: 'dark',
    theme: {
      iconBg: '#D2A12C',
      accent: '#D8AA38',
      gradientStart: 'rgba(73,52,16,0.88)',
      gradientMid: 'rgba(28,20,6,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: [
      { label: 'Sat', day: '02', filled: true },
      { label: 'Sun', day: '03', filled: false },
      { label: 'Mon', day: '04', filled: true },
      { label: 'Tue', day: '05', filled: false },
      { label: 'Wed', day: '06', filled: true },
      { label: 'Thu', day: '07', filled: false },
      { label: 'Fri', day: '08', filled: false },
    ],
  },
  {
    title: 'Homemade Food Only',
    icon: 'silverware-fork-knife',
    completionVariant: 'dark',
    theme: {
      iconBg: '#D67C50',
      accent: '#E08A5C',
      gradientStart: 'rgba(79,40,24,0.88)',
      gradientMid: 'rgba(32,16,9,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: [
      { label: 'Sat', day: '02', filled: false },
      { label: 'Sun', day: '03', filled: false },
      { label: 'Mon', day: '04', filled: true },
      { label: 'Tue', day: '05', filled: true },
      { label: 'Wed', day: '06', filled: false },
      { label: 'Thu', day: '07', filled: true },
      { label: 'Fri', day: '08', filled: false },
    ],
  },
  {
    title: 'Six Hours of Sleep',
    icon: 'moon-waning-crescent',
    completionVariant: 'light',
    theme: {
      iconBg: '#D86C8E',
      accent: '#E784A3',
      gradientStart: 'rgba(79,23,39,0.88)',
      gradientMid: 'rgba(31,10,18,0.92)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: [
      { label: 'Sat', day: '02', filled: false },
      { label: 'Sun', day: '03', filled: false },
      { label: 'Mon', day: '04', filled: false },
      { label: 'Tue', day: '05', filled: true },
      { label: 'Wed', day: '06', filled: false },
      { label: 'Thu', day: '07', filled: false },
      { label: 'Fri', day: '08', filled: true },
    ],
  },
  {
    title: 'Mindfulness Practices',
    icon: 'leaf',
    completionVariant: 'dark',
    theme: {
      iconBg: '#1FA052',
      accent: '#2DB860',
      gradientStart: 'rgba(12,63,31,0.90)',
      gradientMid: 'rgba(7,24,12,0.93)',
      gradientEnd: 'rgba(0,0,0,0.96)',
    },
    days: [
      { label: 'Sat', day: '02', filled: true },
      { label: 'Sun', day: '03', filled: false },
      { label: 'Mon', day: '04', filled: false },
      { label: 'Tue', day: '05', filled: true },
      { label: 'Wed', day: '06', filled: false },
      { label: 'Thu', day: '07', filled: false },
      { label: 'Fri', day: '08', filled: true },
    ],
  },
];

function DayCircle({ day, filled, accent }: { day: string; filled: boolean; accent: string }) {
  return (
    <View
      style={[
        styles.dayCircle,
        {
          borderColor: accent,
          backgroundColor: filled ? accent : 'transparent',
        },
      ]}>
      <Text style={[styles.dayText, { color: filled ? '#EAF4FD' : 'rgba(255,255,255,0.84)' }]}>{day}</Text>
    </View>
  );
}

function HabitCard({ habit }: { habit: HabitItem }) {
  const completionBg = habit.completionVariant === 'light' ? '#FFFFFF' : '#1B1B1D';
  const checkColor = habit.completionVariant === 'light' ? habit.theme.accent : '#F3F3F4';

  return (
    <View style={styles.cardWrap}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: habit.theme.gradientMid,
            borderColor: 'rgba(255,255,255,0.08)',
          },
        ]}>
        <View style={[styles.cardShade, { backgroundColor: habit.theme.gradientStart }]} />
        <View style={[styles.cardShadeRight, { backgroundColor: habit.theme.gradientEnd }]} />

        <View style={styles.cardMain}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: habit.theme.iconBg }]}>
              <MaterialCommunityIcons name={habit.icon} size={20} color="#F6F8FB" />
            </View>
            <Text style={styles.habitTitle}>{habit.title}</Text>
          </View>

          <View style={styles.weekdayRow}>
            {WEEK_DAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekdayLabel}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.daysRow}>
            {habit.days.map((day) => (
              <DayCircle key={`${habit.title}-${day.label}`} day={day.day} filled={day.filled} accent={habit.theme.accent} />
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.completionButton, { backgroundColor: completionBg }]}>
        <Ionicons name="checkmark" size={29} color={checkColor} />
      </View>
    </View>
  );
}

function FloatingViewToggle() {
  const [selected, setSelected] = useState<'week' | 'grid'>('week');

  const segments = useMemo(
    () => [
      { key: 'week' as const, label: 'Week View' },
      { key: 'grid' as const, label: 'Grid View' },
    ],
    [],
  );

  return (
    <View style={styles.toggleShell}>
      <View style={styles.toggleInner}>
        {segments.map((segment) => {
          const isSelected = selected === segment.key;
          const segmentStyle: ViewStyle = isSelected
            ? styles.segmentSelected
            : styles.segmentUnselected;

          return (
            <Pressable
              key={segment.key}
              onPress={() => setSelected(segment.key)}
              style={[styles.segmentButton, segmentStyle]}>
              <Text style={[styles.segmentText, { color: isSelected ? '#1A1A1A' : '#F4F4F5' }]}>{segment.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function HabitStreakScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>HabitStreak</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconAction}>
              <Ionicons name="settings-outline" size={26} color="#F5F5F7" />
            </Pressable>
            <Pressable style={styles.iconAction}>
              <Ionicons name="add" size={34} color="#F5F5F7" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}>
          {habits.map((habit) => (
            <HabitCard key={habit.title} habit={habit} />
          ))}
        </ScrollView>

        <View style={styles.toggleOverlay}>
          <FloatingViewToggle />
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
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  screenTitle: {
    color: '#F5F5F7',
    fontSize: 42 / 2,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 168,
  },
  cardWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  card: {
    flex: 1,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardShade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '55%',
    opacity: 0.95,
  },
  cardShadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '44%',
    opacity: 0.9,
  },
  cardMain: {
    zIndex: 2,
    gap: 9,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    color: '#F5F5F7',
    fontSize: 33 / 2,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 1,
  },
  weekdayLabel: {
    color: 'rgba(255,255,255,0.72)',
    width: 33,
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  completionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  toggleShell: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 6,
  },
  toggleInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,10,10,0.2)',
    borderRadius: 999,
    gap: 6,
  },
  segmentButton: {
    minWidth: 138,
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  segmentSelected: {
    backgroundColor: '#F1F1F2',
  },
  segmentUnselected: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  segmentText: {
    fontSize: 33 / 2,
    fontWeight: '600',
    letterSpacing: -0.25,
  },
});
