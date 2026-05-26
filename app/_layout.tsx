import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../supabase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();
          if (data) router.replace('/(tabs)');
          else router.replace('/profile-setup');
        }
      } catch (e) {
        router.replace('/login');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}