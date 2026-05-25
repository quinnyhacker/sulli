import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your plans 🗓</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionLabel}>UPCOMING DATES</Text>
        <View style={styles.card}>
          <View style={styles.dateBox}>
            <Text style={styles.dateMonth}>JUN</Text>
            <Text style={styles.dateNum}>7</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Shawnee Mission Dog Park</Text>
            <Text style={styles.cardSub}>with Sam & Pretzel · 10:00 AM</Text>
            <View style={styles.tag}><Text style={styles.tagText}>🛡 Safety share on</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <View style={[styles.dateBox, { backgroundColor: '#7A8C6E' }]}>
            <Text style={styles.dateMonth}>JUN</Text>
            <Text style={styles.dateNum}>14</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Mildred's Coffeehouse Patio</Text>
            <Text style={styles.cardSub}>with Riley & Waffle · 2:30 PM</Text>
            <View style={styles.tag}><Text style={styles.tagText}>🛡 Safety share on</Text></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, color: '#2C2016', fontWeight: '300' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#E8D5B7' },
  dateBox: { backgroundColor: '#8B5E3C', borderRadius: 10, padding: 8, alignItems: 'center', width: 48 },
  dateMonth: { fontSize: 9, color: 'white', fontWeight: '500' },
  dateNum: { fontSize: 22, color: 'white', fontWeight: '300' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '500', color: '#2C2016', marginBottom: 3 },
  cardSub: { fontSize: 11, color: '#8C7B68', marginBottom: 6 },
  tag: { backgroundColor: '#DDE8D0', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  tagText: { fontSize: 10, color: '#3B5230', fontWeight: '500' },
});