import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const isMounted = useRef(false);

  const checkProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    setHasProfile(!!data);
    return !!data;
  };

  useEffect(() => {
    isMounted.current = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) await checkProfile(session.user.id);
      else setHasProfile(false);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) await checkProfile(session.user.id);
      else setHasProfile(false);
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready || hasProfile === null) return;
    const inTabs = segments[0] === '(tabs)';
    const inSetup = segments[0] === 'profile-setup';
    const inLogin = segments[0] === 'login';
    if (!session && !inLogin) { router.replace('/login'); return; }
    if (session && hasProfile === false && !inSetup) { router.replace('/profile-setup'); return; }
    if (session && hasProfile === true && !inTabs) { router.replace('/(tabs)'); return; }
  }, [session, hasProfile, ready, segments]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}