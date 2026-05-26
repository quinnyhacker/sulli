import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { registerForPushNotifications, savePushToken, sendPushNotification } from '../../notifications';
import { supabase } from '../../supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchName, setMatchName] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const router = useRouter();

  const rotate = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], outputRange: ['-10deg', '0deg', '10deg'] });
  const likeOpacity = position.x.interpolate({ inputRange: [0, SCREEN_WIDTH / 4], outputRange: [0, 1] });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 4, 0], outputRange: [1, 0] });

  useEffect(() => {
    loadProfiles();
    setupNotifications();
  }, []);

  useEffect(() => {
    setPhotoIndex(0);
  }, [currentIndex]);

  const setupNotifications = async () => {
    const token = await registerForPushNotifications();
    if (token) await savePushToken(token);
  };

  const loadProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: swipedIds } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', user.id);

    const excluded = [user.id, ...(swipedIds?.map((s: any) => s.swiped_id) || [])];

    const { data: myProfile } = await supabase
  .from('profiles')
  .select('preferred_dog_size')
  .eq('id', user.id)
  .single();

let query = supabase
  .from('profiles')
  .select('*')
  .not('id', 'in', `(${excluded.join(',')})`);

if (myProfile?.preferred_dog_size && myProfile.preferred_dog_size !== 'any') {
  query = query.eq('dog_size', myProfile.preferred_dog_size);
}

const { data: potentials } = await query.limit(20);

    setProfiles(potentials || []);
    setLoading(false);
  };

  const recordSwipe = async (direction: string, swipedId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await supabase.from('swipes').insert({
      swiper_id: user.id,
      swiped_id: swipedId,
      direction,
    });

    if (direction === 'right') {
      const { data: theirSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', swipedId)
        .eq('swiped_id', user.id)
        .eq('direction', 'right')
        .single();

      if (theirSwipe) {
        await supabase.from('matches').insert({
          user1_id: user.id,
          user2_id: swipedId,
        });
        const { data: theirProfile } = await supabase
          .from('profiles')
          .select('push_token, name')
          .eq('id', swipedId)
          .single();
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('name, dog_name')
          .eq('id', user.id)
          .single();
        if (theirProfile?.push_token) {
          await sendPushNotification(
            theirProfile.push_token,
            "it's a match! 🐾",
            `You and ${myProfile?.name} & ${myProfile?.dog_name} matched on Sulli!`
          );
        }
        return true;
      }
    }
    return false;
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) swipeRight();
      else if (gesture.dx < -120) swipeLeft();
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    },
  })).current;

  const swipeRight = () => {
    const profile = profiles[currentIndex];
    Animated.timing(position, { toValue: { x: SCREEN_WIDTH + 100, y: 0 }, duration: 300, useNativeDriver: true }).start(async () => {
      const isMatch = await recordSwipe('right', profile.id);
      if (isMatch) {
        setMatchName(profile.name);
        setShowMatch(true);
      }
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

  const swipeLeft = () => {
    const profile = profiles[currentIndex];
    Animated.timing(position, { toValue: { x: -SCREEN_WIDTH - 100, y: 0 }, duration: 300, useNativeDriver: true }).start(async () => {
      await recordSwipe('left', profile.id);
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5E3C" />
        <Text style={{ color: '#8C7B68', marginTop: 12 }}>finding pups near you...</Text>
      </View>
    );
  }

  if (showMatch) {
    return (
      <View style={styles.matchScreen}>
        <Text style={styles.matchEmoji}>🐕 💕 🐩</Text>
        <Text style={styles.matchTitle}>it's a match!</Text>
        <Text style={styles.matchSub}>You and {matchName} both swiped right. Time to plan a playdate!</Text>
        <TouchableOpacity style={styles.matchButton} onPress={() => setShowMatch(false)}>
          <Text style={styles.matchButtonText}>keep swiping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyEmoji}>🐾</Text>
        <Text style={styles.emptyTitle}>no more pups nearby!</Text>
        <Text style={styles.emptySub}>Check back later for more dog lovers in KC</Text>
        <TouchableOpacity style={styles.matchButton} onPress={loadProfiles}>
          <Text style={styles.matchButtonText}>refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const currentPhoto = profile.photos?.[photoIndex] || null;

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <Text style={styles.navLogo}>sulli 🐾</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => router.replace('/login'))}>
          <Text style={styles.signOut}>sign out</Text>
        </TouchableOpacity>
      </View>

      {nextProfile && (
        <View style={[styles.card, styles.cardBack]}>
          {nextProfile.photos?.[0] ? (
            <Image source={{ uri: nextProfile.photos[0] }} style={styles.cardPhotoImage} />
          ) : (
            <View style={styles.cardPhoto}>
              <Text style={styles.cardEmoji}>{nextProfile.dog_emoji || '🐕'}</Text>
            </View>
          )}
        </View>
      )}

      <Animated.View
        style={[styles.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
        {...panResponder.panHandlers}>
        <Animated.View style={[styles.hintBadge, styles.woofBadge, { opacity: likeOpacity }]}>
          <Text style={styles.woofText}>WOOF</Text>
        </Animated.View>
        <Animated.View style={[styles.hintBadge, styles.passBadge, { opacity: nopeOpacity }]}>
          <Text style={styles.passText}>PASS</Text>
        </Animated.View>

        <View style={styles.photoContainer}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={styles.cardPhotoImage} />
          ) : (
            <View style={styles.cardPhoto}>
              <Text style={styles.cardEmoji}>{profile.dog_emoji || '🐕'}</Text>
            </View>
          )}
          {profile.photos?.length > 1 && (
            <View style={styles.photoDotsRow}>
              {profile.photos.map((_: any, i: number) => (
                <View key={i} style={[styles.photoDot, i === photoIndex && styles.photoDotActive]} />
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.photoLeft} onPress={() => setPhotoIndex(prev => Math.max(0, prev - 1))} />
          <TouchableOpacity style={styles.photoRight} onPress={() => setPhotoIndex(prev => Math.min((profile.photos?.length || 1) - 1, prev + 1))} />
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>🐶 {profile.dog_name}</Text>
          </View>
          <View style={styles.cardDistance}>
            <Text style={styles.cardDistanceText}>{profile.neighborhood}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{profile.name}</Text>
            <Text style={styles.cardAge}>{profile.age}</Text>
          </View>
          <Text style={styles.cardDog}>🐶 {profile.dog_name} · {profile.dog_breed}, {profile.dog_age}y</Text>
          <Text style={styles.cardBio} numberOfLines={2}>{profile.bio || 'Dog lover in KC 🐾'}</Text>
          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>{profile.neighborhood}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{profile.dog_breed}</Text></View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={swipeLeft}>
          <Text style={styles.passBtnText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={swipeRight}>
          <Text style={styles.likeBtnText}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  matchScreen: { flex: 1, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  matchEmoji: { fontSize: 48 },
  matchTitle: { fontSize: 42, color: 'white', fontWeight: '300', fontStyle: 'italic' },
  matchSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22 },
  matchButton: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  matchButtonText: { color: 'white', fontSize: 16 },
  emptyScreen: { flex: 1, backgroundColor: '#F7F2EA', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { fontSize: 24, color: '#2C2016', fontWeight: '300' },
  emptySub: { fontSize: 14, color: '#8C7B68', textAlign: 'center', lineHeight: 22 },
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  topNav: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navLogo: { fontSize: 28, color: '#8B5E3C', fontWeight: '300' },
  signOut: { fontSize: 12, color: '#8C7B68' },
  card: { marginHorizontal: 16, backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E8D5B7', position: 'absolute', left: 0, right: 0, top: 110 },
  cardBack: { top: 118, marginHorizontal: 22, opacity: 0.8 },
  photoContainer: { position: 'relative', height: 320 },
  cardPhotoImage: { width: '100%', height: 320 },
  cardPhoto: { height: 320, backgroundColor: '#EDE4D4', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 80 },
  photoDotsRow: { position: 'absolute', top: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  photoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  photoDotActive: { backgroundColor: 'white', width: 18 },
  photoLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%' },
  photoRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%' },
  cardBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#E8D5B7' },
  cardBadgeText: { fontSize: 11, color: '#8B5E3C', fontWeight: '500' },
  cardDistance: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cardDistanceText: { fontSize: 11, color: 'white' },
  cardBody: { padding: 16 },
  cardNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  cardName: { fontSize: 22, color: '#2C2016', fontWeight: '400' },
  cardAge: { fontSize: 16, color: '#8C7B68', fontWeight: '300' },
  cardDog: { fontSize: 12, color: '#8B5E3C', fontWeight: '500', marginBottom: 6 },
  cardBio: { fontSize: 13, color: '#8C7B68', lineHeight: 20, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#8B5E3C', fontWeight: '500' },
  actionRow: { position: 'absolute', bottom: 80, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 24 },
  actionBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, backgroundColor: 'white' },
  passBtn: { borderColor: '#E8D0C8' },
  passBtnText: { fontSize: 24, color: '#C87858' },
  likeBtn: { borderColor: '#F4B8A8', width: 72, height: 72, borderRadius: 36 },
  likeBtnText: { fontSize: 28, color: '#D4634A' },
  hintBadge: { position: 'absolute', top: 40, zIndex: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 3 },
  woofBadge: { left: 20, borderColor: '#7A8C6E', transform: [{ rotate: '-12deg' }] },
  woofText: { fontSize: 24, fontWeight: '700', color: '#7A8C6E' },
  passBadge: { right: 20, borderColor: '#D4634A', transform: [{ rotate: '12deg' }] },
  passText: { fontSize: 24, fontWeight: '700', color: '#D4634A' },
});