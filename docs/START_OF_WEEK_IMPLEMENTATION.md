# Start of Week - Implementación

## ✅ Funcionalidad Implementada

El usuario ahora puede seleccionar qué día comienza su semana de seguimiento de hábitos.

## 🎯 Archivos Modificados/Creados

### 1. **`services/user-settings.ts`** (Actualizado)
- Agregado `startOfWeek: DayKey` al tipo `UserSettings`
- Valor por defecto: `'sat'` (Saturday)
- Se guarda en Firestore

### 2. **`app/start-of-week.tsx`** (Nuevo)
- Pantalla de selección de día
- Lista de 7 días (Sat → Fri)
- Muestra día seleccionado con checkmark
- Guarda selección en Firestore
- Regresa automáticamente después de seleccionar

### 3. **`app/settings.tsx`** (Actualizado)
- Botón "Start of Week" ahora es clickeable
- Muestra el día actualmente seleccionado
- Navega a `/start-of-week`

### 4. **`app/_layout.tsx`** (Actualizado)
- Agregada ruta `start-of-week`

### 5. **`providers/language-provider.tsx`** (Actualizado)
- Traducciones en inglés y español

## 📊 Estructura en Firestore

```typescript
users/{userId}/settings/preferences
{
  experience: {
    startOfWeek: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
  }
}
```

## 🔄 Flujo de Usuario

```
1. Usuario va a Settings
2. Tap en "Start of Week" (muestra día actual)
3. Abre pantalla de selección
4. Ve lista de 7 días
5. Selecciona un día
6. Se guarda en Firestore
7. Regresa automáticamente a Settings
8. Settings muestra el nuevo día seleccionado
```

## 🎨 UI/UX

### Pantalla de Selección
- **Hero card** con ícono de calendario
- **Lista de días** con:
  - Nombre completo (ej: "Saturday")
  - Abreviación (ej: "Sat")
  - Checkmark en el día seleccionado
  - Día seleccionado con fondo de color accent
- **Info card** explicando que cambiará el ciclo

### Feedback Visual
- Haptic feedback al seleccionar
- Animación de opacidad al presionar
- Delay de 200ms antes de regresar (para ver selección)

## ⚠️ Nota Importante

**Actualmente, cambiar el día de inicio NO afecta el cálculo de semanas.**

### Lo que SÍ funciona:
- ✅ Guardar preferencia del usuario
- ✅ Mostrar día seleccionado en Settings
- ✅ Persistir en Firestore

### Lo que NO funciona (aún):
- ❌ Recalcular `weekId` basado en el día seleccionado
- ❌ Actualizar `buildWeekDays()` para usar el día correcto
- ❌ Reiniciar progreso de semana al cambiar

## 🔧 Para Implementar Completamente

Para que el cambio de día afecte el seguimiento, necesitas:

### 1. Actualizar `constants/habits.ts`

```typescript
// Función actual (hardcoded a Saturday)
export function getWeekStartDate(date = new Date()) {
  const start = new Date(date);
  const currentDay = date.getDay();
  const daysSinceSaturday = currentDay === 6 ? 0 : currentDay + 1;
  // ...
}

// Función mejorada (usa startOfWeek del usuario)
export function getWeekStartDate(date = new Date(), startOfWeek: DayKey = 'sat') {
  const start = new Date(date);
  const currentDay = date.getDay();
  const startDayNumber = DAY_KEY_TO_JS_DAY[startOfWeek];
  
  let daysSinceStart = currentDay - startDayNumber;
  if (daysSinceStart < 0) {
    daysSinceStart += 7;
  }
  
  start.setHours(0, 0, 0, 0);
  start.setDate(date.getDate() - daysSinceStart);
  
  return start;
}
```

### 2. Pasar `startOfWeek` a funciones de hábitos

```typescript
// En HabitsProvider
const { settings } = useSettings();
const currentWeekId = useMemo(
  () => getCurrentWeekId(new Date(), settings.experience.startOfWeek),
  [settings.experience.startOfWeek]
);
```

### 3. Detectar cambio y reiniciar semana

```typescript
// En HabitsProvider
useEffect(() => {
  // Si cambió el día de inicio, reiniciar semana
  const newWeekId = getCurrentWeekId(new Date(), settings.experience.startOfWeek);
  
  if (newWeekId !== currentWeekId) {
    // Reiniciar días de todos los hábitos
    setHabits(habits => habits.map(habit => ({
      ...habit,
      days: buildWeekDays({}, new Date(), settings.experience.startOfWeek)
    })));
  }
}, [settings.experience.startOfWeek]);
```

## 🧪 Testing

### Verificar que funciona:

1. **Ir a Settings**
   - Verificar que muestra "Saturday" (por defecto)

2. **Cambiar a Monday**
   ```
   Settings → Start of Week → Monday
   ```

3. **Verificar cambio**
   - Regresar a Settings
   - Debe mostrar "Monday"

4. **Verificar persistencia**
   - Cerrar app
   - Reabrir app
   - Ir a Settings
   - Debe seguir mostrando "Monday"

5. **Verificar Firestore**
   ```typescript
   users/{userId}/settings/preferences
   {
     experience: {
       startOfWeek: 'mon'
     }
   }
   ```

## 📝 Valores Posibles

```typescript
type DayKey = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
```

| Valor | Día |
|-------|-----|
| `sat` | Saturday (Sábado) |
| `sun` | Sunday (Domingo) |
| `mon` | Monday (Lunes) |
| `tue` | Tuesday (Martes) |
| `wed` | Wednesday (Miércoles) |
| `thu` | Thursday (Jueves) |
| `fri` | Friday (Viernes) |

## 🌍 Casos de Uso Comunes

### Por Región:
- **USA/Canada**: Sunday o Monday
- **Europe**: Monday
- **Middle East**: Saturday o Sunday
- **Latin America**: Monday o Sunday

### Por Preferencia:
- **Trabajo**: Monday (inicio de semana laboral)
- **Religioso**: Sunday (día de descanso)
- **Personal**: Cualquier día que prefiera el usuario

## ✅ Estado Actual

- [x] UI para seleccionar día
- [x] Guardar en Firestore
- [x] Mostrar en Settings
- [x] Persistir entre sesiones
- [x] Traducciones EN/ES
- [ ] Afectar cálculo de semanas (pendiente)
- [ ] Reiniciar progreso al cambiar (pendiente)

## 🚀 Próximos Pasos

Si quieres que el cambio de día afecte el seguimiento:

1. Modificar `getWeekStartDate()` para aceptar `startOfWeek`
2. Modificar `getCurrentWeekId()` para aceptar `startOfWeek`
3. Modificar `buildWeekDays()` para aceptar `startOfWeek`
4. Actualizar `HabitsProvider` para usar `settings.experience.startOfWeek`
5. Detectar cambios y reiniciar semana cuando cambie

Por ahora, la funcionalidad está **parcialmente implementada**:
- ✅ Usuario puede seleccionar su preferencia
- ✅ Se guarda y persiste
- ❌ No afecta el cálculo de semanas (aún usa Saturday hardcoded)
