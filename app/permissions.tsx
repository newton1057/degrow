import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

type PermissionKey = 'camera' | 'notifications' | 'photos';
type PermissionStatusKey = 'denied' | 'granted' | 'limited' | 'unknown' | 'unavailable';

type PermissionSnapshot = Record<PermissionKey, PermissionStatusKey>;

type ExpoPermissionResponse = {
  accessPrivileges?: string | null;
  granted?: boolean;
  ios?: {
    status?: number | string;
  };
  status?: string;
};

const initialPermissions: PermissionSnapshot = {
  camera: 'unknown',
  notifications: 'unknown',
  photos: 'unknown',
};

const COMMON_EXPO_NOTIFICATIONS_NATIVE_MODULES = [
  'ExpoBadgeModule',
  'ExpoBackgroundNotificationTasksModule',
  'ExpoNotificationCategoriesModule',
  'ExpoNotificationPermissionsModule',
  'ExpoNotificationPresenter',
  'ExpoNotificationScheduler',
  'ExpoNotificationsEmitter',
  'ExpoNotificationsHandlerModule',
  'ExpoPushTokenManager',
  'NotificationsServerRegistrationModule',
];

function hasNativeModule(moduleName: string) {
  return Boolean(requireOptionalNativeModule(moduleName));
}

function canUseExpoNotifications() {
  return COMMON_EXPO_NOTIFICATIONS_NATIVE_MODULES.every(hasNativeModule);
}

function canUseImagePicker() {
  return hasNativeModule('ExponentImagePicker');
}

function resolveMediaStatus(permission: ExpoPermissionResponse): PermissionStatusKey {
  if (permission.granted) {
    return permission.accessPrivileges === 'limited' ? 'limited' : 'granted';
  }

  if (permission.status === 'denied') {
    return 'denied';
  }

  return 'unknown';
}

function resolveNotificationStatus(permission: ExpoPermissionResponse, Notifications: typeof import('expo-notifications')) {
  if (permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return 'granted';
  }

  if (permission.status === Notifications.PermissionStatus.DENIED || permission.status === 'denied') {
    return 'denied';
  }

  return 'unknown';
}

async function readNotificationPermission(): Promise<PermissionStatusKey> {
  if (!canUseExpoNotifications()) {
    return 'unavailable';
  }

  try {
    const Notifications = await import('expo-notifications');

    if (typeof Notifications.getPermissionsAsync !== 'function') {
      return 'unavailable';
    }

    const permission = await Notifications.getPermissionsAsync();
    return resolveNotificationStatus(permission, Notifications);
  } catch {
    return 'unavailable';
  }
}

async function readImagePickerPermission(kind: 'camera' | 'photos'): Promise<PermissionStatusKey> {
  if (!canUseImagePicker()) {
    return 'unavailable';
  }

  try {
    const ImagePicker = await import('expo-image-picker');
    const permission =
      kind === 'camera'
        ? await ImagePicker.getCameraPermissionsAsync()
        : await ImagePicker.getMediaLibraryPermissionsAsync();

    return resolveMediaStatus(permission);
  } catch {
    return 'unavailable';
  }
}

async function requestNotificationPermission(): Promise<PermissionStatusKey> {
  if (!canUseExpoNotifications()) {
    return 'unavailable';
  }

  try {
    const Notifications = await import('expo-notifications');

    if (typeof Notifications.requestPermissionsAsync !== 'function') {
      return 'unavailable';
    }

    const permission = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return resolveNotificationStatus(permission, Notifications);
  } catch {
    return 'unavailable';
  }
}

async function requestImagePickerPermission(kind: 'camera' | 'photos'): Promise<PermissionStatusKey> {
  if (!canUseImagePicker()) {
    return 'unavailable';
  }

  try {
    const ImagePicker = await import('expo-image-picker');
    const permission =
      kind === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    return resolveMediaStatus(permission);
  } catch {
    return 'unavailable';
  }
}

export default function PermissionsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const [permissions, setPermissions] = useState<PermissionSnapshot>(initialPermissions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPermissions = useCallback(async () => {
    setIsRefreshing(true);

    const [notifications, camera, photos] = await Promise.all([
      readNotificationPermission(),
      readImagePickerPermission('camera'),
      readImagePickerPermission('photos'),
    ]);

    setPermissions({ camera, notifications, photos });
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void refreshPermissions();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermissions();
      }
    });

    return () => subscription.remove();
  }, [refreshPermissions]);

  const openSettings = () => {
    void Linking.openSettings().catch(() => {});
  };

  const requestPermission = async (key: PermissionKey) => {
    if (permissions[key] === 'denied' || permissions[key] === 'granted' || permissions[key] === 'limited') {
      openSettings();
      return;
    }

    const nextStatus =
      key === 'notifications'
        ? await requestNotificationPermission()
        : await requestImagePickerPermission(key === 'camera' ? 'camera' : 'photos');

    setPermissions((current) => ({ ...current, [key]: nextStatus }));
  };

  const permissionRows = [
    {
      description: t('permissions.notificationsDescription'),
      icon: 'bell-badge-outline' as const,
      key: 'notifications' as const,
      title: t('permissions.notificationsTitle'),
    },
    {
      description: t('permissions.cameraDescription'),
      icon: 'camera-outline' as const,
      key: 'camera' as const,
      title: t('permissions.cameraTitle'),
    },
    {
      description: t('permissions.photosDescription'),
      icon: 'image-outline' as const,
      key: 'photos' as const,
      title: t('permissions.photosTitle'),
    },
  ];

  const getStatusStyle = (status: PermissionStatusKey) => {
    if (status === 'granted') {
      return { backgroundColor: 'rgba(48,209,88,0.14)', color: '#30D158' };
    }

    if (status === 'limited') {
      return { backgroundColor: 'rgba(255,214,10,0.15)', color: '#FFD60A' };
    }

    if (status === 'denied') {
      return { backgroundColor: 'rgba(255,69,58,0.15)', color: '#FF453A' };
    }

    if (status === 'unavailable') {
      return { backgroundColor: colors.surfaceMuted, color: colors.textSoft };
    }

    return { backgroundColor: colors.surfaceMuted, color: colors.textMuted };
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
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('permissions.title')}</Text>
            <Pressable
              onPress={() => void refreshPermissions()}
              style={[styles.refreshButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="refresh" size={18} color={colors.icon} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                <MaterialCommunityIcons name="cellphone-cog" size={26} color={colors.icon} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{t('permissions.heroTitle')}</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{t('permissions.heroSubtitle')}</Text>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {permissionRows.map((item, index) => {
                const status = permissions[item.key];
                const statusStyle = getStatusStyle(status);
                const isUnavailable = status === 'unavailable';
                const actionLabel = status === 'unknown' ? t('permissions.actions.allow') : t('permissions.actions.openSettings');

                return (
                  <View key={item.key}>
                    <View style={styles.permissionRow}>
                      <View style={[styles.permissionIconBox, { backgroundColor: colors.surfaceMuted }]}>
                        <MaterialCommunityIcons name={item.icon} size={19} color={colors.icon} />
                      </View>
                      <View style={styles.permissionTextWrap}>
                        <View style={styles.permissionTitleRow}>
                          <Text style={[styles.permissionTitle, { color: colors.text }]}>{item.title}</Text>
                          <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
                            <Text style={[styles.statusText, { color: statusStyle.color }]}>
                              {t(`permissions.status.${status}`)}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.permissionDescription, { color: colors.textMuted }]}>{item.description}</Text>
                        {isUnavailable ? (
                          <Text style={[styles.permissionHint, { color: colors.textSoft }]}>
                            {t('permissions.unavailableDescription')}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <Pressable
                      disabled={isUnavailable || isRefreshing}
                      onPress={() => void requestPermission(item.key)}
                      style={({ pressed }) => [
                        styles.permissionButton,
                        {
                          backgroundColor: isUnavailable ? colors.surfaceMuted : colors.text,
                          opacity: pressed || isRefreshing ? 0.72 : 1,
                        },
                      ]}>
                      <Text style={[styles.permissionButtonText, { color: isUnavailable ? colors.textSoft : colors.background }]}>
                        {actionLabel}
                      </Text>
                    </Pressable>

                    {index < permissionRows.length - 1 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                  </View>
                );
              })}
            </View>

            <View style={[styles.hintCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.iconMuted} />
              <Text style={[styles.hintText, { color: colors.textMuted }]}>{t('permissions.openSettingsHint')}</Text>
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
  refreshButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
  permissionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  permissionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionTitle: {
    flex: 1,
    color: '#F5F5F7',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  permissionDescription: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12.8,
    lineHeight: 18,
  },
  permissionHint: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 12.2,
    lineHeight: 17,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  permissionButton: {
    alignSelf: 'flex-end',
    minWidth: 118,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 14,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  hintCard: {
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 12.8,
    lineHeight: 18,
  },
});
