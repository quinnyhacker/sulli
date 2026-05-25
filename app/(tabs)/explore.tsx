import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const places = [
  { name: "Mildred's Coffeehouse", loc: "Brookside · 0.6 mi", type: "patio", icon: "☕", tags: ["Dog-friendly patio", "Coffee"], rating: "4.9" },
  { name: "The Peanut Waldo", loc: "Waldo · 1.2 mi", type: "patio", icon: "🍺", tags: ["Patio bar", "Beer garden"], rating: "4.7" },
  { name: "Fox & Pearl Patio", loc: "Westside · 2.1 mi", type: "patio", icon: "🍽", tags: ["Fine dining", "Upscale"], rating: "4.8" },
  { name: "Martin City Brewing", loc: "Martin City · 3.4 mi", type: "patio", icon: "🍻", tags: ["Brewery patio", "Large dogs ok"], rating: "4.6" },
  { name: "Shawnee Mission Park", loc: "Shawnee · 4.2 mi", type: "park", icon: "🌿", tags: ["Off-leash", "Trails"], rating: "4.8" },
  { name: "Penn Valley Dog Park", loc: "KCMO · 2.8 mi", type: "park", icon: "🌳", tags: ["Fenced", "Large & small"], rating: "4.5" },
  { name: "Longview Lake Park", loc: "Raytown · 6.1 mi", type: "park", icon: "🌊", tags: ["Lakeside", "Off-leash"], rating: "4.7" },
  { name: "Loose Park", loc: "KCMO · 2.2 mi", type: "park", icon: "🌸", tags: ["Rose garden", "On-leash"], rating: "4.6" },
  { name: "Bark Social KC", loc: "Prairie Village · 3 mi", type: "activity", icon: "🏡", tags: ["Members club", "Dog bar"], rating: "4.8" },
  { name: "KC Tails Dog Spa", loc: "Brookside · 1.1 mi", type: "activity", icon: "🛁", tags: ["Couples grooming", "Unique date"], rating: "4.9" },
  { name: "Wag N Wash", loc: "Olathe · 6 mi", type: "activity", icon: "🚿", tags: ["Self-serve wash", "Fun date"], rating: "4.5" },
  { name: "Tail Waggers Boutique", loc: "Westport · 2.4 mi", type: "shop", icon: "🎀", tags: ["Dog boutique", "Gift shopping"], rating: "4.7" },
];

const filters = ['All', 'Patios', 'Parks', 'Activities', 'Shopping'];
const filterMap: Record<string, string> = { All: 'all', Patios: 'patio', Parks: 'park', Activities: 'activity', Shopping: 'shop' };

export default function DatesScreen() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? places : places.filter(p => p.type === filterMap[active]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Date ideas 🐾</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {filters.map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, active === f && styles.filterBtnActive]} onPress={() => setActive(f)}>
            <Text style={[styles.filterText, active === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.scroll}>
        {filtered.map((p, i) => (
          <View key={i} style={styles.venueCard}>
            <View style={styles.venuePhoto}>
              <Text style={styles.venueEmoji}>{p.icon}</Text>
            </View>
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{p.name}</Text>
              <Text style={styles.venueLoc}>📍 {p.loc}</Text>
              <View style={styles.venueBottom}>
                <View style={styles.tagsRow}>
                  {p.tags.map((t, j) => (
                    <View key={j} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.rating}>⭐ {p.rating}</Text>
              </View>
            </View>
          </View>
        ))}
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
  venuePhoto: { height: 70, backgroundColor: '#EDE4D4', alignItems: 'center', justifyContent: 'center' },
  venueEmoji: { fontSize: 32 },
  venueInfo: { padding: 10 },
  venueName: { fontSize: 13, fontWeight: '500', color: '#2C2016', marginBottom: 2 },
  venueLoc: { fontSize: 11, color: '#8C7B68', marginBottom: 6 },
  venueBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', flex: 1 },
  tag: { backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: '#8B5E3C', fontWeight: '500' },
  rating: { fontSize: 11, color: '#8B5E3C', fontWeight: '500' },
});