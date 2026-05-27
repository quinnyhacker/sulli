import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const slides = [
  {
    title: 'welcome to sulli',
    subtitle: 'the dating app for dog owners in kansas city',
    bg: '#8B5E3C',
    textColor: 'white',
    iconColor: 'rgba(255,255,255,0.9)',
    type: 'logo',
  },
  {
    title: 'bring your best friend',
    subtitle: 'every date is a dog date. swipe on people and their pups together',
    bg: '#F7F2EA',
    textColor: '#2C2016',
    iconColor: '#8B5E3C',
    type: 'swipe',
  },
  {
    title: 'explore KC together',
    subtitle: 'discover dog-friendly patios, parks, and activities all around the metro',
    bg: '#7A8C6E',
    textColor: 'white',
    iconColor: 'rgba(255,255,255,0.9)',
    type: 'map',
  },
  {
    title: 'your safety first',
    subtitle: 'share your date details with trusted contacts before every meetup',
    bg: '#2C2016',
    textColor: 'white',
    iconColor: 'rgba(255,255,255,0.9)',
    type: 'shield',
  },
];

function SlideIcon({ type, color }: { type: string; color: string }) {
  if (type === 'logo') return (
  <View style={{ width: 120, height: 120 }} />
);

  if (type === 'swipe') return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <View style={{ width: 44, height: 56, borderRadius: 10, borderWidth: 2, borderColor: color }} />
        <View style={{ width: 44, height: 56, borderRadius: 10, borderWidth: 2, borderColor: color, opacity: 0.4 }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 10, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
        </View>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 10, height: 10, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], marginLeft: -3 }} />
        </View>
      </View>
    </View>
  );

  if (type === 'map') return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
      <View style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 20, height: 24, borderRadius: 10, borderWidth: 2, borderColor: color }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, position: 'absolute', top: 25 }} />
        <View style={{ position: 'absolute', bottom: 10, width: 30, height: 1.5, backgroundColor: color, borderRadius: 1, opacity: 0.4 }} />
        <View style={{ position: 'absolute', bottom: 16, width: 20, height: 1.5, backgroundColor: color, borderRadius: 1, opacity: 0.4, left: 12 }} />
      </View>
      <View style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      </View>
    </View>
  );

  if (type === 'shield') return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
      <View style={{ width: 44, height: 24, borderRadius: 8, borderWidth: 2.5, borderColor: color, marginBottom: -3, zIndex: 1 }} />
      <View style={{ width: 64, height: 64, borderRadius: 10, borderWidth: 2.5, borderColor: color, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: color }} />
        <View style={{ width: 3, height: 16, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  );

  return <View style={{ width: 120, height: 120 }} />;
}

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
        <Text style={[styles.skipText, { color: slide.textColor, opacity: 0.5 }]}>skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <SlideIcon type={slide.type} color={slide.iconColor} />
        <Text style={[styles.title, { color: slide.textColor }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: slide.textColor, opacity: 0.75 }]}>{slide.subtitle}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: slide.textColor, opacity: i === current ? 1 : 0.25, width: i === current ? 24 : 8 }]} />
          ))}
        </View>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: slide.textColor }]} onPress={handleNext}>
          <Text style={[styles.nextBtnText, { color: slide.bg }]}>
            {current === slides.length - 1 ? "let's go" : 'next'}
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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 28 },
  title: { fontSize: 36, fontWeight: '300', textAlign: 'center', lineHeight: 44 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 26, maxWidth: 280 },
  bottom: { padding: 40, gap: 24, alignItems: 'center' },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { width: '100%', padding: 18, borderRadius: 20, alignItems: 'center' },
  nextBtnText: { fontSize: 17, fontWeight: '500' },
});