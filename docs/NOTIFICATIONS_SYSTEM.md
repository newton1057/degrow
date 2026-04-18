# Sistema de Notificaciones - DeGrow

## 📱 Cómo Funciona

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Settings UI                           │
│  (Toggle Push Notifications / Daily Reminders)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   SettingsProvider                           │
│  - Maneja estado de configuración                           │
│  - Sincroniza con Firestore                                 │
│  - Actualización optimista                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Firestore Database                           │
│  users/{userId}/settings/preferences                         │
│  {                                                           │
│    notifications: {                                          │
│      pushEnabled: boolean,                                   │
│      dailyRemindersEnabled: boolean                          │
│    }                                                         │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NotificationsProvider                           │
│  - Escucha cambios en settings                              │
│  - Programa/cancela notificaciones según configuración      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Expo Notifications (Native)                        │
│  - Notificaciones locales programadas                       │
│  - Canales de Android                                       │
│  - Permisos del sistema                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes Implementados

### 1. **SettingsProvider** (`providers/settings-provider.tsx`)

**Responsabilidades:**
- Mantener el estado de configuración del usuario
- Sincronizar con Firestore en tiempo real
- Proporcionar función `updateSettings()` para cambios

**Hooks expuestos:**
```typescript
const { settings, isLoading, updateSettings } = useSettings();
```

**Estructura de settings:**
```typescript
{
  notifications: {
    pushEnabled: boolean,        // Master switch para notificaciones
    dailyRemindersEnabled: boolean  // Recordatorios de hábitos
  },
  experience: {
    hapticsEnabled: boolean,
    weeklyReviewEnabled: boolean
  }
}
```

### 2. **UserSettings Service** (`services/user-settings.ts`)

**Funciones:**
- `subscribeToUserSettings()` - Listener en tiempo real de Firestore
- `saveUserSettings()` - Guardar configuración en Firestore
- `DEFAULT_USER_SETTINGS` - Valores por defecto

**Ubicación en Firestore:**
```
users/{userId}/settings/preferences
```

### 3. **NotificationsProvider** (Actualizado)

**Lógica de notificaciones:**

```typescript
// Si pushEnabled O dailyRemindersEnabled están OFF → Cancelar todas
if (!pushEnabled || !dailyRemindersEnabled) {
  cancelHabitReminderNotifications();
  return;
}

// Si ambos están ON → Programar notificaciones
syncHabitReminderNotifications({
  habits: habits.filter(h => h.reminderEnabled),
  // ...
});
```

**Tipos de notificaciones:**

1. **Habit Reminders** (Recordatorios de hábitos)
   - Se programan según `reminderMinutes` de cada hábito
   - Solo para hábitos con `reminderEnabled: true`
   - Respetan `scheduledDays` del hábito
   - Canal: `habit-reminders`

2. **Timer Complete** (Temporizador completado)
   - Se programan cuando inicias un timer
   - Notifican cuando termina la sesión
   - Canal: `habit-timers`

## 🎯 Flujo de Usuario

### Activar Notificaciones

1. Usuario va a Settings
2. Activa "Push Notifications" toggle
3. `updateSettings()` guarda en Firestore
4. `SettingsProvider` actualiza estado local (optimistic)
5. Firestore confirma el cambio
6. `NotificationsProvider` detecta el cambio
7. Llama a `syncHabitReminderNotifications()`
8. Se programan todas las notificaciones de hábitos activos

### Desactivar Notificaciones

1. Usuario desactiva "Push Notifications" toggle
2. `updateSettings()` guarda en Firestore
3. Estado local se actualiza inmediatamente
4. `NotificationsProvider` detecta el cambio
5. Llama a `cancelHabitReminderNotifications()`
6. Todas las notificaciones programadas se cancelan

## 📊 Estados de Notificaciones

| Push Enabled | Daily Reminders | Resultado |
|--------------|-----------------|-----------|
| ✅ ON | ✅ ON | Notificaciones activas |
| ✅ ON | ❌ OFF | Sin notificaciones |
| ❌ OFF | ✅ ON | Sin notificaciones |
| ❌ OFF | ❌ OFF | Sin notificaciones |

**Nota:** Ambos toggles deben estar ON para que las notificaciones funcionen.

## 🔐 Permisos del Sistema

Las notificaciones requieren permisos del sistema operativo:

**iOS:**
- Se solicitan automáticamente la primera vez
- Usuario puede revocar en Settings del sistema
- Tipos: Alert, Badge, Sound

**Android:**
- Se solicitan automáticamente (Android 13+)
- Canales configurados:
  - `habit-reminders`: Importancia HIGH
  - `habit-timers`: Importancia MAX

## 💾 Persistencia

### Firestore
```typescript
users/{userId}/settings/preferences
{
  notifications: {
    pushEnabled: true,
    dailyRemindersEnabled: true
  },
  experience: { ... },
  updatedAt: Timestamp
}
```

### Local (Expo Notifications)
- Las notificaciones programadas se guardan en el sistema
- Persisten entre reinicios de la app
- Se cancelan automáticamente cuando se desinstala la app

## 🧪 Testing

### Verificar que funciona:

1. **Activar notificaciones:**
   ```
   Settings → Push Notifications ON
   Settings → Daily Habit Reminders ON
   ```

2. **Crear un hábito con recordatorio:**
   ```
   New Habit → Daily Reminder ON
   Set time: 2 minutos en el futuro
   ```

3. **Esperar la notificación**
   - Debe llegar en el tiempo programado
   - Debe mostrar título y cuerpo del hábito

4. **Desactivar notificaciones:**
   ```
   Settings → Push Notifications OFF
   ```

5. **Verificar cancelación:**
   - No deben llegar más notificaciones
   - Las programadas se cancelan

### Debug

Ver notificaciones programadas (solo desarrollo):
```typescript
import * as Notifications from 'expo-notifications';

const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('Scheduled notifications:', scheduled);
```

## 🚀 Próximas Mejoras

1. **Notificación de prueba** - Botón para enviar notificación inmediata
2. **Horario silencioso** - No molestar en ciertas horas
3. **Notificaciones de racha** - Celebrar logros
4. **Resumen semanal** - Notificación de progreso
5. **Notificaciones push remotas** - Firebase Cloud Messaging

## 📝 Notas Técnicas

- **Optimistic Updates**: Los cambios se reflejan inmediatamente en UI
- **Sincronización**: Firestore mantiene consistencia entre dispositivos
- **Cancelación masiva**: Se cancelan todas las notificaciones al desactivar
- **Re-programación**: Al cambiar hábitos, se re-sincronizan notificaciones
- **Idioma**: Las notificaciones usan el idioma actual de la app

## 🐛 Troubleshooting

### Las notificaciones no llegan

1. Verificar permisos del sistema
2. Verificar que ambos toggles estén ON
3. Verificar que el hábito tenga `reminderEnabled: true`
4. Verificar que el hábito esté programado para hoy
5. Revisar logs de consola

### Las notificaciones siguen llegando después de desactivar

1. Verificar que el cambio se guardó en Firestore
2. Forzar cierre de la app y reabrir
3. Verificar que `NotificationsProvider` está montado correctamente

### Notificaciones en idioma incorrecto

1. Las notificaciones usan el idioma activo al momento de programarse
2. Cambiar idioma re-programa las notificaciones automáticamente
