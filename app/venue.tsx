import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VenueScreen() {
  const { name, loc, type, rating, photo, tags } = useLocalSearchParams();
  const router = useRouter();

  const tagList = tags ? (tags as string).split(',') : [];

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(name as string + ' ' + loc as string)}`;
    Linking.openURL(url);
  };

  const suggestDate = () => {
    Alert.alert(
      'Suggest this spot',
      `Go to your Wags tab, open a chat and tap the 🗓 invite button to suggest ${name}!`,
      [
        { text: 'Got it', onPress: () => router.push('/(tabs)/messages') }
      ]
    );
  };

  const getTypeLabel = () => {
    switch(type) {
      case 'patio': return '🍽 Dog-friendly patio';
      case 'park': return '🌿 Dog park';
      case 'activity': return '🐕 Dog activity';
      case 'shop': return '🛍 Pet shopping';
      default: return '📍 Venue';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        {photo ? (
          <Image source={{ uri: photo as string }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoEmoji}>
              {type === 'patio' ? '☕' : type === 'park' ? '🌿' : type === 'activity' ? '🐕' : '🎀'}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.infoSection}>
          <Text style={styles.typeLabel}>{getTypeLabel()}</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.loc}>📍 {loc}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {rating}</Text>
            <Text style={styles.ratingLabel}>Google rating</Text>
          </View>
        </View>

        <View style={styles.tagsSection}>
          <Text style={styles.sectionLabel}>HIGHLIGHTS</Text>
          <View style={styles.tagsRow}>
            {tagList.map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
            <View style={styles.tag}>
              <Text style={styles.tagText}>🐾 Dog friendly</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>PLAN A DATE HERE</Text>
          <TouchableOpacity style={styles.suggestBtn} onPress={suggestDate}>
            <Text style={styles.suggestBtnText}>🗓 suggest this spot to a match</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapsBtn} onPress={openMaps}>
            <Text style={styles.mapsBtnText}>📍 open in Google Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dogFriendlyCard}>
          <Text style={styles.dogFriendlyTitle}>🐾 dog friendly tips</Text>
          {type === 'patio' && (
            <Text style={styles.dogFriendlyText}>This venue welcomes dogs on their patio. Keep your pup on a leash and bring water. Most KC patios are happy to bring a water bowl if you ask!</Text>
          )}
          {type === 'park' && (
            <Text style={styles.dogFriendlyText}>Always bring waste bags and clean up after your dog. Check if the park requires vaccinations. Keep an eye on your pup around other dogs!</Text>
          )}
          {type === 'activity' && (
            <Text style={styles.dogFriendlyText}>A fun and unique date idea for you and your pup! Great for breaking the ice and seeing how your dogs interact.</Text>
          )}
          {type === 'shop' && (
            <Text style={styles.dogFriendlyText}>Many KC pet shops welcome well-behaved dogs inside. A great low-key date idea — let your dogs pick out a toy together!</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  photoContainer: { height: 280, position: 'relative' },
  photo: { width: '100%', height: 280 },
  photoPlaceholder: { width: '100%', height: 280, backgroundColor: '#EDE4D4', alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 72 },
  backBtn: { position: 'absolute', top: 56, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#2C2016' },
  scroll: { flex: 1 },
  infoSection: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E8D5B7' },
  typeLabel: { fontSize: 12, color: '#8B5E3C', fontWeight: '500', marginBottom: 6 },
  name: { fontSize: 26, color: '#2C2016', fontWeight: '400', marginBottom: 6 },
  loc: { fontSize: 13, color: '#8C7B68', marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating: { fontSize: 16, color: '#8B5E3C', fontWeight: '500' },
  ratingLabel: { fontSize: 12, color: '#8C7B68' },
  tagsSection: { padding: 20 },
  sectionLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 10 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 12, color: '#8B5E3C', fontWeight: '500' },
  actionsSection: { paddingHorizontal: 20, paddingBottom: 20 },
  suggestBtn: { backgroundColor: '#8B5E3C', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 10 },
  suggestBtnText: { color: 'white', fontSize: 15, fontWeight: '500' },
  mapsBtn: { backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E8D5B7' },
  mapsBtnText: { color: '#8B5E3C', fontSize: 15, fontWeight: '500' },
  dogFriendlyCard: { marginHorizontal: 20, backgroundColor: '#DDE8D0', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#B8C8A8' },
  dogFriendlyTitle: { fontSize: 14, fontWeight: '500', color: '#1A3D0C', marginBottom: 8 },
  dogFriendlyText: { fontSize: 13, color: '#3B5230', lineHeight: 20 },
});