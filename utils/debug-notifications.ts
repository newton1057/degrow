/**
 * Utilidades de debugging para notificaciones
 * SOLO PARA DESARROLLO - Eliminar en producción
 */

export async function debugScheduledNotifications() {
  try {
    const Notifications = await import('expo-notifications');
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 NOTIFICACIONES PROGRAMADAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${scheduled.length}`);
    
    const habitReminders = scheduled.filter(n => n.identifier.startsWith('habit-reminder-'));
    const timerNotifications = scheduled.filter(n => n.identifier.startsWith('habit-timer-'));
    
    console.log(`\n📌 Recordatorios de hábitos: ${habitReminders.length}`);
    habitReminders.forEach((notification, index) => {
      console.log(`\n  [${index + 1}] ${notification.identifier}`);
      console.log(`      Título: ${notification.content.title}`);
      console.log(`      Cuerpo: ${notification.content.body}`);
      console.log(`      Trigger:`, notification.trigger);
    });
    
    console.log(`\n⏱️  Notificaciones de timer: ${timerNotifications.length}`);
    timerNotifications.forEach((notification, index) => {
      console.log(`\n  [${index + 1}] ${notification.identifier}`);
      console.log(`      Título: ${notification.content.title}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return {
      total: scheduled.length,
      habitReminders: habitReminders.length,
      timerNotifications: timerNotifications.length,
      scheduled
    };
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    return null;
  }
}

export async function debugNotificationPermissions() {
  try {
    const Notifications = await import('expo-notifications');
    const permissions = await Notifications.getPermissionsAsync();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 PERMISOS DE NOTIFICACIONES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status:', permissions.status);
    console.log('Granted:', permissions.granted);
    console.log('Can ask again:', permissions.canAskAgain);
    
    if (permissions.ios) {
      console.log('\niOS Permissions:');
      console.log('  Status:', permissions.ios.status);
      console.log('  Allow alert:', permissions.ios.allowsAlert);
      console.log('  Allow badge:', permissions.ios.allowsBadge);
      console.log('  Allow sound:', permissions.ios.allowsSound);
    }
    
    if (permissions.android) {
      console.log('\nAndroid Permissions:');
      console.log('  Importance:', permissions.android.importance);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return permissions;
  } catch (error) {
    console.error('❌ Error al obtener permisos:', error);
    return null;
  }
}

export async function debugCancelAllNotifications() {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Todas las notificaciones canceladas');
    return true;
  } catch (error) {
    console.error('❌ Error al cancelar notificaciones:', error);
    return false;
  }
}

export async function debugScheduleTestNotification() {
  try {
    const Notifications = await import('expo-notifications');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Notification',
        body: 'Esta es una notificación de prueba',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5, // En 5 segundos
      },
    });
    
    console.log('✅ Notificación de prueba programada para 5 segundos');
    return true;
  } catch (error) {
    console.error('❌ Error al programar notificación de prueba:', error);
    return false;
  }
}

// Función para usar en Settings (temporal)
export const notificationDebugTools = {
  logScheduled: debugScheduledNotifications,
  logPermissions: debugNotificationPermissions,
  cancelAll: debugCancelAllNotifications,
  scheduleTest: debugScheduleTestNotification,
};
