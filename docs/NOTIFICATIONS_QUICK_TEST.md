# Test Rápido de Notificaciones

## 🚀 Prueba en 5 Minutos

### 1. Agregar Debug Temporal (Opcional)

En `app/settings.tsx`, después de los imports:

```typescript
import { notificationDebugTools } from '@/utils/debug-notifications';
```

Agregar botón temporal antes del botón de Sign Out:

```typescript
{__DEV__ && (
  <Pressable
    onPress={async () => {
      await notificationDebugTools.logScheduled();
      await notificationDebugTools.logPermissions();
    }}
    style={[styles.signOutButton, { backgroundColor: colors.surfaceAlt }]}
  >
    <Ionicons name="bug" size={20} color={colors.tint} />
    <Text style={[styles.signOutText, { color: colors.tint }]}>
      Debug Notifications
    </Text>
  </Pressable>
)}
```

### 2. Test Básico

**Paso 1:** Abrir Settings
- Verificar que "Push Notifications" esté ON
- Verificar que "Daily Habit Reminders" esté ON

**Paso 2:** Crear hábito de prueba
```
1. Ir a "My Habits"
2. Tap en "+" (crear hábito)
3. Nombre: "Test Notification"
4. Activar "Daily Reminder"
5. Hora: 2 minutos en el futuro
6. Guardar
```

**Paso 3:** Verificar programación (si agregaste debug)
```
1. Ir a Settings
2. Tap "Debug Notifications"
3. Ver consola: debe mostrar 1+ notificaciones programadas
```

**Paso 4:** Esperar notificación
```
1. Esperar 2 minutos
2. Debe llegar notificación con:
   - Título: "Time for your habit"
   - Cuerpo: "Test Notification"
```

**Paso 5:** Desactivar
```
1. Ir a Settings
2. Desactivar "Push Notifications"
3. Tap "Debug Notifications" (si lo agregaste)
4. Ver consola: debe mostrar 0 recordatorios de hábitos
```

**Paso 6:** Reactivar
```
1. Activar "Push Notifications"
2. Tap "Debug Notifications"
3. Ver consola: debe mostrar notificaciones programadas nuevamente
```

## ✅ Resultado Esperado

### Cuando está ACTIVADO:
```
📅 NOTIFICACIONES PROGRAMADAS
Total: 1 (o más)

📌 Recordatorios de hábitos: 1
  [1] habit-reminder-{habitId}-{day}
      Título: Time for your habit
      Cuerpo: Test Notification
      Trigger: { weekday: 2, hour: 19, minute: 0 }
```

### Cuando está DESACTIVADO:
```
📅 NOTIFICACIONES PROGRAMADAS
Total: 0

📌 Recordatorios de hábitos: 0
```

## 🐛 Si algo falla

### No llegan notificaciones

1. **Verificar permisos:**
```typescript
// En consola debe mostrar:
Status: granted
Granted: true
```

Si no:
- iOS: Settings → DeGrow → Notifications → Allow
- Android: Settings → Apps → DeGrow → Notifications → Allow

2. **Verificar que el hábito tenga reminder:**
```typescript
// El hábito debe tener:
reminderEnabled: true
reminderMinutes: 1140 // (19 * 60)
scheduledDays: ['mon', 'tue', ...] // Incluir hoy
```

3. **Verificar Firestore:**
```
users/{userId}/settings/preferences
{
  notifications: {
    pushEnabled: true,
    dailyRemindersEnabled: true
  }
}
```

### Los toggles no guardan

1. **Verificar autenticación:**
```typescript
const { user } = useAuth();
console.log('User ID:', user?.id); // Debe tener valor
```

2. **Verificar SettingsProvider:**
```typescript
const { settings } = useSettings();
console.log('Settings:', settings); // Debe mostrar objeto
```

3. **Verificar Firestore rules:**
```javascript
// Debe permitir escritura
match /users/{userId}/settings/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```

## 🎯 Checklist Mínimo

- [ ] Toggle cambia visualmente
- [ ] Notificación llega en 2 minutos
- [ ] Al desactivar, no llegan más notificaciones
- [ ] Al reactivar, vuelven a programarse
- [ ] Estado persiste al cerrar/abrir app

## 📱 Probar en Dispositivo Real

**Importante:** Las notificaciones funcionan diferente en simulador vs dispositivo real.

**iOS Simulator:**
- ✅ Programa notificaciones
- ❌ NO muestra banners (limitación del simulador)
- ✅ Puedes ver en logs que se programan

**iOS Device:**
- ✅ Programa notificaciones
- ✅ Muestra banners
- ✅ Funciona completamente

**Android Emulator:**
- ✅ Programa notificaciones
- ✅ Muestra notificaciones
- ✅ Funciona completamente

**Android Device:**
- ✅ Programa notificaciones
- ✅ Muestra notificaciones
- ✅ Funciona completamente

## 🔧 Comandos Útiles

### Ver logs en tiempo real

**iOS:**
```bash
npx react-native log-ios
```

**Android:**
```bash
npx react-native log-android
```

### Limpiar notificaciones programadas

En la app, agregar botón temporal:
```typescript
<Pressable onPress={async () => {
  await notificationDebugTools.cancelAll();
  console.log('✅ Todas las notificaciones canceladas');
}}>
  <Text>Clear All Notifications</Text>
</Pressable>
```

### Programar notificación de prueba inmediata

```typescript
<Pressable onPress={async () => {
  await notificationDebugTools.scheduleTest();
  console.log('⏰ Notificación en 5 segundos...');
}}>
  <Text>Test Notification (5s)</Text>
</Pressable>
```

## ✨ Todo Funciona Si...

1. ✅ Los toggles cambian y guardan
2. ✅ Las notificaciones llegan en el horario correcto
3. ✅ Al desactivar, se cancelan todas
4. ✅ Al reactivar, se re-programan
5. ✅ El estado persiste entre sesiones
6. ✅ Funciona con múltiples hábitos
7. ✅ Respeta los días programados del hábito

**Si todo esto funciona, el sistema está 100% operativo! 🎉**
