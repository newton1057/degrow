# Settings - Estado de Funcionalidades

**Fecha de revisión**: Abril 16, 2026

## ✅ Funcionalidades que SÍ funcionan

### 1. **Navegación**
- ✅ Botón de regresar (back button)
- ✅ Header con título centrado

### 2. **Apariencia (Appearance)**
- ✅ Selector de tema: System / Light / Dark
- ✅ Cambio de tema funciona en tiempo real
- ✅ Persistencia del tema seleccionado
- ✅ Implementado en `ThemeProvider`

### 3. **Idioma (Language)**
- ✅ Selector de idioma: English / Spanish
- ✅ Cambio de idioma funciona en tiempo real
- ✅ Persistencia del idioma seleccionado
- ✅ Implementado en `LanguageProvider`

### 4. **Permisos (Permissions)**
- ✅ Navegación a pantalla de permisos
- ✅ Pantalla `/permissions` existe y funciona
- ✅ Muestra estado de permisos del sistema

### 5. **Privacidad (Privacy)**
- ✅ Navegación a pantalla de privacidad
- ✅ Pantalla `/privacy` existe y funciona
- ✅ Enlaces a Términos y Condiciones
- ✅ Enlaces a Aviso de Privacidad

### 6. **Cerrar Sesión (Sign Out)**
- ✅ Botón funcional
- ✅ Cierra sesión de Firebase Auth
- ✅ Redirige a pantalla de login
- ✅ Limpia estado de usuario

---

## ⚠️ Funcionalidades que NO funcionan (Solo UI)

### 1. **Push Notifications**
- ❌ Toggle solo cambia estado local
- ❌ No persiste la configuración
- ❌ No se conecta con sistema de notificaciones real
- **Estado**: Solo visual, no funcional

### 2. **Daily Habit Reminders**
- ❌ Toggle solo cambia estado local
- ❌ No persiste la configuración
- ❌ No programa notificaciones reales
- **Estado**: Solo visual, no funcional

### 3. **Start of Week**
- ❌ Muestra "Saturday" pero no es editable
- ❌ No hay pantalla para cambiar el día
- ❌ No persiste la configuración
- ❌ No afecta el cálculo de semanas en la app
- **Estado**: Solo visual, no funcional

### 4. **Haptics**
- ❌ Toggle solo cambia estado local
- ❌ No persiste la configuración
- ❌ No desactiva los hápticos en la app
- **Estado**: Solo visual, no funcional
- **Nota**: Los hápticos actualmente siempre están activos

### 5. **Weekly Review**
- ❌ Toggle solo cambia estado local
- ❌ No persiste la configuración
- ❌ No existe funcionalidad de revisión semanal
- **Estado**: Solo visual, no funcional

### 6. **Profile**
- ❌ Muestra "Personal" pero no es editable
- ❌ No navega a ninguna pantalla
- ❌ No hay pantalla de edición de perfil
- **Estado**: Solo visual, no funcional
- **Nota**: El perfil se edita desde la pantalla Profile (foto)

### 7. **Export Data**
- ❌ Muestra "Available" pero no es editable
- ❌ No navega a ninguna pantalla
- ❌ No existe funcionalidad de exportación
- **Estado**: Solo visual, no funcional

---

## 📊 Resumen

| Categoría | Funcionales | No Funcionales | Total |
|-----------|-------------|----------------|-------|
| **Navegación** | 2 | 0 | 2 |
| **Preferencias** | 2 | 0 | 2 |
| **Toggles** | 0 | 4 | 4 |
| **Pantallas** | 2 | 2 | 4 |
| **Acciones** | 1 | 1 | 2 |
| **TOTAL** | **7** | **7** | **14** |

**Porcentaje funcional**: 50%

---

## 🔧 Recomendaciones para implementar

### Prioridad Alta
1. **Push Notifications**: Integrar con `NotificationsProvider` existente
2. **Daily Habit Reminders**: Conectar con sistema de recordatorios por hábito
3. **Haptics**: Crear provider global para controlar hápticos

### Prioridad Media
4. **Export Data**: Implementar exportación a JSON/CSV
5. **Start of Week**: Crear selector y actualizar lógica de semanas
6. **Profile Edit**: Crear pantalla de edición de perfil completa

### Prioridad Baja
7. **Weekly Review**: Implementar pantalla de revisión semanal

---

## 💾 Estado de Persistencia

### Datos que SÍ se persisten:
- ✅ Tema (System/Light/Dark) → `FileSystem`
- ✅ Idioma (EN/ES) → `FileSystem`
- ✅ Usuario autenticado → Firebase Auth + `FileSystem`
- ✅ Hábitos → Firestore + `FileSystem` (cache)

### Datos que NO se persisten:
- ❌ Notificaciones habilitadas
- ❌ Recordatorios diarios habilitados
- ❌ Hápticos habilitados
- ❌ Revisión semanal habilitada
- ❌ Día de inicio de semana

---

## 🗂️ Estructura de datos sugerida para Firestore

Para implementar las funcionalidades faltantes, se sugiere esta estructura:

```typescript
// users/{userId}/settings/preferences
{
  notifications: {
    pushEnabled: boolean,
    dailyRemindersEnabled: boolean,
  },
  experience: {
    hapticsEnabled: boolean,
    weeklyReviewEnabled: boolean,
    startOfWeek: 'sat' | 'sun' | 'mon',
  },
  updatedAt: Timestamp
}
```

---

## 📝 Notas adicionales

1. **Notificaciones**: El `NotificationsProvider` ya existe pero no está conectado con Settings
2. **Hápticos**: Se usan en toda la app pero no hay control global
3. **Inicio de semana**: Actualmente hardcodeado a "Saturday" en `constants/habits.ts`
4. **Perfil**: La edición de foto funciona desde Profile, pero no hay edición de nombre/email
5. **Exportación**: Sería útil exportar hábitos, progreso y estadísticas
