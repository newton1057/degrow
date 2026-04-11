import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

import { TabBarBlurUnderlay } from '@/components/tab-bar-blur-underlay';
import { useAuth } from '@/providers/auth-provider';
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

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'DG'
  );
}

async function copyProfileAvatar(sourceUri: string, userId: string, previousUri?: string | null) {
  if (!FileSystem.documentDirectory) {
    return sourceUri;
  }

  const extension = sourceUri.match(/\.(jpe?g|png|webp|heic)(\?.*)?$/i)?.[1]?.toLowerCase() ?? 'jpg';
  const destinationUri = `${FileSystem.documentDirectory}degrow-profile-avatar-${userId}-${Date.now()}.${extension}`;

  try {
    await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });

    if (previousUri?.startsWith(FileSystem.documentDirectory) && previousUri !== destinationUri) {
      void FileSystem.deleteAsync(previousUri, { idempotent: true });
    }

    return destinationUri;
  } catch {
    return sourceUri;
  }
}

function canUseNativeImagePicker() {
  return Boolean(requireOptionalNativeModule('ExponentImagePicker'));
}

async function loadImagePicker() {
  const ImagePicker = await import('expo-image-picker');

  if (
    typeof ImagePicker.requestMediaLibraryPermissionsAsync !== 'function' ||
    typeof ImagePicker.requestCameraPermissionsAsync !== 'function' ||
    typeof ImagePicker.launchImageLibraryAsync !== 'function' ||
    typeof ImagePicker.launchCameraAsync !== 'function'
  ) {
    throw new Error('expo-image-picker API is not available in this native build.');
  }

  return ImagePicker;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { user, updateProfile } = useAuth();
  const { habits } = useHabits();
  const profileName = user?.name?.trim() || t('profile.defaultName');
  const profileEmail = user?.email?.trim() || t('profile.noEmail');
  const profileInitials = getInitials(profileName);
  const hasAvatar = Boolean(user?.avatarUri);
  const photoSheetRef = useRef<BottomSheetModal>(null);
  const photoSheetSnapPoints = useMemo(() => ['32%'], []);

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

  const ensureImagePickerReady = () => {
    if (!canUseNativeImagePicker()) {
      Alert.alert(t('profile.photoUnavailableTitle'), t('profile.photoUnavailableMessage'));
      return false;
    }

    return true;
  };

  const saveAvatar = async (assetUri?: string | null) => {
    if (!assetUri) {
      return;
    }

    const avatarUri = await copyProfileAvatar(assetUri, user?.id ?? 'local', user?.avatarUri);
    updateProfile({ avatarUri });
  };

  const chooseFromLibrary = async () => {
    try {
      const ImagePicker = await loadImagePicker();
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(t('profile.photoPermissionTitle'), t('profile.photoPermissionMessage'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: 'images',
        quality: 0.86,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      await saveAvatar(result.assets[0].uri);
    } catch (error) {
      console.warn('Profile photo picker is unavailable.', error);
      Alert.alert(t('profile.photoUnavailableTitle'), t('profile.photoUnavailableMessage'));
    }
  };

  const takePhoto = async () => {
    try {
      const ImagePicker = await loadImagePicker();
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(t('profile.cameraPermissionTitle'), t('profile.cameraPermissionMessage'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: 'images',
        quality: 0.86,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      await saveAvatar(result.assets[0].uri);
    } catch (error) {
      console.warn('Profile camera picker is unavailable.', error);
      Alert.alert(t('profile.photoUnavailableTitle'), t('profile.photoUnavailableMessage'));
    }
  };

  const renderPhotoBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" opacity={0.58} />
    ),
    []
  );

  const runPhotoAction = (action: () => Promise<void>) => {
    void Haptics.selectionAsync();
    photoSheetRef.current?.dismiss();
    setTimeout(() => {
      void action();
    }, 180);
  };

  const handleProfilePhotoPress = () => {
    void Haptics.selectionAsync();

    if (!ensureImagePickerReady()) {
      return;
    }

    photoSheetRef.current?.present();
  };

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

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustsScrollIndicatorInsets={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.heroHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={hasAvatar ? t('profile.changePhoto') : t('profile.addPhoto')}
                  onPress={handleProfilePhotoPress}
                  style={({ pressed }) => [styles.avatarButton, pressed && { opacity: 0.78 }]}>
                  <View style={[styles.avatarWrap, { backgroundColor: colors.surfaceMuted }]}>
                    {user?.avatarUri ? (
                      <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} contentFit="cover" />
                    ) : (
                      <Text style={[styles.avatarText, { color: colors.text }]}>{profileInitials}</Text>
                    )}
                  </View>
                  <View style={[styles.avatarBadge, { backgroundColor: colors.text, borderColor: colors.surface }]}>
                    <Ionicons name="camera" size={13} color={colors.background} />
                  </View>
                </Pressable>

                <View style={styles.heroIdentity}>
                  <Text style={[styles.heroEyebrow, { color: colors.textSoft }]}>{t('profile.heroTitle')}</Text>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>{profileName}</Text>
                  <Text style={[styles.heroEmail, { color: colors.textMuted }]}>{profileEmail}</Text>
                </View>
              </View>

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
        <TabBarBlurUnderlay />
      </View>

      <BottomSheetModal
        ref={photoSheetRef}
        snapPoints={photoSheetSnapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderPhotoBackdrop}
        backgroundStyle={[styles.photoSheetPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}
        handleIndicatorStyle={[styles.photoSheetHandle, { backgroundColor: colors.textDim }]}>
        <BottomSheetView style={styles.photoSheetContent}>
          <View style={styles.photoSheetHeader}>
            <Text style={[styles.photoSheetTitle, { color: colors.text }]}>{t('profile.photoOptionsTitle')}</Text>
            <Text style={[styles.photoSheetSubtitle, { color: colors.textMuted }]}>
              {t('profile.photoOptionsSubtitle')}
            </Text>
          </View>

          <View style={styles.photoSheetActions}>
            <Pressable
              onPress={() => runPhotoAction(takePhoto)}
              style={({ pressed }) => [
                styles.photoSheetAction,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                pressed && { opacity: 0.72 },
              ]}>
              <View style={[styles.photoSheetIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="camera-outline" size={20} color={colors.icon} />
              </View>
              <View style={styles.photoSheetTextWrap}>
                <Text style={[styles.photoSheetActionTitle, { color: colors.text }]}>{t('profile.takePhoto')}</Text>
                <Text style={[styles.photoSheetActionSubtitle, { color: colors.textMuted }]}>
                  {t('profile.takePhotoDescription')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </Pressable>

            <Pressable
              onPress={() => runPhotoAction(chooseFromLibrary)}
              style={({ pressed }) => [
                styles.photoSheetAction,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                pressed && { opacity: 0.72 },
              ]}>
              <View style={[styles.photoSheetIcon, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="image-outline" size={20} color={colors.icon} />
              </View>
              <View style={styles.photoSheetTextWrap}>
                <Text style={[styles.photoSheetActionTitle, { color: colors.text }]}>{t('profile.chooseFromLibrary')}</Text>
                <Text style={[styles.photoSheetActionSubtitle, { color: colors.textMuted }]}>
                  {t('profile.chooseFromLibraryDescription')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
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
    flexGrow: 1,
    gap: 14,
    paddingBottom: 160,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarButton: {
    width: 78,
    height: 78,
    justifyContent: 'center',
  },
  avatarWrap: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#F5F5F7',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  avatarBadge: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIdentity: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#F5F5F7',
    marginTop: 5,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  heroEmail: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  heroSubtitle: {
    marginTop: 18,
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
  photoSheetPanel: {
    borderRadius: 0,
    borderTopWidth: 1,
    backgroundColor: '#0C0C0D',
  },
  photoSheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  photoSheetContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 18,
  },
  photoSheetHeader: {
    gap: 5,
  },
  photoSheetTitle: {
    color: '#F5F5F7',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  photoSheetSubtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  photoSheetActions: {
    gap: 10,
  },
  photoSheetAction: {
    minHeight: 68,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111113',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  photoSheetIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSheetTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  photoSheetActionTitle: {
    color: '#F5F5F7',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  photoSheetActionSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12.5,
    lineHeight: 17,
  },
});
