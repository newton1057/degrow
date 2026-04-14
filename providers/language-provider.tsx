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
      defaultName: 'Demo User',
      noEmail: 'No email yet',
      addPhoto: 'Add photo',
      changePhoto: 'Change photo',
      photoOptionsTitle: 'Profile photo',
      photoOptionsSubtitle: 'Update your avatar with a fresh photo.',
      takePhoto: 'Take photo',
      takePhotoDescription: 'Open the camera now.',
      chooseFromLibrary: 'Choose from library',
      chooseFromLibraryDescription: 'Pick an image from your gallery.',
      cancel: 'Cancel',
      photoPermissionTitle: 'Photo access needed',
      photoPermissionMessage: 'Allow photo library access to choose a profile picture.',
      cameraPermissionTitle: 'Camera access needed',
      cameraPermissionMessage: 'Allow camera access to take a profile picture.',
      photoUnavailableTitle: 'Profile photos unavailable',
      photoUnavailableMessage: 'Rebuild the development app after enabling image picker and camera permissions.',
      photoUploadErrorTitle: 'Photo not saved',
      photoUploadErrorMessage: 'Check your connection and try uploading the profile photo again.',
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
        permissionsTitle: 'Permissions',
        permissionsDescription: 'Review notification, camera, and photo library access.',
        privacyTitle: 'Privacy',
        privacyDescription: 'Review local storage and data handling preferences.',
      },
      values: {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
        personal: 'Personal',
        available: 'Available',
        manage: 'Manage',
        review: 'Review',
      },
      languageDescription: 'Choose the language used across DeGrow.',
    },
    permissions: {
      title: 'Permissions',
      heroTitle: 'System access',
      heroSubtitle: 'Control the access DeGrow needs for reminders and profile photos.',
      notificationsTitle: 'Notifications',
      notificationsDescription: 'Used for habit reminders and focus timer completion alerts.',
      cameraTitle: 'Camera',
      cameraDescription: 'Used only when you take a new profile photo.',
      photosTitle: 'Photo Library',
      photosDescription: 'Used only when you choose a profile image from your gallery.',
      status: {
        granted: 'Allowed',
        limited: 'Limited',
        denied: 'Blocked',
        unknown: 'Not set',
        unavailable: 'Unavailable',
      },
      actions: {
        allow: 'Allow',
        openSettings: 'Open Settings',
        refresh: 'Refresh',
      },
      unavailableDescription: 'Rebuild the development app to include this native permission module.',
      openSettingsHint: 'If a permission is blocked, open iOS Settings to enable it again.',
    },
    newHabit: {
      title: 'New Habit',
      draft: 'Draft',
      defaults: {
        habitName: 'Read for 10 minutes',
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
        sessionLength: 'Session length',
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
      session: {
        description: 'Use this as the default focus timer when you start the habit.',
        minuteShort: '{minutes} min',
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
    auth: {
      logInTitle: 'Log In',
      logInSubtitle: 'Welcome back. Enter your credentials to access your account.',
      signUpTitle: 'Sign Up',
      signUpSubtitle: 'Create an account to start tracking and improving your habits.',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      nameLabel: 'Name',
      namePlaceholder: 'Enter your name',
      logInAction: 'Log In',
      signUpAction: 'Sign Up',
      noAccount: "Don't have an account?",
      goToSignUp: 'Sign Up',
      hasAccount: 'Already have an account?',
      goToLogIn: 'Log In',
      signOut: 'Sign Out',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
      orContinueWith: 'Or continue with',
      requiredFieldsTitle: 'Missing details',
      requiredFieldsMessage: 'Fill in the required fields to continue.',
      logInErrorTitle: 'Could not log in',
      signUpErrorTitle: 'Could not create account',
      errorInvalidCredentials: 'Check your email and password, then try again.',
      errorInvalidEmail: 'Enter a valid email address.',
      errorEmailAuthDisabled: 'Email and password login is not enabled in Firebase Authentication yet.',
      errorEmailInUse: 'That email is already registered. Try logging in instead.',
      errorWeakPassword: 'Use a password with at least 6 characters.',
      errorGeneric: 'Something went wrong. Try again in a moment.',
      socialUnavailableTitle: 'Social login unavailable',
      socialUnavailableMessage: 'Google and Apple login are not configured yet. Use email and password for now.',
    },
    notifications: {
      habitReminderTitle: 'Time for your habit',
      habitReminderBody: 'Start your {habit} session now.',
      timerCompleteTitle: 'Focus session complete',
      timerCompleteBody: 'You completed {minutes} minutes of {habit}.',
    },
    timer: {
      title: 'Focus Session',
      subtitle: 'Start the timer when you begin. Completing it marks today as done.',
      target: 'Target: {minutes} min',
      setDuration: 'Set duration',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      finish: 'Finish',
      completed: 'Completed',
      doneToday: 'Marked as done for today.',
      missingHabit: 'Habit not found.',
      minutesLabel: '{minutes} min',
      backToHabits: 'Back to habits',
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
      defaultName: 'Usuario demo',
      noEmail: 'Sin correo todavía',
      addPhoto: 'Agregar foto',
      changePhoto: 'Cambiar foto',
      photoOptionsTitle: 'Foto de perfil',
      photoOptionsSubtitle: 'Actualiza tu avatar con una foto nueva.',
      takePhoto: 'Tomar foto',
      takePhotoDescription: 'Abrir la cámara ahora.',
      chooseFromLibrary: 'Elegir de galería',
      chooseFromLibraryDescription: 'Elegir una imagen de tu galería.',
      cancel: 'Cancelar',
      photoPermissionTitle: 'Se necesita acceso a fotos',
      photoPermissionMessage: 'Permite el acceso a tu galería para elegir una foto de perfil.',
      cameraPermissionTitle: 'Se necesita acceso a cámara',
      cameraPermissionMessage: 'Permite el acceso a la cámara para tomar una foto de perfil.',
      photoUnavailableTitle: 'Fotos de perfil no disponibles',
      photoUnavailableMessage: 'Reconstruye la app de desarrollo después de habilitar image picker y permisos de cámara.',
      photoUploadErrorTitle: 'No se guardó la foto',
      photoUploadErrorMessage: 'Revisa tu conexión e intenta subir la foto de perfil otra vez.',
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
        permissionsTitle: 'Permisos',
        permissionsDescription: 'Revisa acceso a notificaciones, cámara y galería.',
        privacyTitle: 'Privacidad',
        privacyDescription: 'Revisa almacenamiento local y preferencias de manejo de datos.',
      },
      values: {
        system: 'Sistema',
        light: 'Claro',
        dark: 'Oscuro',
        personal: 'Personal',
        available: 'Disponible',
        manage: 'Gestionar',
        review: 'Revisar',
      },
      languageDescription: 'Elige el idioma que usará DeGrow.',
    },
    permissions: {
      title: 'Permisos',
      heroTitle: 'Acceso del sistema',
      heroSubtitle: 'Controla los accesos que DeGrow necesita para recordatorios y fotos de perfil.',
      notificationsTitle: 'Notificaciones',
      notificationsDescription: 'Se usan para recordatorios de hábitos y alertas del temporizador.',
      cameraTitle: 'Cámara',
      cameraDescription: 'Se usa solo cuando tomas una nueva foto de perfil.',
      photosTitle: 'Galería',
      photosDescription: 'Se usa solo cuando eliges una imagen de perfil desde tu galería.',
      status: {
        granted: 'Permitido',
        limited: 'Limitado',
        denied: 'Bloqueado',
        unknown: 'Sin configurar',
        unavailable: 'No disponible',
      },
      actions: {
        allow: 'Permitir',
        openSettings: 'Abrir Ajustes',
        refresh: 'Actualizar',
      },
      unavailableDescription: 'Reconstruye la app de desarrollo para incluir este módulo nativo de permisos.',
      openSettingsHint: 'Si un permiso está bloqueado, abre Ajustes de iOS para habilitarlo otra vez.',
    },
    newHabit: {
      title: 'Nuevo hábito',
      draft: 'Borrador',
      defaults: {
        habitName: 'Leer 10 minutos',
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
        sessionLength: 'Duración de sesión',
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
      session: {
        description: 'Usa esto como el temporizador predeterminado cuando empieces el hábito.',
        minuteShort: '{minutes} min',
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
    auth: {
      logInTitle: 'Iniciar Sesión',
      logInSubtitle: 'Bienvenido de vuelta. Ingresa tus datos para acceder.',
      signUpTitle: 'Crear Cuenta',
      signUpSubtitle: 'Crea una cuenta para empezar a rastrear y mejorar tus hábitos.',
      emailLabel: 'Correo Electrónico',
      emailPlaceholder: 'Ingresa tu correo',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Ingresa tu contraseña',
      nameLabel: 'Nombre',
      namePlaceholder: 'Ingresa tu nombre',
      logInAction: 'Iniciar Sesión',
      signUpAction: 'Crear Cuenta',
      noAccount: '¿No tienes una cuenta?',
      goToSignUp: 'Regístrate',
      hasAccount: '¿Ya tienes una cuenta?',
      goToLogIn: 'Inicia Sesión',
      signOut: 'Cerrar Sesión',
      continueWithGoogle: 'Continuar con Google',
      continueWithApple: 'Continuar con Apple',
      orContinueWith: 'O continuar con',
      requiredFieldsTitle: 'Faltan datos',
      requiredFieldsMessage: 'Completa los campos requeridos para continuar.',
      logInErrorTitle: 'No se pudo iniciar sesión',
      signUpErrorTitle: 'No se pudo crear la cuenta',
      errorInvalidCredentials: 'Revisa tu correo y contraseña, e intenta de nuevo.',
      errorInvalidEmail: 'Ingresa un correo electrónico válido.',
      errorEmailAuthDisabled: 'El inicio con correo y contraseña todavía no está habilitado en Firebase Authentication.',
      errorEmailInUse: 'Ese correo ya está registrado. Intenta iniciar sesión.',
      errorWeakPassword: 'Usa una contraseña de al menos 6 caracteres.',
      errorGeneric: 'Algo salió mal. Intenta de nuevo en un momento.',
      socialUnavailableTitle: 'Inicio social no disponible',
      socialUnavailableMessage: 'Google y Apple todavía no están configurados. Usa correo y contraseña por ahora.',
    },
    notifications: {
      habitReminderTitle: 'Hora de tu hábito',
      habitReminderBody: 'Empieza tu sesión de {habit} ahora.',
      timerCompleteTitle: 'Sesión completada',
      timerCompleteBody: 'Completaste {minutes} minutos de {habit}.',
    },
    timer: {
      title: 'Sesión de enfoque',
      subtitle: 'Inicia el temporizador cuando empieces. Al terminar, se marca hoy como completado.',
      target: 'Meta: {minutes} min',
      setDuration: 'Configurar duración',
      start: 'Iniciar',
      pause: 'Pausar',
      resume: 'Continuar',
      reset: 'Reiniciar',
      finish: 'Finalizar',
      completed: 'Completado',
      doneToday: 'Marcado como completado hoy.',
      missingHabit: 'No se encontró el hábito.',
      minutesLabel: '{minutes} min',
      backToHabits: 'Volver a hábitos',
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
