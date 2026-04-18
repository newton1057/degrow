import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHaptics } from '@/hooks/use-haptics';
import { useAuth } from '@/providers/auth-provider';
import { useHabits } from '@/providers/habits-provider';
import { useI18n } from '@/providers/language-provider';
import { useSettings } from '@/providers/settings-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function ExportDataScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { user } = useAuth();
  const { habits } = useHabits();
  const { settings } = useSettings();
  const haptics = useHaptics();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) {
      return;
    }

    void haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);

    try {
      // Preparar datos para exportar
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        },
        habits: habits.map((habit) => ({
          id: habit.id,
          title: habit.title,
          titleKey: habit.titleKey,
          icon: habit.icon,
          theme: habit.theme,
          completionVariant: habit.completionVariant,
          scheduledDays: habit.scheduledDays,
          reminderEnabled: habit.reminderEnabled,
          reminderMinutes: habit.reminderMinutes,
          targetMinutes: habit.targetMinutes,
          days: habit.days,
        })),
        settings: {
          notifications: settings.notifications,
          experience: settings.experience,
        },
        statistics: {
          totalHabits: habits.length,
          totalCompletions: habits.reduce(
            (acc, habit) => acc + habit.days.filter((day) => day.filled).length,
            0
          ),
        },
      };

      // Crear archivo temporal
      const fileName = `degrow-export-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

      // Compartir archivo
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: t('exportData.shareTitle'),
          UTI: 'public.json',
        });

        void haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          t('exportData.errorTitle'),
          'Sharing is not available on this device.'
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      void haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      Alert.alert(t('exportData.errorTitle'), t('exportData.errorMessage'));
    } finally {
      setIsExporting(false);
    }
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
              style={[
                styles.backButton,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}>
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </Pressable>
            <Text style={[styles.screenTitle, { color: colors.text }]}>
              {t('exportData.title')}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View
              style={[
                styles.heroCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                <MaterialCommunityIcons name="database-export-outline" size={26} color={colors.icon} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {t('exportData.heroTitle')}
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                  {t('exportData.heroSubtitle')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('exportData.whatIncluded')}
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.surfaceMuted }]}>
                    <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color={colors.tint} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    {t('exportData.includeHabits')}
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.surfaceMuted }]}>
                    <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color={colors.tint} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    {t('exportData.includeProgress')}
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.surfaceMuted }]}>
                    <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color={colors.tint} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    {t('exportData.includeSettings')}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.statsCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{habits.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Habits</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {habits.reduce((acc, habit) => acc + habit.days.filter((day) => day.filled).length, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Completions</Text>
              </View>
            </View>

            <Pressable
              onPress={handleExport}
              disabled={isExporting}
              style={({ pressed }) => [
                styles.exportButton,
                { backgroundColor: colors.tint, borderColor: colors.tint },
                pressed && !isExporting && { opacity: 0.8 },
                isExporting && { opacity: 0.6 },
              ]}>
              <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>
                {isExporting ? t('exportData.exporting') : t('exportData.exportButton')}
              </Text>
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
    gap: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  featureList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  exportButton: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
