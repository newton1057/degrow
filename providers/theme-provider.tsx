import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedAppTheme = 'light' | 'dark';

export const appPalettes = {
  light: {
    background: '#F3F4F8',
    surface: '#FFFFFF',
    surfaceAlt: '#F6F7FB',
    surfaceMuted: '#ECEFF4',
    border: 'rgba(17,19,21,0.08)',
    borderStrong: 'rgba(17,19,21,0.12)',
    text: '#111315',
    textSecondary: 'rgba(17,19,21,0.78)',
    textMuted: 'rgba(17,19,21,0.62)',
    textSoft: 'rgba(17,19,21,0.48)',
    textDim: 'rgba(17,19,21,0.34)',
    icon: '#111315',
    iconMuted: 'rgba(17,19,21,0.42)',
    tint: '#111315',
    overlay: 'rgba(17,19,21,0.22)',
    switchFalseTrack: '#D4D8DF',
    switchFalseThumb: '#FFFFFF',
    chipBg: '#F6F7FB',
    chipActiveBg: '#111315',
    chipTextOnActive: '#FFFFFF',
    shadow: '#000000',
  },
  dark: {
    background: '#000000',
    surface: '#0C0C0D',
    surfaceAlt: '#111113',
    surfaceMuted: '#171719',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.12)',
    text: '#F5F5F7',
    textSecondary: 'rgba(255,255,255,0.78)',
    textMuted: 'rgba(255,255,255,0.62)',
    textSoft: 'rgba(255,255,255,0.48)',
    textDim: 'rgba(255,255,255,0.34)',
    icon: '#F5F5F7',
    iconMuted: 'rgba(255,255,255,0.42)',
    tint: '#F5F5F7',
    overlay: 'rgba(0,0,0,0.58)',
    switchFalseTrack: '#3A3A3C',
    switchFalseThumb: '#D1D1D6',
    chipBg: '#111113',
    chipActiveBg: '#171719',
    chipTextOnActive: '#F5F5F7',
    shadow: '#000000',
  },
} as const;

type AppThemeColors = (typeof appPalettes)[ResolvedAppTheme];

type AppThemeContextValue = {
  colors: AppThemeColors;
  resolvedTheme: ResolvedAppTheme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

const THEME_STORAGE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}degrow-theme.txt`
  : null;

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const resolvedTheme: ResolvedAppTheme =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      if (!THEME_STORAGE_URI) {
        setHasLoadedStorage(true);
        return;
      }

      try {
        const info = await FileSystem.getInfoAsync(THEME_STORAGE_URI);

        if (info.exists) {
          const value = await FileSystem.readAsStringAsync(THEME_STORAGE_URI);

          if (isMounted && ['system', 'light', 'dark'].includes(value)) {
            setThemePreference(value as ThemePreference);
          }
        }
      } catch {
        // Ignore local theme preference failures and fall back to system.
      } finally {
        if (isMounted) {
          setHasLoadedStorage(true);
        }
      }
    };

    void loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage || !THEME_STORAGE_URI) {
      return;
    }

    void FileSystem.writeAsStringAsync(THEME_STORAGE_URI, themePreference).catch(() => {
      // Ignore local persistence failures and keep in-memory preference working.
    });
  }, [hasLoadedStorage, themePreference]);

  return (
    <AppThemeContext.Provider
      value={{
        colors: appPalettes[resolvedTheme],
        resolvedTheme,
        themePreference,
        setThemePreference,
      }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
}
