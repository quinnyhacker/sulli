import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '🐾',
    title: 'welcome to sulli',
    subtitle: 'the dating app for dog owners in kansas city',
    bg: '#8B5E3C',
    textColor: 'white',
  },
  {
    emoji: '🐕',
    title: 'bring your best friend',
    subtitle: 'every date is a dog date. swipe on people and their pups together',
    bg: '#F7F2EA',
    textColor: '#2C2016',
  },
  {
    emoji: '☕',
    title: 'explore KC together',
    subtitle: 'discover dog-friendly patios, parks, and activities all around the metro',
    bg: '#7A8C6E',
    textColor: 'white',
  },
  {
    emoji: '🛡',
    title: 'your safety first',
    subtitle: 'share your date details with trusted contacts before every meetup',
    bg: '#2C2016',
    textColor: 'white',
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const handleNext = async () => {
    if (current < slides.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      await AsyncStorage.setItem('onboarded', 'true');
      router.replace('/login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/login');
  };

  const slide = slides[current];

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: slide.textColor, opacity: 0.6 }]}>skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={[styles.title, { color: slide.textColor }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: slide.textColor, opacity: 0.75 }]}>{slide.subtitle}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: slide.textColor, opacity: i === current ? 1 : 0.3, width: i === current ? 24 : 8 }]} />
          ))}
        </View>

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: slide.textColor }]} onPress={handleNext}>
          <Text style={[styles.nextBtnText, { color: slide.bg }]}>
            {current === slides.length - 1 ? "let's go 🐾" : 'next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { fontSize: 14 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 },
  emoji: { fontSize: 80 },
  title: { fontSize: 36, fontWeight: '300', textAlign: 'center', lineHeight: 44 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 280 },
  bottom: { padding: 40, gap: 24, alignItems: 'center' },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { width: '100%', padding: 18, borderRadius: 20, alignItems: 'center' },
  nextBtnText: { fontSize: 17, fontWeight: '500' },
});