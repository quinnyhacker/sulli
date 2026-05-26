import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5E3C',
      });
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (e) {
      console.log('Could not get push token:', e);
      return null;
    }
  } catch (e) {
    console.log('Push notification setup error:', e);
    return null;
  }
}

export async function savePushToken(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ push_token: token }).eq('id', user.id);
  } catch (e) {
    console.log('Save push token error:', e);
  }
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
    };
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (e) {
    console.log('Send push notification error:', e);
  }
}