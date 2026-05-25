import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function ChatScreen() {
  const { matchId, otherId, name, dogName, emoji } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, []);

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    if (!error) setNewMessage('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerEmoji}>{emoji}</Text>
          <View>
            <Text style={styles.headerName}>{name} & {dogName}</Text>
            <Text style={styles.headerSub}>🐾 sulli match</Text>
          </View>
        </View>
      </View>
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: 16, gap: 8 }}>
        {messages.length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>{emoji}</Text>
            <Text style={styles.emptyChatText}>you matched with {name} & {dogName}!</Text>
            <Text style={styles.emptyChatSub}>say hello and plan a playdate 🐾</Text>
          </View>
        )}
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.sender_id === currentUserId ? styles.myBubble : styles.theirBubble]}>
            <Text style={[styles.bubbleText, msg.sender_id === currentUserId ? styles.myBubbleText : styles.theirBubbleText]}>
              {msg.content}
            </Text>
            <Text style={[styles.bubbleTime, msg.sender_id === currentUserId ? styles.myBubbleTime : styles.theirBubbleTime]}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="say something..."
          placeholderTextColor="#8C7B68"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>🐾</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E8D5B7', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: '#8B5E3C' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerEmoji: { fontSize: 32 },
  headerName: { fontSize: 15, fontWeight: '500', color: '#2C2016' },
  headerSub: { fontSize: 11, color: '#8C7B68' },
  messages: { flex: 1 },
  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyChatEmoji: { fontSize: 52 },
  emptyChatText: { fontSize: 16, color: '#2C2016', fontWeight: '500', textAlign: 'center' },
  emptyChatSub: { fontSize: 13, color: '#8C7B68' },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12, marginBottom: 4 },
  myBubble: { backgroundColor: '#8B5E3C', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8D5B7' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  myBubbleText: { color: 'white' },
  theirBubbleText: { color: '#2C2016' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  myBubbleTime: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  theirBubbleTime: { color: '#8C7B68' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E8D5B7', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#F7F2EA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#2C2016', maxHeight: 100, borderWidth: 1, borderColor: '#E8D5B7' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { fontSize: 18 },
});