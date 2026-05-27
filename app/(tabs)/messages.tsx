import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function MessagesScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id, created_at')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) { setMatches([]); setLoading(false); return; }

    const matchesWithProfiles = await Promise.all(data.map(async (match) => {
      const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, dog_name, dog_emoji, photos')
        .eq('id', otherId)
        .single();
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return { ...match, profile, lastMsg, otherId };
    }));

    setMatches(matchesWithProfiles);
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
        <Text style={styles.title}>Wags</Text>
      </View>
      <ScrollView style={styles.scroll}>
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <View style={styles.bubble} />
              <View style={styles.bubbleTail} />
              <View style={[styles.bubbleDot, { left: 10 }]} />
              <View style={[styles.bubbleDot, { left: 20 }]} />
              <View style={[styles.bubbleDot, { left: 30 }]} />
            </View>
            <Text style={styles.emptyTitle}>no matches yet</Text>
            <Text style={styles.emptySub}>Keep swiping to find your pup's new best friend</Text>
          </View>
        ) : (
          matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.msgRow}
              onPress={() => router.push(`/chat?matchId=${match.id}&otherId=${match.otherId}&name=${match.profile?.name}&dogName=${match.profile?.dog_name}&emoji=${match.profile?.dog_emoji}`)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {match.profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.msgContent}>
                <View style={styles.msgTopRow}>
                  <Text style={styles.msgName}>{match.profile?.name} & {match.profile?.dog_name}</Text>
                  <Text style={styles.msgTime}>{match.lastMsg ? new Date(match.lastMsg.created_at).toLocaleDateString() : 'new'}</Text>
                </View>
                <Text style={styles.msgPreview} numberOfLines={1}>
                  {match.lastMsg?.content?.startsWith('📅 DATE_INVITE:') 
                    ? 'sent a date invite' 
                    : match.lastMsg?.content 
                    || 'you matched — say hello'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  emptyIcon: { width: 56, height: 56, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  bubble: { width: 48, height: 36, borderRadius: 12, borderWidth: 2, borderColor: '#C8956C' },
  bubbleTail: { position: 'absolute', bottom: 4, left: 10, width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#C8956C', transform: [{ rotate: '-45deg' }] },
  bubbleDot: { position: 'absolute', top: 16, width: 4, height: 4, borderRadius: 2, backgroundColor: '#C8956C' },
  emptyTitle: { fontSize: 22, color: '#2C2016', fontWeight: '300' },
  emptySub: { fontSize: 13, color: '#8C7B68', textAlign: 'center', lineHeight: 20 },
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F0EBE3' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '500', color: 'white' },
  msgContent: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  msgName: { fontSize: 13, fontWeight: '500', color: '#2C2016' },
  msgTime: { fontSize: 10, color: '#8C7B68' },
  msgPreview: { fontSize: 12, color: '#8C7B68', fontWeight: '300' },
});