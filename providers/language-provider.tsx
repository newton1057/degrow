import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AppLanguage = 'en' | 'es';

type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const LANGUAGE_STORAGE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}degrow-language.txt`
  : null;

const translations = {
  en: {
    appName: 'DeGrow',
    languageNames: {
      en: 'English',
      es: 'Spanish',
    },
    tabs: {
      listView: 'List View',
      profile: 'Profile',
    },
    home: {
      pulseTitle: 'Weekly Pulse',
      pulseSubtitle: 'Quick view of your rhythm this week.',
      activeHabits: 'Active Habits',
      completedToday: 'Done Today',
      bestRun: 'Best Run',
    },
    modal: {
      title: 'Modal',
      heading: 'This is a modal',
      cta: 'Go to home screen',
    },
    daysShort: {
      sat: 'Sat',
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
    },
    daysFull: {
      sat: 'Saturday',
      sun: 'Sunday',
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
    },
    habits: {
      readBook: 'Read Book',
      goToGym: 'Go to Gym',
      homemadeFoodOnly: 'Homemade Food Only',
      sixHoursSleep: 'Six Hours of Sleep',
      mindfulnessPractices: 'Mindfulness Practices',
    },
    profile: {
      title: 'Profile',
      heroTitle: 'DeGrow Focus',
      heroSubtitle: 'Track habits, keep momentum, and review your weekly rhythm.',
      completed: 'Completed',
      bestStreak: 'Best Streak',
      topHabit: 'Top Habit',
      featureBody:
        'This habit has your strongest consistency this week. Keep the same cadence and avoid breaking the streak.',
      thisWeek: 'This Week',
    },
    settings: {
      title: 'Settings',
      heroTitle: 'Tune your habit system',
      heroSubtitle: 'Control reminders, weekly rhythm, and the way DeGrow behaves across your day.',
      sections: {
        focusEyebrow: 'Focus',
        habitsAndReminders: 'Habits & reminders',
        experienceEyebrow: 'Experience',
        appBehavior: 'App behavior',
        languageEyebrow: 'Language',
        language: 'App language',
        accountEyebrow: 'Account',
        profileAndData: 'Profile & data',
      },
      rows: {
        pushNotificationsTitle: 'Push Notifications',
        pushNotificationsDescription: 'Allow DeGrow to send reminder and review notifications.',
        dailyHabitRemindersTitle: 'Daily Habit Reminders',
        dailyHabitRemindersDescription: 'Send a daily prompt to complete the habits scheduled for today.',
        startOfWeekTitle: 'Start of Week',
        startOfWeekDescription: 'Change how weekly progress is grouped and displayed.',
        hapticsTitle: 'Haptics',
        hapticsDescription: 'Use subtle tactile feedback when completing habits and switching views.',
        weeklyReviewTitle: 'Weekly Review',
        weeklyReviewDescription:
          'Show a review summary with your strongest and weakest habit patterns.',
        appearanceTitle: 'Appearance',
        appearanceDescription: 'Choose how DeGrow follows your device theme.',
        profileTitle: 'Profile',
        profileDescription: 'Manage your account details and display preferences.',
        exportDataTitle: 'Export Data',
        exportDataDescription: 'Download your habit history and weekly summaries.',
        privacyTitle: 'Privacy',
        privacyDescription: 'Review storage, permissions, and notification access.',
      },
      values: {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
        personal: 'Personal',
        available: 'Available',
        review: 'Review',
      },
      languageDescription: 'Choose the language used across DeGrow.',
    },
    newHabit: {
      title: 'New Habit',
      draft: 'Draft',
      defaults: {
        habitName: 'Read for 20 minutes',
      },
      previewFallback: 'Your new habit',
      sections: {
        identityEyebrow: 'Identity',
        habitBasics: 'Habit basics',
        scheduleEyebrow: 'Schedule',
        repeatPattern: 'Repeat pattern',
      },
      labels: {
        habitName: 'Habit name',
        icon: 'Icon',
        cardColor: 'Card color',
        dailyReminder: 'Daily Reminder',
        reminderTime: 'Reminder time',
      },
      placeholders: {
        habitName: 'Name your habit',
      },
      reminder: {
        onDescription: 'Prompt this habit at {time}.',
        offDescription: 'Reminder is turned off.',
        timeHint: 'Choose when you want the notification.',
        bottomSheetTitle: 'Reminder time',
        bottomSheetSubtitle: 'Set when this habit should remind you.',
      },
      buttons: {
        cancel: 'Cancel',
        createHabit: 'Create Habit',
        done: 'Done',
      },
      time: {
        hour: 'Hour',
        minute: 'Min',
        am: 'AM',
        pm: 'PM',
      },
      colors: {
        white: 'Snow White',
        coral: 'Coral Red',
        orange: 'Bright Orange',
        yellow: 'Sun Yellow',
        mint: 'Mint Green',
        blue: 'Calm Blue',
        purple: 'Violet',
        gold: 'Warm Gold',
        rose: 'Soft Rose',
        green: 'Fresh Green',
        pink: 'Candy Pink',
        teal: 'Ocean Teal',
      },
    },
  },
  es: {
    appName: 'DeGrow',
    languageNames: {
      en: 'Inglés',
      es: 'Español',
    },
    tabs: {
      listView: 'Lista',
      profile: 'Perfil',
    },
    home: {
      pulseTitle: 'Pulso semanal',
      pulseSubtitle: 'Vista rápida de tu ritmo esta semana.',
      activeHabits: 'Hábitos activos',
      completedToday: 'Hechos hoy',
      bestRun: 'Mejor racha',
    },
    modal: {
      title: 'Modal',
      heading: 'Este es un modal',
      cta: 'Ir al inicio',
    },
    daysShort: {
      sat: 'Sáb',
      sun: 'Dom',
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
    },
    daysFull: {
      sat: 'Sábado',
      sun: 'Domingo',
      mon: 'Lunes',
      tue: 'Martes',
      wed: 'Miércoles',
      thu: 'Jueves',
      fri: 'Viernes',
    },
    habits: {
      readBook: 'Leer libro',
      goToGym: 'Ir al gym',
      homemadeFoodOnly: 'Sólo comida casera',
      sixHoursSleep: 'Seis horas de sueño',
      mindfulnessPractices: 'Prácticas de mindfulness',
    },
    profile: {
      title: 'Perfil',
      heroTitle: 'Enfoque DeGrow',
      heroSubtitle: 'Haz seguimiento de tus hábitos, mantén el ritmo y revisa tu progreso semanal.',
      completed: 'Completados',
      bestStreak: 'Mejor racha',
      topHabit: 'Hábito top',
      featureBody:
        'Este hábito tiene tu mejor consistencia esta semana. Mantén el mismo ritmo y evita romper la racha.',
      thisWeek: 'Esta semana',
    },
    settings: {
      title: 'Configuración',
      heroTitle: 'Ajusta tu sistema de hábitos',
      heroSubtitle: 'Controla recordatorios, ritmo semanal y la forma en que DeGrow te acompaña durante el día.',
      sections: {
        focusEyebrow: 'Enfoque',
        habitsAndReminders: 'Hábitos y recordatorios',
        experienceEyebrow: 'Experiencia',
        appBehavior: 'Comportamiento de la app',
        languageEyebrow: 'Idioma',
        language: 'Idioma de la app',
        accountEyebrow: 'Cuenta',
        profileAndData: 'Perfil y datos',
      },
      rows: {
        pushNotificationsTitle: 'Notificaciones push',
        pushNotificationsDescription: 'Permite que DeGrow envíe recordatorios y revisiones.',
        dailyHabitRemindersTitle: 'Recordatorios diarios',
        dailyHabitRemindersDescription: 'Envía un aviso diario para completar los hábitos programados para hoy.',
        startOfWeekTitle: 'Inicio de semana',
        startOfWeekDescription: 'Cambia cómo se agrupa y se muestra el progreso semanal.',
        hapticsTitle: 'Hápticos',
        hapticsDescription: 'Usa retroalimentación táctil al completar hábitos y cambiar de vista.',
        weeklyReviewTitle: 'Revisión semanal',
        weeklyReviewDescription: 'Muestra un resumen con tus patrones de hábitos más fuertes y más débiles.',
        appearanceTitle: 'Apariencia',
        appearanceDescription: 'Elige cómo DeGrow sigue el tema de tu dispositivo.',
        profileTitle: 'Perfil',
        profileDescription: 'Administra tus datos de cuenta y preferencias de visualización.',
        exportDataTitle: 'Exportar datos',
        exportDataDescription: 'Descarga tu historial de hábitos y resúmenes semanales.',
        privacyTitle: 'Privacidad',
        privacyDescription: 'Revisa almacenamiento, permisos y acceso a notificaciones.',
      },
      values: {
        system: 'Sistema',
        light: 'Claro',
        dark: 'Oscuro',
        personal: 'Personal',
        available: 'Disponible',
        review: 'Revisar',
      },
      languageDescription: 'Elige el idioma que usará DeGrow.',
    },
    newHabit: {
      title: 'Nuevo hábito',
      draft: 'Borrador',
      defaults: {
        habitName: 'Leer 20 minutos',
      },
      previewFallback: 'Tu nuevo hábito',
      sections: {
        identityEyebrow: 'Identidad',
        habitBasics: 'Datos del hábito',
        scheduleEyebrow: 'Horario',
        repeatPattern: 'Patrón de repetición',
      },
      labels: {
        habitName: 'Nombre del hábito',
        icon: 'Ícono',
        cardColor: 'Color de tarjeta',
        dailyReminder: 'Recordatorio diario',
        reminderTime: 'Hora del recordatorio',
      },
      placeholders: {
        habitName: 'Ponle nombre a tu hábito',
      },
      reminder: {
        onDescription: 'Recordar este hábito a las {time}.',
        offDescription: 'El recordatorio está apagado.',
        timeHint: 'Elige cuándo quieres recibir la notificación.',
        bottomSheetTitle: 'Hora del recordatorio',
        bottomSheetSubtitle: 'Define cuándo debe recordarte este hábito.',
      },
      buttons: {
        cancel: 'Cancelar',
        createHabit: 'Crear hábito',
        done: 'Listo',
      },
      time: {
        hour: 'Hora',
        minute: 'Min',
        am: 'a. m.',
        pm: 'p. m.',
      },
      colors: {
        white: 'Blanco nieve',
        coral: 'Rojo coral',
        orange: 'Naranja brillante',
        yellow: 'Amarillo sol',
        mint: 'Verde menta',
        blue: 'Azul sereno',
        purple: 'Violeta',
        gold: 'Dorado cálido',
        rose: 'Rosa suave',
        green: 'Verde fresco',
        pink: 'Rosa candy',
        teal: 'Turquesa océano',
      },
    },
  },
} as const;

export const DEFAULT_HABIT_NAME_VALUES = [
  translations.en.newHabit.defaults.habitName,
  translations.es.newHabit.defaults.habitName,
];

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveTranslation(language: AppLanguage, key: string) {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, translations[language]);
}

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];

    return value === undefined ? `{${token}}` : String(value);
  });
}

function detectInitialLanguage(): AppLanguage {
  const locale =
    Intl.DateTimeFormat?.().resolvedOptions?.().locale ??
    (typeof navigator !== 'undefined' ? navigator.language : undefined);

  return locale?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(detectInitialLanguage);
  const [hasLoadedStoredLanguage, setHasLoadedStoredLanguage] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStoredLanguage = async () => {
      if (!LANGUAGE_STORAGE_URI) {
        setHasLoadedStoredLanguage(true);
        return;
      }

      try {
        const info = await FileSystem.getInfoAsync(LANGUAGE_STORAGE_URI);

        if (!info.exists) {
          return;
        }

        const storedLanguage = await FileSystem.readAsStringAsync(LANGUAGE_STORAGE_URI);

        if (isMounted && (storedLanguage === 'en' || storedLanguage === 'es')) {
          setLanguage(storedLanguage);
        }
      } catch {
        // Ignore storage read issues and continue with the detected locale.
      } finally {
        if (isMounted) {
          setHasLoadedStoredLanguage(true);
        }
      }
    };

    void loadStoredLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredLanguage || !LANGUAGE_STORAGE_URI) {
      return;
    }

    void FileSystem.writeAsStringAsync(LANGUAGE_STORAGE_URI, language).catch(() => {
      // Ignore storage write issues so language switching still works in memory.
    });
  }, [hasLoadedStoredLanguage, language]);

  const t = (key: string, params?: TranslationParams) => {
    const value = resolveTranslation(language, key) ?? resolveTranslation('en', key);

    return typeof value === 'string' ? interpolate(value, params) : key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useI18n must be used inside LanguageProvider');
  }

  return context;
}
