import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wags 💬</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={styles.msgRow}>
          <View style={[styles.avatar, styles.unread]}>
            <Text style={styles.avatarEmoji}>🐩</Text>
          </View>
          <View style={styles.msgContent}>
            <View style={styles.msgTopRow}>
              <Text style={styles.msgName}>Jordan & Mochi</Text>
              <Text style={styles.msgTime}>2m</Text>
            </View>
            <Text style={[styles.msgPreview, styles.unreadText]}>Omg yes Shawnee Mission Sunday!</Text>
          </View>
          <View style={styles.unreadDot} />
        </View>
        <View style={styles.msgRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🐕</Text>
          </View>
          <View style={styles.msgContent}>
            <View style={styles.msgTopRow}>
              <Text style={styles.msgName}>Sam & Pretzel</Text>
              <Text style={styles.msgTime}>1h</Text>
            </View>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>🗓 Jun 7 · 10 AM · Shawnee Mission</Text>
            </View>
          </View>
        </View>
        <View style={styles.msgRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🐶</Text>
          </View>
          <View style={styles.msgContent}>
            <View style={styles.msgTopRow}>
              <Text style={styles.msgName}>Riley & Waffle</Text>
              <Text style={styles.msgTime}>3h</Text>
            </View>
            <Text style={styles.msgPreview}>Can't wait for Mildred's patio!</Text>
          </View>
        </View>
        <View style={styles.msgRow}>
          <View style={[styles.avatar, styles.unread]}>
            <Text style={styles.avatarEmoji}>🦮</Text>
          </View>
          <View style={styles.msgContent}>
            <View style={styles.msgTopRow}>
              <Text style={styles.msgName}>Casey & Duke</Text>
              <Text style={styles.msgTime}>1d</Text>
            </View>
            <Text style={[styles.msgPreview, styles.unreadText]}>He's obsessed with golden retrievers lol</Text>
          </View>
          <View style={styles.unreadDot} />
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
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7F2EA' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  unread: { borderColor: '#8B5E3C' },
  avatarEmoji: { fontSize: 22 },
  msgContent: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  msgName: { fontSize: 13, fontWeight: '500', color: '#2C2016' },
  msgTime: { fontSize: 10, color: '#8C7B68' },
  msgPreview: { fontSize: 12, color: '#8C7B68', fontWeight: '300' },
  unreadText: { color: '#2C2016', fontWeight: '400' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D4634A' },
  datePill: { backgroundColor: '#DDE8D0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  datePillText: { fontSize: 10, color: '#3B5230', fontWeight: '500' },
});