import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GOOGLE_PLACES_KEY } from '../../config';

const places = [
  { name: "Mildred's Coffeehouse", loc: "Brookside · 0.6 mi", type: "patio", search: "Mildred's Coffeehouse Kansas City", tags: ["Dog-friendly patio", "Coffee"], rating: "4.9" },
  { name: "The Peanut Waldo", loc: "Waldo · 1.2 mi", type: "patio", search: "The Peanut Waldo Kansas City", tags: ["Patio bar", "Beer garden"], rating: "4.7" },
  { name: "Fox & Pearl Patio", loc: "Westside · 2.1 mi", type: "patio", search: "Fox and Pearl Kansas City", tags: ["Fine dining", "Upscale"], rating: "4.8" },
  { name: "Martin City Brewing", loc: "Martin City · 3.4 mi", type: "patio", search: "Martin City Brewing Kansas City", tags: ["Brewery patio", "Large dogs ok"], rating: "4.6" },
  { name: "Shawnee Mission Park", loc: "Shawnee · 4.2 mi", type: "park", search: "Shawnee Mission Dog Park Kansas", tags: ["Off-leash", "Trails"], rating: "4.8" },
  { name: "Penn Valley Dog Park", loc: "KCMO · 2.8 mi", type: "park", search: "Penn Valley Dog Park Kansas City", tags: ["Fenced", "Large & small"], rating: "4.5" },
  { name: "Longview Lake Park", loc: "Raytown · 6.1 mi", type: "park", search: "Longview Lake Dog Park Missouri", tags: ["Lakeside", "Off-leash"], rating: "4.7" },
  { name: "Loose Park", loc: "KCMO · 2.2 mi", type: "park", search: "Loose Park Kansas City", tags: ["Rose garden", "On-leash"], rating: "4.6" },
  { name: "Bark Social KC", loc: "Prairie Village · 3 mi", type: "activity", search: "Bark Social Prairie Village Kansas", tags: ["Members club", "Dog bar"], rating: "4.8" },
  { name: "KC Tails Dog Spa", loc: "Brookside · 1.1 mi", type: "activity", search: "KC Tails Dog Spa Kansas City", tags: ["Couples grooming", "Unique date"], rating: "4.9" },
  { name: "Wag N Wash", loc: "Olathe · 6 mi", type: "activity", search: "Wag N Wash Olathe Kansas", tags: ["Self-serve wash", "Fun date"], rating: "4.5" },
  { name: "Tail Waggers Boutique", loc: "Westport · 2.4 mi", type: "shop", search: "Tail Waggers Westport Kansas City", tags: ["Dog boutique", "Gift shopping"], rating: "4.7" },
];

const filters = ['All', 'Patios', 'Parks', 'Activities', 'Shopping'];
const filterMap: Record<string, string> = { All: 'all', Patios: 'patio', Parks: 'park', Activities: 'activity', Shopping: 'shop' };

const typeLabel: Record<string, string> = {
  patio: 'PATIO',
  park: 'PARK',
  activity: 'ACTIVITY',
  shop: 'SHOP',
};

const typeBg: Record<string, string> = {
  patio: '#F5EDE0',
  park: '#E4EDD8',
  activity: '#E8E0F0',
  shop: '#E0EAF5',
};

const typeColor: Record<string, string> = {
  patio: '#8B5E3C',
  park: '#3B6D11',
  activity: '#5B3B8B',
  shop: '#1A5B8B',
};

function PlaceCard({ place }: { place: any }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const router = useRouter();

  const fetchPhoto = async () => {
    if (tried) return;
    setTried(true);
    try {
      const searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(place.search)}&inputtype=textquery&fields=photos&key=${GOOGLE_PLACES_KEY}`
      );
      const searchData = await searchRes.json();
      const photoRef = searchData.candidates?.[0]?.photos?.[0]?.photo_reference;
      if (photoRef) {
        setPhotoUrl(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_PLACES_KEY}`);
      }
    } catch (e) {
      console.log('Photo fetch error:', e);
    }
  };

  fetchPhoto();

  const handlePress = () => {
    router.push(`/venue?name=${encodeURIComponent(place.name)}&loc=${encodeURIComponent(place.loc)}&type=${place.type}&rating=${place.rating}&photo=${encodeURIComponent(photoUrl || '')}&tags=${encodeURIComponent(place.tags.join(','))}`);
  };

  return (
    <TouchableOpacity style={styles.venueCard} onPress={handlePress}>
      <View style={styles.venuePhoto}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.venuePhotoImage} />
        ) : (
          <View style={[styles.venuePhotoPlaceholder, { backgroundColor: typeBg[place.type] || '#EDE4D4' }]}>
            <Text style={[styles.placeholderType, { color: typeColor[place.type] || '#8B5E3C' }]}>{place.name.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.typeBadge, { backgroundColor: typeBg[place.type] }]}>
          <Text style={[styles.typeBadgeText, { color: typeColor[place.type] }]}>{typeLabel[place.type]}</Text>
        </View>
      </View>
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{place.name}</Text>
        <Text style={styles.venueLoc}>{place.loc}</Text>
        <View style={styles.venueBottom}>
          <View style={styles.tagsRow}>
            {place.tags.map((t: string, j: number) => (
              <View key={j} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.rating}>{place.rating} ★</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DatesScreen() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? places : places.filter(p => p.type === filterMap[active]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Date ideas</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {filters.map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, active === f && styles.filterBtnActive]} onPress={() => setActive(f)}>
            <Text style={[styles.filterText, active === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.scroll}>
        {filtered.map((p, i) => <PlaceCard key={i} place={p} />)}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 26, color: '#2C2016', fontWeight: '300' },
  filterRow: { maxHeight: 44, marginBottom: 8 },
  filterBtn: { borderWidth: 1, borderColor: '#E8D5B7', backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, height: 32 },
  filterBtnActive: { backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' },
  filterText: { fontSize: 12, color: '#8B5E3C', fontWeight: '500' },
  filterTextActive: { color: 'white' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  venueCard: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  venuePhoto: { height: 140, position: 'relative' },
  venuePhotoImage: { width: '100%', height: 140 },
  venuePhotoPlaceholder: { width: '100%', height: 140, alignItems: 'center', justifyContent: 'center' },
  placeholderType: { fontSize: 48, fontWeight: '200' },
  typeBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
  venueInfo: { padding: 12 },
  venueName: { fontSize: 14, fontWeight: '500', color: '#2C2016', marginBottom: 3 },
  venueLoc: { fontSize: 11, color: '#8C7B68', marginBottom: 8 },
  venueBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', flex: 1 },
  tag: { backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: '#8B5E3C', fontWeight: '500' },
  rating: { fontSize: 11, color: '#8B5E3C', fontWeight: '500' },
});