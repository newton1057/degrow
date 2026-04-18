# Verificación del Sistema de Notificaciones

## ✅ Checklist de Implementación

### 1. Archivos Creados/Modificados

- [x] `services/user-settings.ts` - Servicio de configuración
- [x] `providers/settings-provider.tsx` - Provider de settings
- [x] `providers/notifications-provider.tsx` - Actualizado para usar settings
- [x] `app/settings.tsx` - Actualizado con toggles funcionales
- [x] `app/_layout.tsx` - SettingsProvider agregado

### 2. Orden de Providers (Crítico)

```typescript
<LanguageProvider>
  <AppThemeProvider>
    <AuthProvider>
      <SettingsProvider>        // ← Debe estar ANTES de NotificationsProvider
        <HabitsProvider>
          <NotificationsProvider> // ← Usa settings de SettingsProvider
            ...
```

✅ **Orden correcto implementado**

### 3. Flujo de Datos

```
Settings UI
    ↓
useSettings().updateSettings()
    ↓
Firestore: users/{userId}/settings/preferences
    ↓
SettingsProvider (listener en tiempo real)
    ↓
NotificationsProvider (useEffect detecta cambio)
    ↓
cancelHabitReminderNotifications() o syncHabitReminderNotifications()
    ↓
Expo Notifications (sistema nativo)
```

## 🧪 Pasos para Verificar

### Paso 1: Verificar Estado Inicial

1. Abrir la app
2. Ir a Settings
3. Verificar que los toggles muestren el estado correcto:
   - Push Notifications: ON (por defecto)
   - Daily Habit Reminders: ON (por defecto)

### Paso 2: Crear un Hábito con Recordatorio

1. Ir a "My Habits"
2. Crear nuevo hábito
3. Activar "Daily Reminder"
4. Configurar hora: **2 minutos en el futuro**
5. Guardar hábito

### Paso 3: Verificar Notificación Programada

**En desarrollo, puedes verificar con:**

```typescript
// Agregar temporalmente en NotificationsProvider después de syncHabitReminderNotifications
const Notifications = await import('expo-notifications');
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('📅 Notificaciones programadas:', scheduled.length);
scheduled.forEach(n => {
  console.log('  -', n.identifier, n.content.title);
});
```

**Resultado esperado:**
- Debe haber al menos 1 notificación programada
- Identificador debe empezar con `habit-reminder-`

### Paso 4: Esperar la Notificación

1. Esperar 2 minutos
2. La notificación debe aparecer con:
   - Título: "Time for your habit"
   - Cuerpo: Nombre del hábito

### Paso 5: Desactivar Notificaciones

1. Ir a Settings
2. Desactivar "Push Notifications"
3. **Verificar en consola:**

```typescript
// Debe aparecer en logs
console.log('🔕 Cancelando notificaciones...');
```

### Paso 6: Verificar Cancelación

**Verificar con:**

```typescript
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
const habitReminders = scheduled.filter(n => n.identifier.startsWith('habit-reminder-'));
console.log('📅 Recordatorios de hábitos:', habitReminders.length); // Debe ser 0
```

**Resultado esperado:**
- No debe haber notificaciones de tipo `habit-reminder-*`
- Las notificaciones de timer pueden seguir existiendo

### Paso 7: Reactivar Notificaciones

1. Activar "Push Notifications" nuevamente
2. Verificar que se re-programen las notificaciones
3. Debe haber notificaciones programadas nuevamente

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Los toggles no guardan el estado

**Síntomas:**
- Toggle cambia pero vuelve al estado anterior
- No se guarda en Firestore

**Verificar:**
```typescript
// En app/settings.tsx
const { settings, updateSettings } = useSettings();
console.log('Current settings:', settings);
```

**Solución:**
- Verificar que SettingsProvider esté montado
- Verificar que el usuario esté autenticado
- Revisar reglas de Firestore

### Problema 2: Las notificaciones no se cancelan

**Síntomas:**
- Desactivo toggle pero siguen llegando notificaciones

**Verificar:**
```typescript
// En NotificationsProvider
useEffect(() => {
  console.log('🔔 Settings changed:', settings.notifications);
  if (!settings.notifications.pushEnabled) {
    console.log('🔕 Canceling notifications...');
  }
}, [settings.notifications]);
```

**Solución:**
- Verificar que el useEffect se ejecute
- Verificar que `cancelHabitReminderNotifications()` se llame
- Forzar cierre de app y reabrir

### Problema 3: Las notificaciones no se programan

**Síntomas:**
- Activo toggle pero no llegan notificaciones

**Verificar:**
```typescript
// Permisos del sistema
const { status } = await Notifications.getPermissionsAsync();
console.log('📱 Permission status:', status);
```

**Solución:**
- Solicitar permisos: Settings del dispositivo → DeGrow → Notifications
- Verificar que el hábito tenga `reminderEnabled: true`
- Verificar que el hábito esté programado para hoy

### Problema 4: Error "Cannot find name 'SettingsProvider'"

**Síntomas:**
- Error de compilación en _layout.tsx

**Solución:**
```typescript
// Verificar import en app/_layout.tsx
import { SettingsProvider } from '@/providers/settings-provider';
```

## 📊 Estados Esperados

### Estado 1: Notificaciones Activas
```typescript
settings = {
  notifications: {
    pushEnabled: true,
    dailyRemindersEnabled: true
  }
}
// Resultado: Notificaciones programadas ✅
```

### Estado 2: Push Desactivado
```typescript
settings = {
  notifications: {
    pushEnabled: false,  // ← OFF
    dailyRemindersEnabled: true
  }
}
// Resultado: Sin notificaciones ❌
```

### Estado 3: Daily Reminders Desactivado
```typescript
settings = {
  notifications: {
    pushEnabled: true,
    dailyRemindersEnabled: false  // ← OFF
  }
}
// Resultado: Sin notificaciones ❌
```

### Estado 4: Ambos Desactivados
```typescript
settings = {
  notifications: {
    pushEnabled: false,
    dailyRemindersEnabled: false
  }
}
// Resultado: Sin notificaciones ❌
```

## 🔍 Debugging Avanzado

### Ver todas las notificaciones programadas

```typescript
import * as Notifications from 'expo-notifications';

const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('Total scheduled:', scheduled.length);

scheduled.forEach((notification, index) => {
  console.log(`\n[${index + 1}] ${notification.identifier}`);
  console.log('  Title:', notification.content.title);
  console.log('  Body:', notification.content.body);
  console.log('  Trigger:', notification.trigger);
  console.log('  Data:', notification.content.data);
});
```

### Ver estado de Firestore

```typescript
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/services/firebase';

const userId = 'YOUR_USER_ID';
const settingsRef = doc(firestore, 'users', userId, 'settings', 'preferences');
const snapshot = await getDoc(settingsRef);
console.log('Firestore settings:', snapshot.data());
```

### Forzar sincronización

```typescript
// En Settings screen, agregar botón temporal
<Pressable onPress={async () => {
  await updateSettings({
    notifications: {
      pushEnabled: true,
      dailyRemindersEnabled: true
    }
  });
  console.log('✅ Settings forced update');
}}>
  <Text>Force Sync</Text>
</Pressable>
```

## ✅ Checklist Final

Antes de considerar que funciona correctamente:

- [ ] Los toggles cambian visualmente
- [ ] Los cambios se guardan en Firestore
- [ ] Las notificaciones se programan al activar
- [ ] Las notificaciones se cancelan al desactivar
- [ ] Las notificaciones llegan en el horario correcto
- [ ] El estado persiste al cerrar y reabrir la app
- [ ] Funciona en modo desarrollo
- [ ] Funciona en build de producción

## 🚀 Próximos Pasos

Si todo funciona:
1. Probar en dispositivo físico (no solo simulador)
2. Probar con múltiples hábitos
3. Probar cambiar horarios de notificaciones
4. Probar con diferentes días de la semana
5. Probar cerrar app y verificar que lleguen notificaciones

## 📝 Notas

- Las notificaciones locales funcionan incluso con la app cerrada
- En iOS, las notificaciones no aparecen si la app está en primer plano (por defecto)
- En Android, las notificaciones siempre aparecen
- Los permisos se solicitan automáticamente la primera vez
