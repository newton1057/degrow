import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useHaptics } from '@/hooks/use-haptics';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

type GuestGuardModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function GuestGuardModal({ visible, onClose }: GuestGuardModalProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const haptics = useHaptics();

  const handleCreateAccount = () => {
    void haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push('/(auth)/register');
  };

  const handleMaybeLater = () => {
    void haptics.selectionAsync();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceMuted }]}>
            <MaterialCommunityIcons name="cloud-sync-outline" size={32} color={colors.tint} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t('guest.guardTitle')}
          </Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            {t('guest.guardMessage')}
          </Text>

          <View style={styles.features}>
            {(['guest.guardFeature1', 'guest.guardFeature2', 'guest.guardFeature3'] as const).map((key) => (
              <View key={key} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
                <Text style={[styles.featureText, { color: colors.text }]}>{t(key)}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={handleCreateAccount}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.tint },
              pressed && { opacity: 0.85 },
            ]}>
            <Ionicons name="person-add-outline" size={18} color={colors.background} />
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              {t('guest.createAccount')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleMaybeLater}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}>
            <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>
              {t('guest.maybeLater')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Hook to wrap a callback with a guest guard.
 * If the user is a guest, the modal is shown instead of running the callback.
 * Returns { guard, modalProps, showModal, setShowModal }.
 */
export function useGuestGuard(isGuest: boolean) {
  const [showModal, setShowModal] = useState(false);

  const guard = (callback: () => void) => {
    if (isGuest) {
      setShowModal(true);
      return;
    }
    callback();
  };

  const modalProps = {
    visible: showModal,
    onClose: () => setShowModal(false),
  };

  return { guard, modalProps, showModal, setShowModal };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  features: {
    alignSelf: 'stretch',
    gap: 10,
    marginVertical: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13.5,
    fontWeight: '500',
    flex: 1,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
