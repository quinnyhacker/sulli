import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const KC_VENUES = [
  { name: "Shawnee Mission Dog Park", lat: 38.9367, lng: -94.7390, type: "park" },
  { name: "Penn Valley Dog Park", lat: 39.0845, lng: -94.5847, type: "park" },
  { name: "Longview Lake Dog Park", lat: 38.9108, lng: -94.4663, type: "park" },
  { name: "Loose Park", lat: 39.0289, lng: -94.5840, type: "park" },
  { name: "Mildred's Coffeehouse", lat: 39.0312, lng: -94.5925, type: "patio" },
  { name: "The Peanut Waldo", lat: 39.0198, lng: -94.5912, type: "patio" },
  { name: "Martin City Brewing", lat: 38.9012, lng: -94.5734, type: "patio" },
  { name: "Bark Social KC", lat: 38.9823, lng: -94.6341, type: "activity" },
  { name: "Fox & Pearl", lat: 39.0912, lng: -94.5923, type: "patio" },
];

export default function MapPicker() {
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialRegion = {
    latitude: 39.0997,
    longitude: -94.5786,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
  };

  const filtered = search
    ? KC_VENUES.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
    : KC_VENUES;

  const getMarkerColor = (type: string) => {
    if (type === 'park') return '#7A8C6E';
    if (type === 'patio') return '#C8956C';
    return '#8B5E3C';
  };

  const handleSelect = () => {
    if (!selectedVenue) {
      Alert.alert('Select a venue', 'Please tap a pin on the map or choose from the list');
      return;
    }
    router.back();
    if (params.onSelect) {
      // Pass selected venue back
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>pick a spot</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}>
        {userLocation && (
          <Circle
            center={userLocation}
            radius={40000}
            fillColor="rgba(139,94,60,0.08)"
            strokeColor="rgba(139,94,60,0.2)"
            strokeWidth={1}
          />
        )}
        {KC_VENUES.map((venue, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            title={venue.name}
            pinColor={selectedVenue?.name === venue.name ? '#D4634A' : getMarkerColor(venue.type)}
            onPress={() => setSelectedVenue(venue)}
          />
        ))}
      </MapView>

      {selectedVenue && (
        <View style={styles.selectedCard}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedName}>{selectedVenue.name}</Text>
            <Text style={styles.selectedType}>{selectedVenue.type === 'park' ? '🌿 Dog park' : selectedVenue.type === 'patio' ? '☕ Dog-friendly patio' : '🐕 Activity'}</Text>
          </View>
          <TouchableOpacity style={styles.selectBtn} onPress={() => {
            router.back();
          }}>
            <Text style={styles.selectBtnText}>select</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listSection}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="search venues..."
          placeholderTextColor="#8C7B68"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venueScroll}>
          {filtered.map((venue, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.venueChip, selectedVenue?.name === venue.name && styles.venueChipActive]}
              onPress={() => setSelectedVenue(venue)}>
              <Text style={[styles.venueChipText, selectedVenue?.name === venue.name && styles.venueChipTextActive]}>
                {venue.type === 'park' ? '🌿' : venue.type === 'patio' ? '☕' : '🐕'} {venue.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E8D5B7' },
  backBtn: { fontSize: 14, color: '#8C7B68' },
  title: { fontSize: 18, fontWeight: '500', color: '#2C2016' },
  map: { flex: 1 },
  selectedCard: { position: 'absolute', bottom: 180, left: 16, right: 16, backgroundColor: 'white', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E8D5B7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  selectedInfo: { flex: 1 },
  selectedName: { fontSize: 14, fontWeight: '500', color: '#2C2016', marginBottom: 3 },
  selectedType: { fontSize: 12, color: '#8C7B68' },
  selectBtn: { backgroundColor: '#8B5E3C', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  selectBtnText: { color: 'white', fontSize: 13, fontWeight: '500' },
  listSection: { backgroundColor: 'white', padding: 12, borderTopWidth: 1, borderTopColor: '#E8D5B7' },
  searchInput: { backgroundColor: '#F7F2EA', borderRadius: 12, padding: 10, fontSize: 13, color: '#2C2016', borderWidth: 1, borderColor: '#E8D5B7', marginBottom: 10 },
  venueScroll: { maxHeight: 44 },
  venueChip: { borderWidth: 1, borderColor: '#E8D5B7', backgroundColor: '#F7F2EA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  venueChipActive: { backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' },
  venueChipText: { fontSize: 12, color: '#8B5E3C' },
  venueChipTextActive: { color: 'white' },
});