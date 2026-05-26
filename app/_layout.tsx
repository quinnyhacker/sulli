import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { registerForPushNotifications, savePushToken } from '../notifications';
import { supabase } from '../supabase';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('onboarded');
        console.log('onboarded:', onboarded);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setTimeout(() => router.replace(onboarded ? '/login' : '/onboarding'), 500);
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();
          if (data) {
            setTimeout(() => router.replace('/(tabs)'), 500);
            const token = await registerForPushNotifications();
            if (token) await savePushToken(token);
          } else {
            setTimeout(() => router.replace('/profile-setup'), 500);
          }
        }
      } catch (e) {
        setTimeout(() => router.replace('/login'), 500);
      }
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F2EA', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="venue" />
      <Stack.Screen name="map-picker" />
    </Stack>
  );
}