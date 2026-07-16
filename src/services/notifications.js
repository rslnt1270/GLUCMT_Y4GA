import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración básica para que las notificaciones se muestren incluso si la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Se requieren permisos de notificación para recordar las dosis de insulina.');
    return false;
  }
  return true;
}

export async function scheduleDailyMealAlarms() {
  const hasPermissions = await requestNotificationPermissions();
  if (!hasPermissions) return;

  // Cancelar todas las alarmas previas para no duplicar
  await Notifications.cancelAllScheduledNotificationsAsync();

  const meals = [
    { hour: 8, minute: 0, title: '🍳 Hora del Desayuno', body: 'Recuerda tomar tu glucosa antes de comer y aplicar tu insulina.' },
    { hour: 14, minute: 30, title: '🥗 Hora de la Comida', body: 'Es hora de tu comida fuerte. ¡No olvides tu glucómetro!' },
    { hour: 20, minute: 0, title: '🐟 Hora de la Cena', body: 'Última medición del día. Prepara tu Accu-Chek y tu pluma de insulina.' },
  ];

  for (const meal of meals) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: meal.title,
        body: meal.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        hour: meal.hour,
        minute: meal.minute,
        repeats: true,
      },
    });
  }
  
  console.log('Alarmas nutricionales programadas exitosamente.');
}
