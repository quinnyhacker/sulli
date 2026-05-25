import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle();
        setHasProfile(!!data);
      } else {
        setHasProfile(false);
      }
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle();
        setHasProfile(!!data);
      } else {
        setHasProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready || hasProfile === null) return;
    const inTabs = segments[0] === '(tabs)';
    const inSetup = segments[0] === 'profile-setup';
    const inLogin = segments[0] === 'login';
    if (!session && !inLogin) { router.replace('/login'); return; }
    if (session && !hasProfile && !inSetup) { router.replace('/profile-setup'); return; }
    if (session && hasProfile && !inTabs && !inSetup) { router.replace('/(tabs)'); return; }
  }, [ready, session, hasProfile, segments]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}