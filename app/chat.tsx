import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

const KC_VENUES = [
  "Shawnee Mission Dog Park",
  "Penn Valley Dog Park",
  "Longview Lake Dog Park",
  "Loose Park",
  "Mildred's Coffeehouse Patio",
  "The Peanut Waldo",
  "Martin City Brewing",
  "Bark Social KC",
  "Fox & Pearl Patio",
  "KC Tails Dog Spa",
];

const TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

export default function ChatScreen() {
  const { matchId, otherId, name, dogName, emoji } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [dateInvites, setDateInvites] = useState<any[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    loadMessages();
    loadDateInvites();
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

  const loadDateInvites = async () => {
    const { data } = await supabase
      .from('date_invites')
      .select('*')
      .eq('match_id', matchId);
    setDateInvites(data || []);
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
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const sendDateInvite = async () => {
    if (!selectedVenue || !selectedDate || !selectedTime) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('date_invites').insert({
      match_id: matchId,
      sender_id: user.id,
      venue: selectedVenue,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
    }).select().single();
    if (data) {
      setDateInvites(prev => [...prev, data]);
      await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: user.id,
        content: `📅 DATE_INVITE:${data.id}`,
      });
    }
    setShowDateModal(false);
    setSelectedVenue('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const respondToInvite = async (inviteId: string, status: string) => {
  await supabase.from('date_invites').update({ status }).eq('id', inviteId);
  setDateInvites(prev => prev.map(inv => inv.id === inviteId ? { ...inv, status } : inv));
  
  if (status === 'accepted') {
    const invite = dateInvites.find(inv => inv.id === inviteId);
    if (!invite) return;
    Alert.alert(
      '🛡 Share with safety circle?',
      `Let your trusted contacts know about your date at ${invite.venue} on ${invite.date} at ${invite.time}?`,
      [
        { text: 'Skip', style: 'cancel' },
        { text: 'Send SMS', onPress: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data: contacts } = await supabase
            .from('safety_contacts')
            .select('*')
            .eq('user_id', user.id)
            .eq('enabled', true);
          if (!contacts || contacts.length === 0) {
            Alert.alert('No contacts', 'Add trusted contacts in your Profile settings first!');
            return;
          }
          const { default: SMS } = await import('expo-sms');
          const isAvailable = await SMS.isAvailableAsync();
          if (!isAvailable) { Alert.alert('SMS not available'); return; }
          const phones = contacts.map((c: any) => c.phone);
          const message = `🐾 Sulli Safety Alert\n\nI have a date planned!\n\n📍 Where: ${invite.venue}\n📅 When: ${invite.date} at ${invite.time}\n🐕 With: ${name} & ${dogName}\n\nI'll check in after. If you don't hear from me please check on me!`;
          await SMS.sendSMSAsync(phones, message);
        }}
      ]
    );
  }
};
  const handleReport = async (reason: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_id: otherId,
    reason,
  });
  setShowReportModal(false);
  Alert.alert('Report submitted', 'Thank you for keeping Sulli safe. We will review this report shortly.');
};

const handleBlock = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('blocks').insert({
    blocker_id: user.id,
    blocked_id: otherId,
  });
  Alert.alert('User blocked', `${name} has been blocked and will no longer appear in your matches.`, [
    { text: 'OK', onPress: () => router.replace('/(tabs)') }
  ]);
};

  const renderMessage = (msg: any) => {
    const isMe = msg.sender_id === currentUserId;
    if (msg.content.startsWith('📅 DATE_INVITE:')) {
      const inviteId = msg.content.replace('📅 DATE_INVITE:', '');
      const invite = dateInvites.find(inv => inv.id === inviteId);
      if (!invite) return null;
      return (
        <View key={msg.id} style={[styles.inviteCard, isMe ? styles.inviteCardMe : styles.inviteCardThem]}>
          <Text style={styles.inviteHeader}>🗓 date invite</Text>
          <Text style={styles.inviteVenue}>{invite.venue}</Text>
          <Text style={styles.inviteDateTime}>{invite.date} · {invite.time}</Text>
          {invite.status === 'pending' && !isMe && (
            <View style={styles.inviteBtns}>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => respondToInvite(invite.id, 'accepted')}>
                <Text style={styles.acceptBtnText}>accept 🐾</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn} onPress={() => respondToInvite(invite.id, 'declined')}>
                <Text style={styles.declineBtnText}>decline</Text>
              </TouchableOpacity>
            </View>
          )}
          {invite.status === 'accepted' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusAccepted}>✓ date confirmed!</Text>
            </View>
          )}
          {invite.status === 'declined' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusDeclined}>✕ declined</Text>
            </View>
          )}
          {invite.status === 'pending' && isMe && (
            <Text style={styles.statusPending}>waiting for response...</Text>
          )}
        </View>
      );
    }
    return (
      <View key={msg.id} style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.bubbleText, isMe ? styles.myBubbleText : styles.theirBubbleText]}>
          {msg.content}
        </Text>
        <Text style={[styles.bubbleTime, isMe ? styles.myBubbleTime : styles.theirBubbleTime]}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
  <TouchableOpacity style={styles.dateInviteBtn} onPress={() => setShowDateModal(true)}>
    <Text style={styles.dateInviteBtnText}>🗓 invite</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.reportBtn} onPress={() => setShowReportModal(true)}>
    <Text style={styles.reportBtnText}>⚠️</Text>
  </TouchableOpacity>
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
        {messages.map(renderMessage)}
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

      <Modal visible={showDateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>plan a date 🗓</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>PICK A SPOT</Text>
            <TouchableOpacity style={styles.mapPickerBtn} onPress={() => router.push('/map-picker' as any)}>
  <Text style={styles.mapPickerBtnText}>🗺 open map to pick a spot</Text>
</TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.venueScroll}>
              {KC_VENUES.map(v => (
                <TouchableOpacity key={v} style={[styles.venueChip, selectedVenue === v && styles.venueChipActive]} onPress={() => setSelectedVenue(v)}>
                  <Text style={[styles.venueChipText, selectedVenue === v && styles.venueChipTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>DATE</Text>
            <TextInput
              style={styles.modalInput}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="e.g. Saturday June 7"
              placeholderTextColor="#8C7B68"
            />

            <Text style={styles.modalLabel}>TIME</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
              {TIMES.map(t => (
                <TouchableOpacity key={t} style={[styles.timeChip, selectedTime === t && styles.timeChipActive]} onPress={() => setSelectedTime(t)}>
                  <Text style={[styles.timeChipText, selectedTime === t && styles.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.sendInviteBtn, (!selectedVenue || !selectedDate || !selectedTime) && styles.sendInviteBtnDisabled]}
              onPress={sendDateInvite}
              disabled={!selectedVenue || !selectedDate || !selectedTime}>
              <Text style={styles.sendInviteBtnText}>send invite 🐾</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showReportModal} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalSheet}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>report or block</Text>
        <TouchableOpacity onPress={() => setShowReportModal(false)}>
          <Text style={styles.modalClose}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.modalLabel}>REPORT REASON</Text>
      {['Inappropriate behavior', 'Fake profile', 'Harassment', 'Spam', 'Other'].map(reason => (
        <TouchableOpacity
          key={reason}
          style={[styles.reportReasonBtn, reportReason === reason && styles.reportReasonBtnActive]}
          onPress={() => setReportReason(reason)}>
          <Text style={[styles.reportReasonText, reportReason === reason && styles.reportReasonTextActive]}>{reason}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.sendInviteBtn, !reportReason && styles.sendInviteBtnDisabled, { marginTop: 16 }]}
        onPress={() => handleReport(reportReason)}
        disabled={!reportReason}>
        <Text style={styles.sendInviteBtnText}>submit report</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.blockBtn}
        onPress={() => {
          Alert.alert('Block user', `Are you sure you want to block ${name}? They will be removed from your matches.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: handleBlock }
          ]);
        }}>
        <Text style={styles.blockBtnText}>block {name}</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E8D5B7', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 24, color: '#8B5E3C' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerEmoji: { fontSize: 32 },
  headerName: { fontSize: 15, fontWeight: '500', color: '#2C2016' },
  headerSub: { fontSize: 11, color: '#8C7B68' },
  dateInviteBtn: { backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  dateInviteBtnText: { fontSize: 12, color: '#8B5E3C', fontWeight: '500' },
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
  inviteCard: { borderRadius: 16, padding: 14, marginBottom: 4, borderWidth: 1, maxWidth: '85%' },
  inviteCardMe: { backgroundColor: '#FDF5EE', borderColor: '#C8956C', alignSelf: 'flex-end' },
  inviteCardThem: { backgroundColor: 'white', borderColor: '#E8D5B7', alignSelf: 'flex-start' },
  inviteHeader: { fontSize: 11, color: '#8C7B68', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  inviteVenue: { fontSize: 15, fontWeight: '500', color: '#2C2016', marginBottom: 4 },
  inviteDateTime: { fontSize: 13, color: '#8B5E3C', marginBottom: 10 },
  inviteBtns: { flexDirection: 'row', gap: 8 },
  acceptBtn: { flex: 1, backgroundColor: '#8B5E3C', borderRadius: 12, padding: 10, alignItems: 'center' },
  acceptBtnText: { color: 'white', fontSize: 13, fontWeight: '500' },
  declineBtn: { flex: 1, backgroundColor: '#F7F2EA', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E8D5B7' },
  declineBtnText: { color: '#8C7B68', fontSize: 13 },
  statusBadge: { marginTop: 4 },
  statusAccepted: { color: '#3B6D11', fontSize: 13, fontWeight: '500' },
  statusDeclined: { color: '#D4634A', fontSize: 13 },
  statusPending: { color: '#8C7B68', fontSize: 12, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E8D5B7', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#F7F2EA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#2C2016', maxHeight: 100, borderWidth: 1, borderColor: '#E8D5B7' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '300', color: '#2C2016' },
  modalClose: { fontSize: 18, color: '#8C7B68' },
  modalLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: '#F7F2EA', borderRadius: 12, padding: 12, fontSize: 14, color: '#2C2016', borderWidth: 1, borderColor: '#E8D5B7', marginBottom: 4 },
  venueScroll: { marginBottom: 4 },
  venueChip: { borderWidth: 1, borderColor: '#E8D5B7', backgroundColor: '#F7F2EA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  venueChipActive: { backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' },
  venueChipText: { fontSize: 12, color: '#8B5E3C' },
  venueChipTextActive: { color: 'white' },
  timeScroll: { marginBottom: 16 },
  timeChip: { borderWidth: 1, borderColor: '#E8D5B7', backgroundColor: '#F7F2EA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  timeChipActive: { backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' },
  timeChipText: { fontSize: 12, color: '#8B5E3C' },
  timeChipTextActive: { color: 'white' },
  sendInviteBtn: { backgroundColor: '#8B5E3C', borderRadius: 16, padding: 16, alignItems: 'center' },
  sendInviteBtnDisabled: { opacity: 0.5 },
  sendInviteBtnText: { color: 'white', fontSize: 16, fontWeight: '500' },
  reportBtn: { backgroundColor: '#FDF0EE', borderWidth: 1, borderColor: '#F4B8A8', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
reportBtnText: { fontSize: 12 },
reportReasonBtn: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E8D5B7', marginBottom: 8, backgroundColor: '#F7F2EA' },
reportReasonBtnActive: { backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' },
reportReasonText: { fontSize: 14, color: '#2C2016' },
reportReasonTextActive: { color: 'white' },
blockBtn: { marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#F4B8A8', alignItems: 'center' },
blockBtnText: { fontSize: 14, color: '#D4634A', fontWeight: '500' },
mapPickerBtn: { backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 10 },
mapPickerBtnText: { fontSize: 13, color: '#8B5E3C', fontWeight: '500' },
});