import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SafetyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety circle 🛡</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={styles.safetyBanner}>
          <Text style={styles.safetyBannerTitle}>🛡 Safety sharing is on</Text>
          <Text style={styles.safetyBannerText}>Your trusted contacts receive your date details — location, time, and match profile — before each date.</Text>
        </View>
        <Text style={styles.sectionLabel}>TRUSTED CONTACTS</Text>
        <View style={styles.contactRow}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactEmoji}>👩</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Mom</Text>
            <Text style={styles.contactRel}>Family · (913) 555-0142</Text>
          </View>
          <View style={styles.toggleOn}>
            <Text style={styles.toggleText}>ON</Text>
          </View>
        </View>
        <View style={styles.contactRow}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactEmoji}>👫</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Becca (bestie)</Text>
            <Text style={styles.contactRel}>Friend · (816) 555-0277</Text>
          </View>
          <View style={styles.toggleOn}>
            <Text style={styles.toggleText}>ON</Text>
          </View>
        </View>
        <View style={styles.contactRow}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactEmoji}>🧑</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Marcus</Text>
            <Text style={styles.contactRel}>Friend · (913) 555-0391</Text>
          </View>
          <View style={styles.toggleOff}>
            <Text style={styles.toggleTextOff}>OFF</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add trusted contact</Text>
        </TouchableOpacity>
        <Text style={styles.sectionLabel}>WHAT THEY RECEIVE</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>Exact venue name and address</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>Date and time of the meetup</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <Text style={styles.infoText}>Your match's first name and dog</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🆘</Text>
            <Text style={styles.infoText}>SOS button sends your live location</Text>
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
  safetyBanner: { backgroundColor: '#DDE8D0', borderWidth: 1, borderColor: '#B8C8A8', borderRadius: 14, padding: 14, marginBottom: 16 },
  safetyBannerTitle: { fontSize: 14, fontWeight: '500', color: '#1A3D0C', marginBottom: 6 },
  safetyBannerText: { fontSize: 12, color: '#3B5230', lineHeight: 18 },
  sectionLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 10, marginTop: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7F2EA' },
  contactAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center' },
  contactEmoji: { fontSize: 20 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 13, fontWeight: '500', color: '#2C2016' },
  contactRel: { fontSize: 11, color: '#8C7B68' },
  toggleOn: { backgroundColor: '#7A8C6E', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  toggleText: { fontSize: 10, color: 'white', fontWeight: '500' },
  toggleOff: { backgroundColor: '#D3D1C7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  toggleTextOff: { fontSize: 10, color: '#5F5E5A', fontWeight: '500' },
  addButton: { borderWidth: 1, borderColor: '#E8D5B7', backgroundColor: 'white', borderRadius: 20, padding: 12, alignItems: 'center', marginTop: 12, marginBottom: 16 },
  addButtonText: { fontSize: 13, color: '#8B5E3C', fontWeight: '500' },
  infoCard: { backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E8D5B7', marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  infoIcon: { fontSize: 16, width: 24 },
  infoText: { fontSize: 13, color: '#2C2016' },
});