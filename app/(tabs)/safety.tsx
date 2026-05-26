import { useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [preferredSize, setPreferredSize] = useState('any');
  const [radius, setRadius] = useState(25);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRel, setNewRel] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);
    setPreferredSize(p?.preferred_dog_size || 'any');
    setRadius(p?.radius_miles || 25);
    const { data: c } = await supabase.from('safety_contacts').select('*').eq('user_id', user.id);
    setContacts(c || []);
    setLoading(false);
  };

  const addContact = async () => {
    if (!newName || !newPhone) { Alert.alert('Missing info', 'Please enter name and phone'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('safety_contacts').insert({ user_id: user.id, name: newName, phone: newPhone, relationship: newRel, enabled: true }).select().single();
    if (data) setContacts(prev => [...prev, data]);
    setNewName(''); setNewPhone(''); setNewRel('');
    setShowAddContact(false);
  };

  const toggleContact = async (id: string, enabled: boolean) => {
    await supabase.from('safety_contacts').update({ enabled: !enabled }).eq('id', id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, enabled: !enabled } : c));
  };

  const deleteContact = async (id: string) => {
    Alert.alert('Remove?', 'Remove this contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await supabase.from('safety_contacts').delete().eq('id', id);
        setContacts(prev => prev.filter(c => c.id !== id));
      }}
    ]);
  };

  const sendSOS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) { Alert.alert('SMS not available'); return; }
    const enabled = contacts.filter(c => c.enabled);
    if (enabled.length === 0) { Alert.alert('No contacts', 'Add trusted contacts first'); return; }
    await SMS.sendSMSAsync(enabled.map(c => c.phone), `🆘 SULLI SOS ALERT\n\n${profile?.name} needs help! Please check on them immediately.`);
  };

  if (loading) return <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#8C7B68' }}>loading...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>profile & settings</Text></View>
      <ScrollView style={styles.scroll}>

        <View style={styles.profileCard}>
          <View style={styles.profilePhotoRow}>
            {profile?.photos?.[0] ? <Image source={{ uri: profile.photos[0] }} style={styles.profilePhoto} /> : <View style={styles.profilePhotoPlaceholder}><Text style={{ fontSize: 32 }}>{profile?.dog_emoji || '🐕'}</Text></View>}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name}, {profile?.age}</Text>
              <Text style={styles.profileDog}>🐶 {profile?.dog_name} · {profile?.dog_breed}</Text>
              <Text style={{ fontSize: 12, color: '#8C7B68' }}>📍 {profile?.neighborhood}</Text>
            </View>
          </View>
          {profile?.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}
          <View style={styles.photoGrid}>{profile?.photos?.slice(0, 6).map((p: string, i: number) => <Image key={i} source={{ uri: p }} style={styles.photoThumb} />)}</View>
        </View>

        <Text style={styles.sectionLabel}>MY PROFILE</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.menuIcon}>✏️</Text><Text style={styles.menuText}>Edit profile</Text><Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>SAFETY CIRCLE</Text>
        <View style={styles.menuCard}>
          <View style={[styles.menuRow, { backgroundColor: '#DDE8D0' }]}>
            <Text style={styles.menuIcon}>🛡</Text>
            <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '500', color: '#1A3D0C' }}>Safety circle</Text><Text style={{ fontSize: 12, color: '#3B5230' }}>Trusted contacts get your date details via SMS</Text></View>
          </View>
          {contacts.map(c => (
            <View key={c.id}>
              <View style={styles.menuDivider} />
              <View style={styles.menuRow}>
                <Text style={styles.menuIcon}>👤</Text>
                <View style={{ flex: 1 }}><Text style={styles.menuText}>{c.name}</Text><Text style={{ fontSize: 11, color: '#8C7B68' }}>{c.relationship} · {c.phone}</Text></View>
                <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: c.enabled ? '#7A8C6E' : '#D3D1C7' }]} onPress={() => toggleContact(c.id, c.enabled)}>
                  <Text style={{ fontSize: 10, color: 'white', fontWeight: '500' }}>{c.enabled ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteContact(c.id)} style={{ padding: 4, marginLeft: 6 }}>
                  <Text style={{ color: '#D4634A' }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowAddContact(true)}>
            <Text style={styles.menuIcon}>➕</Text><Text style={styles.menuText}>Add trusted contact</Text><Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sosCard}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#2C2016', marginBottom: 6 }}>🆘 send safety alert now</Text>
          <Text style={{ fontSize: 12, color: '#8C7B68', marginBottom: 12 }}>Immediately text all enabled contacts</Text>
          <TouchableOpacity style={styles.sosBtn} onPress={() => Alert.alert('Send SOS?', 'This will text all your safety contacts now.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Send SOS', style: 'destructive', onPress: sendSOS }])}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>send SOS alert</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowNotifModal(true)}>
            <Text style={styles.menuIcon}>🔔</Text><Text style={styles.menuText}>Notifications</Text><Text style={styles.menuArrow}>{notifsEnabled ? 'On →' : 'Off →'}</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowSizeModal(true)}>
            <Text style={styles.menuIcon}>🐕</Text><Text style={styles.menuText}>Dog size preference</Text><Text style={styles.menuArrow}>{preferredSize === 'any' ? 'Any →' : `${preferredSize} →`}</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowRadiusModal(true)}>
            <Text style={styles.menuIcon}>📍</Text><Text style={styles.menuText}>Search radius</Text><Text style={styles.menuArrow}>{radius} miles →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow}><Text style={styles.menuIcon}>❓</Text><Text style={styles.menuText}>Help & FAQ</Text><Text style={styles.menuArrow}>→</Text></TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}><Text style={styles.menuIcon}>📧</Text><Text style={styles.menuText}>Contact support</Text><Text style={styles.menuArrow}>→</Text></TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/privacy')}><Text style={styles.menuIcon}>📄</Text><Text style={styles.menuText}>Privacy policy</Text><Text style={styles.menuArrow}>→</Text></TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}><Text style={styles.menuIcon}>⭐</Text><Text style={styles.menuText}>Rate Sulli</Text><Text style={styles.menuArrow}>→</Text></TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Sign out?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/login'); } }])}>
            <Text style={styles.menuIcon}>🚪</Text><Text style={styles.menuText}>Sign out</Text><Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Delete account', 'Email support@sulliapp.com to delete your account.')}>
            <Text style={styles.menuIcon}>🗑</Text><Text style={[styles.menuText, { color: '#D4634A' }]}>Delete account</Text><Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>sulli v1.0 · made with 🐾 in Kansas City</Text>
        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={showAddContact} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>add trusted contact</Text>
            <TextInput style={styles.modalInput} value={newName} onChangeText={setNewName} placeholder="Name (e.g. Mom)" placeholderTextColor="#8C7B68" />
            <TextInput style={[styles.modalInput, { marginTop: 10 }]} value={newPhone} onChangeText={setNewPhone} placeholder="Phone number" placeholderTextColor="#8C7B68" keyboardType="phone-pad" />
            <TextInput style={[styles.modalInput, { marginTop: 10 }]} value={newRel} onChangeText={setNewRel} placeholder="Relationship (e.g. Friend)" placeholderTextColor="#8C7B68" />
            <TouchableOpacity style={[styles.sosBtn, { marginTop: 20, backgroundColor: '#8B5E3C' }]} onPress={addContact}><Text style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>add contact</Text></TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 12, padding: 14, alignItems: 'center' }} onPress={() => setShowAddContact(false)}><Text style={{ color: '#8C7B68' }}>cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>notifications</Text>
            {['New matches', 'New messages', 'Date invites'].map(item => (
              <View key={item} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#F7F2EA', borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#2C2016' }}>{item}</Text>
                <TouchableOpacity style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: notifsEnabled ? '#8B5E3C' : '#D3D1C7', justifyContent: 'center', paddingHorizontal: 3 }} onPress={() => setNotifsEnabled(!notifsEnabled)}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'white', alignSelf: notifsEnabled ? 'flex-end' : 'flex-start' }} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={{ padding: 14, alignItems: 'center' }} onPress={() => setShowNotifModal(false)}><Text style={{ color: '#8C7B68' }}>done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSizeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>dog size preference</Text>
            {['any', 'Small', 'Medium', 'Large'].map(size => (
              <TouchableOpacity key={size} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: preferredSize === size ? '#8B5E3C' : '#E8D5B7', backgroundColor: preferredSize === size ? '#F7F2EA' : 'white', marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                onPress={async () => {
                  setPreferredSize(size);
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) await supabase.from('profiles').update({ preferred_dog_size: size }).eq('id', user.id);
                  setShowSizeModal(false);
                }}>
                <Text style={{ fontSize: 22 }}>{size === 'any' ? '🐾' : size === 'Small' ? '🐩' : size === 'Medium' ? '🐕' : '🦮'}</Text>
                <Text style={{ fontSize: 15, color: '#2C2016' }}>{size === 'any' ? 'No preference' : size}</Text>
                {preferredSize === size && <Text style={{ marginLeft: 'auto', color: '#8B5E3C' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ padding: 14, alignItems: 'center' }} onPress={() => setShowSizeModal(false)}><Text style={{ color: '#8C7B68' }}>cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRadiusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>search radius</Text>
            <Text style={{ fontSize: 32, fontWeight: '300', color: '#8B5E3C', textAlign: 'center', marginBottom: 16 }}>{radius} miles</Text>
            {[5, 10, 15, 25, 50].map(r => (
              <TouchableOpacity key={r} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: radius === r ? '#8B5E3C' : '#E8D5B7', backgroundColor: radius === r ? '#F7F2EA' : 'white', marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onPress={async () => {
                  setRadius(r);
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) await supabase.from('profiles').update({ radius_miles: r }).eq('id', user.id);
                  setShowRadiusModal(false);
                }}>
                <Text style={{ fontSize: 15, color: '#2C2016' }}>{r} miles</Text>
                <Text style={{ fontSize: 12, color: '#8C7B68' }}>{r === 5 ? 'Very close' : r === 10 ? 'Nearby' : r === 15 ? 'Local' : r === 25 ? 'Metro area' : 'Greater KC'}</Text>
                {radius === r && <Text style={{ color: '#8B5E3C' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ padding: 14, alignItems: 'center' }} onPress={() => setShowRadiusModal(false)}><Text style={{ color: '#8C7B68' }}>cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, color: '#2C2016', fontWeight: '300' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  profileCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E8D5B7' },
  profilePhotoRow: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  profilePhoto: { width: 72, height: 72, borderRadius: 36 },
  profilePhotoPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  profileName: { fontSize: 18, fontWeight: '500', color: '#2C2016' },
  profileDog: { fontSize: 13, color: '#8B5E3C' },
  profileBio: { fontSize: 13, color: '#8C7B68', lineHeight: 20, marginBottom: 12 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  photoThumb: { width: '30%', aspectRatio: 1, borderRadius: 8 },
  sectionLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 8, marginTop: 4 },
  menuCard: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E8D5B7', marginBottom: 16, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: { fontSize: 18, width: 28 },
  menuText: { flex: 1, fontSize: 14, color: '#2C2016' },
  menuArrow: { fontSize: 14, color: '#8C7B68' },
  menuDivider: { height: 1, backgroundColor: '#F7F2EA', marginLeft: 54 },
  toggleBtn: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  sosCard: { backgroundColor: '#FDF0EE', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F4B8A8' },
  sosBtn: { backgroundColor: '#D4634A', borderRadius: 12, padding: 12, alignItems: 'center' },
  version: { fontSize: 11, color: '#8C7B68', textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '300', color: '#2C2016', marginBottom: 20 },
  modalInput: { backgroundColor: '#F7F2EA', borderRadius: 12, padding: 12, fontSize: 14, color: '#2C2016', borderWidth: 1, borderColor: '#E8D5B7' },
});