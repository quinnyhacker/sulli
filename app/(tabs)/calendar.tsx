import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../supabase';

export default function CalendarScreen() {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDates();
  }, []);

  const loadDates = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('date_invites')
      .select(`
        id,
        venue,
        date,
        time,
        status,
        match_id,
        sender_id
      `)
      .eq('status', 'accepted')
      .order('created_at', { ascending: true });

    setDates(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your plans 🗓</Text>
      </View>
      <ScrollView style={styles.scroll}>
        {dates.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗓</Text>
            <Text style={styles.emptyTitle}>no dates planned yet!</Text>
            <Text style={styles.emptySub}>Send a date invite from your matches to get started</Text>
          </View>
        )}
        {dates.map((date) => (
          <View key={date.id} style={styles.card}>
            <View style={styles.dateBox}>
              <Text style={styles.dateNum}>🗓</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{date.venue}</Text>
              <Text style={styles.cardSub}>{date.date} · {date.time}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>✓ confirmed</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, color: '#2C2016', fontWeight: '300' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 22, color: '#2C2016', fontWeight: '300' },
  emptySub: { fontSize: 13, color: '#8C7B68', textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#E8D5B7' },
  dateBox: { backgroundColor: '#8B5E3C', borderRadius: 10, padding: 8, alignItems: 'center', width: 48, justifyContent: 'center' },
  dateNum: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '500', color: '#2C2016', marginBottom: 3 },
  cardSub: { fontSize: 11, color: '#8C7B68', marginBottom: 6 },
  tag: { backgroundColor: '#DDE8D0', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  tagText: { fontSize: 10, color: '#3B5230', fontWeight: '500' },
});