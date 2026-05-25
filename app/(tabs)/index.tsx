import { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;

const profiles = [
  { name: 'Alex', age: 31, dogName: 'Biscuit', dogBreed: 'Golden Retriever, 3y', bio: 'Overland Park native. We hit Shawnee Mission every Sunday ☀️', tags: ['Dog parks', 'Fetch', 'Patios'], emoji: '🐕', distance: '0.8 mi away' },
  { name: 'Jordan', age: 28, dogName: 'Mochi', dogBreed: 'Toy Poodle, 2y', bio: 'Brookside coffee and weekend trails. Mochi thinks she\'s a duchess 👑', tags: ['Off-leash', 'Patios', 'Small dogs'], emoji: '🐩', distance: '2.1 mi away' },
  { name: 'Sam', age: 34, dogName: 'Pretzel', dogBreed: 'Dachshund, 5y', bio: 'Love long walks along the KC riverfront. Pretzel is very opinionated 🌭', tags: ['Walks', 'Cafés', 'City dogs'], emoji: '🐾', distance: '1.4 mi away' },
  { name: 'Riley', age: 27, dogName: 'Waffle', dogBreed: 'Corgi, 1y', bio: 'New to KC, looking to explore with Waffle and meet good people 🧇', tags: ['Explorer', 'Patios', 'Puppies'], emoji: '🐶', distance: '3.2 mi away' },
  { name: 'Casey', age: 30, dogName: 'Duke', dogBreed: 'Lab Mix, 4y', bio: 'Weekend hiker and craft beer fan. Duke is friendly with everyone 🍺', tags: ['Hiking', 'Breweries', 'Big dogs'], emoji: '🦮', distance: '1.9 mi away' },
];

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchName, setMatchName] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], outputRange: ['-10deg', '0deg', '10deg'] });
  const likeOpacity = position.x.interpolate({ inputRange: [0, SCREEN_WIDTH / 4], outputRange: [0, 1] });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SCREEN_WIDTH / 4, 0], outputRange: [1, 0] });

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
    Animated.timing(position, { toValue: { x: SCREEN_WIDTH + 100, y: 0 }, duration: 300, useNativeDriver: true }).start(() => {
      setMatchName(profiles[currentIndex].name);
      setShowMatch(true);
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, { toValue: { x: -SCREEN_WIDTH - 100, y: 0 }, duration: 300, useNativeDriver: true }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

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

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyEmoji}>🐾</Text>
        <Text style={styles.emptyTitle}>you've seen everyone!</Text>
        <Text style={styles.emptySub}>Check back later for more dog lovers in KC</Text>
        <TouchableOpacity style={styles.matchButton} onPress={() => setCurrentIndex(0)}>
          <Text style={styles.matchButtonText}>start over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <Text style={styles.navLogo}>sulli 🐾</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.signOut}>sign out</Text>
        </TouchableOpacity>
      </View>

      {nextProfile && (
        <View style={[styles.card, styles.cardBack]}>
          <View style={styles.cardPhoto}>
            <Text style={styles.cardEmoji}>{nextProfile.emoji}</Text>
          </View>
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
        <View style={styles.cardPhoto}>
          <Text style={styles.cardEmoji}>{profile.emoji}</Text>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>🐶 {profile.dogName}</Text>
          </View>
          <View style={styles.cardDistance}>
            <Text style={styles.cardDistanceText}>{profile.distance}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{profile.name}</Text>
            <Text style={styles.cardAge}>{profile.age}</Text>
          </View>
          <Text style={styles.cardDog}>🐶 {profile.dogName} · {profile.dogBreed}</Text>
          <Text style={styles.cardBio}>{profile.bio}</Text>
          <View style={styles.tagsRow}>
            {profile.tags.map((t, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
            ))}
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
  cardPhoto: { height: 280, backgroundColor: '#EDE4D4', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 80 },
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