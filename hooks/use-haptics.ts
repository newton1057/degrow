import * as Haptics from 'expo-haptics';

import { useSettings } from '@/providers/settings-provider';

/**
 * Hook para controlar feedback háptico respetando las preferencias del usuario
 */
export function useHaptics() {
  const { settings } = useSettings();

  const impactAsync = async (style: Haptics.ImpactFeedbackStyle) => {
    if (settings.experience.hapticsEnabled) {
      await Haptics.impactAsync(style);
    }
  };

  const notificationAsync = async (type: Haptics.NotificationFeedbackType) => {
    if (settings.experience.hapticsEnabled) {
      await Haptics.notificationAsync(type);
    }
  };

  const selectionAsync = async () => {
    if (settings.experience.hapticsEnabled) {
      await Haptics.selectionAsync();
    }
  };

  return {
    impactAsync,
    notificationAsync,
    selectionAsync,
    ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
    NotificationFeedbackType: Haptics.NotificationFeedbackType,
  };
}
