import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { registerForPushNotifications, savePushToken, sendPushNotification } from '../../notifications';
import { supabase } from '../../supabase';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function HomeScreen() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchName, setMatchName] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => { loadProfiles(); setupNotifications(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [currentIndex]);

  const setupNotifications = async () => {
    const token = await registerForPushNotifications();
    if (token) await savePushToken(token);
  };

  const loadProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({ last_active: new Date().toISOString() }).eq('id', user.id);

    const { data: swipedIds } = await supabase.from('swipes').select('swiped_id').eq('swiper_id', user.id);
    const excluded = [user.id, ...(swipedIds?.map((s: any) => s.swiped_id) || [])];

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('preferred_dog_size, seeking, gender')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excluded.join(',')})`);

    if (myProfile?.preferred_dog_size && myProfile.preferred_dog_size !== 'any') {
      query = query.eq('dog_size', myProfile.preferred_dog_size);
    }

    if (myProfile?.seeking && myProfile.seeking !== 'Everyone') {
      const genderFilter = myProfile.seeking === 'Men' ? 'Man' : 'Woman';
      query = query.eq('gender', genderFilter);
    }

    query = query.order('last_active', { ascending: false });

    const { data: potentials } = await query.limit(20);
    setProfiles(potentials || []);
    setLoading(false);
  };

  const recordSwipe = async (direction: string, swipedId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    await supabase.from('swipes').insert({ swiper_id: user.id, swiped_id: swipedId, direction });
    if (direction === 'right') {
      const { data: theirSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', swipedId)
        .eq('swiped_id', user.id)
        .eq('direction', 'right')
        .maybeSingle();
      if (theirSwipe) {
        await supabase.from('matches').insert({ user1_id: user.id, user2_id: swipedId });
        const { data: theirProfile } = await supabase.from('profiles').select('push_token, name').eq('id', swipedId).single();
        const { data: myProf } = await supabase.from('profiles').select('name, dog_name').eq('id', user.id).single();
        if (theirProfile?.push_token) {
          await sendPushNotification(theirProfile.push_token, "it's a match!", `You and ${myProf?.name} matched on Sulli!`);
        }
        return true;
      }
    }
    return false;
  };

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    const isMatch = await recordSwipe('right', profile.id);
    if (isMatch) { setMatchName(profile.name); setShowMatch(true); }
    else setCurrentIndex(prev => prev + 1);
  };

  const handlePass = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    await recordSwipe('left', profile.id);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#8B5E3C" />
      <Text style={{ color: '#8C7B68', marginTop: 12, fontSize: 13 }}>finding pups near you...</Text>
    </View>
  );

  if (showMatch) return (
    <View style={styles.matchScreen}>
      <View style={styles.matchIconRow}>
        <View style={styles.matchCircle} />
        <View style={[styles.matchCircle, { marginHorizontal: -10, zIndex: 1 }]} />
        <View style={styles.matchCircle} />
      </View>
      <Text style={styles.matchTitle}>it's a match</Text>
      <Text style={styles.matchSub}>You and {matchName} liked each other. Time to plan a playdate!</Text>
      <TouchableOpacity style={styles.matchButton} onPress={() => { setShowMatch(false); setCurrentIndex(prev => prev + 1); }}>
        <Text style={styles.matchButtonText}>keep exploring</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.matchMessageBtn} onPress={() => { setShowMatch(false); router.push('/(tabs)/messages' as any); }}>
        <Text style={styles.matchMessageBtnText}>send a message</Text>
      </TouchableOpacity>
    </View>
  );

  if (profiles.length === 0 || currentIndex >= profiles.length) return (
    <View style={styles.emptyScreen}>
      <View style={styles.emptyIcon}>
        <View style={styles.emptyCircle} />
        <View style={styles.emptyLine} />
      </View>
      <Text style={styles.emptyTitle}>no more pups nearby</Text>
      <Text style={styles.emptySub}>Check back later for more dog lovers in KC</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={loadProfiles}>
        <Text style={styles.refreshBtnText}>refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const profile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <Text style={styles.navLogo}>sulli</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => router.replace('/login'))}>
          <Text style={styles.signOut}>sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.photoBlock}>
          {profile.photos?.[0]
            ? <Image source={{ uri: profile.photos[0] }} style={styles.photo} />
            : <View style={[styles.photo, styles.photoPlaceholder]}><Text style={styles.placeholderInitial}>{profile.name?.charAt(0)}</Text></View>
          }
          <View style={styles.nameOverlay}>
            <View style={styles.nameRow}>
              <Text style={styles.overlayName}>{profile.name}</Text>
              <Text style={styles.overlayAmpersand}> & </Text>
              <Text style={styles.overlayDog}>{profile.dog_name}</Text>
            </View>
            <Text style={styles.overlayAge}>{profile.age}</Text>
            <Text style={styles.overlayNeighborhood}>{profile.neighborhood} · {profile.dog_breed}</Text>
          </View>
        </View>

        {profile.bio ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ABOUT</Text>
            <Text style={styles.cardText}>{profile.bio}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>THE PUP</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.dogName}>{profile.dog_name}</Text>
              <Text style={styles.dogBreed}>{profile.dog_breed}, {profile.dog_age}y old</Text>
            </View>
            <View style={styles.dogSizeBadge}>
              <Text style={styles.dogSizeBadgeText}>{profile.dog_size || 'Medium'}</Text>
            </View>
          </View>
        </View>

        {profile.photos?.slice(1).map((photo: string, i: number) => (
          <View key={i} style={[styles.photoBlock, { marginBottom: 8 }]}>
            <Image source={{ uri: photo }} style={styles.photo} />
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.passBtn} onPress={handlePass}>
          <View style={styles.passBtnInner}>
            <Text style={styles.passBtnX}>✕</Text>
            <Text style={styles.passBtnText}>pass</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
          <View style={styles.likeBtnInner}>
            <Text style={styles.likeBtnHeart}>♥</Text>
            <Text style={styles.likeBtnText}>like</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  topNav: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navLogo: { fontSize: 26, color: '#2C2016', fontWeight: '300', letterSpacing: 1 },
  signOut: { fontSize: 12, color: '#C4B8AC' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingTop: 4 },
  photoBlock: { width: '100%', height: SCREEN_HEIGHT * 0.62, borderRadius: 20, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { backgroundColor: '#EDE4D4', alignItems: 'center', justifyContent: 'center' },
  placeholderInitial: { fontSize: 64, color: '#8B5E3C', fontWeight: '200' },
  nameOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 24, backgroundColor: 'rgba(0,0,0,0.32)' },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 2 },
  overlayName: { fontSize: 30, color: 'white', fontWeight: '500' },
  overlayAmpersand: { fontSize: 22, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  overlayDog: { fontSize: 26, color: 'white', fontWeight: '300', fontStyle: 'italic' },
  overlayAge: { fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: '300', marginBottom: 2 },
  overlayNeighborhood: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 18, borderWidth: 0.5, borderColor: '#E8D5B7', marginBottom: 8 },
  cardLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 10 },
  cardText: { fontSize: 15, color: '#2C2016', lineHeight: 24 },
  dogName: { fontSize: 20, color: '#2C2016', fontWeight: '400', marginBottom: 2 },
  dogBreed: { fontSize: 13, color: '#8C7B68' },
  dogSizeBadge: { backgroundColor: '#F7F2EA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5, borderColor: '#E8D5B7' },
  dogSizeBadgeText: { fontSize: 11, color: '#8B5E3C', fontWeight: '500' },
  actionBar: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 10, paddingBottom: 16, backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: '#F0EBE3', gap: 12 },
  passBtn: { width: 150, height: 52, borderRadius: 14, backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center' },
  passBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passBtnX: { fontSize: 14, color: '#C87858' },
  passBtnText: { fontSize: 14, color: '#8C7B68', fontWeight: '500' },
  likeBtn: { width: 150, height: 52, borderRadius: 14, backgroundColor: '#2C2016', alignItems: 'center', justifyContent: 'center' },
  likeBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  likeBtnHeart: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  likeBtnText: { fontSize: 14, color: 'white', fontWeight: '500' },
  matchScreen: { flex: 1, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  matchIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  matchCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)' },
  matchTitle: { fontSize: 42, color: 'white', fontWeight: '300', fontStyle: 'italic' },
  matchSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22 },
  matchButton: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  matchButtonText: { color: 'white', fontSize: 16 },
  matchMessageBtn: { paddingHorizontal: 40, paddingVertical: 14 },
  matchMessageBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  emptyScreen: { flex: 1, backgroundColor: '#F7F2EA', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#C4B8AC' },
  emptyLine: { width: 2, height: 16, backgroundColor: '#C4B8AC', borderRadius: 1, marginTop: -2 },
  emptyTitle: { fontSize: 22, color: '#2C2016', fontWeight: '300' },
  emptySub: { fontSize: 13, color: '#8C7B68', textAlign: 'center', lineHeight: 20 },
  refreshBtn: { marginTop: 8, borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 20, paddingHorizontal: 28, paddingVertical: 10 },
  refreshBtnText: { fontSize: 14, color: '#8B5E3C' },
});