import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

const LIGHT_UNDERLAY_COLORS = ['rgba(243,244,248,0)', 'rgba(243,244,248,0.36)', 'rgba(243,244,248,0.72)'] as const;
const DARK_UNDERLAY_COLORS = ['rgba(0,0,0,0)', 'rgba(0,0,0,0.46)', 'rgba(0,0,0,0.78)'] as const;
const UNDERLAY_LOCATIONS = [0, 0.52, 1] as const;

export function TabBarBlurUnderlay() {
  const { resolvedTheme } = useAppTheme();

  return (
    <LinearGradient
      pointerEvents="none"
      colors={resolvedTheme === 'light' ? LIGHT_UNDERLAY_COLORS : DARK_UNDERLAY_COLORS}
      locations={UNDERLAY_LOCATIONS}
      style={styles.underlay}
    />
  );
}

const styles = StyleSheet.create({
  underlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 170,
    zIndex: 4,
  },
});
