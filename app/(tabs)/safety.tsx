import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete account', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Contact support', 'Please email support@sulliapp.com to delete your account.') }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#8C7B68' }}>loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>profile & settings</Text>
      </View>
      <ScrollView style={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profilePhotoRow}>
            {profile?.photos?.[0] ? (
              <Image source={{ uri: profile.photos[0] }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Text style={styles.profilePhotoEmoji}>{profile?.dog_emoji || '🐕'}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name}, {profile?.age}</Text>
              <Text style={styles.profileDog}>🐶 {profile?.dog_name} · {profile?.dog_breed}</Text>
              <Text style={styles.profileNeighborhood}>📍 {profile?.neighborhood}</Text>
            </View>
          </View>
          {profile?.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}
          <View style={styles.photoGrid}>
            {profile?.photos?.slice(0, 6).map((photo: string, i: number) => (
              <Image key={i} source={{ uri: photo }} style={styles.photoThumb} />
            ))}
          </View>
        </View>

        {/* Edit Profile */}
        <Text style={styles.sectionLabel}>MY PROFILE</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/profile-setup')}>
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuText}>Edit profile</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Safety */}
        <Text style={styles.sectionLabel}>SAFETY</Text>
        <View style={styles.menuCard}>
          <View style={styles.safetyBanner}>
            <Text style={styles.safetyIcon}>🛡</Text>
            <View style={styles.safetyInfo}>
              <Text style={styles.safetyTitle}>Safety circle</Text>
              <Text style={styles.safetySub}>Share date details with trusted contacts</Text>
            </View>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.contactRow}>
            <Text style={styles.contactEmoji}>👩</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Mom</Text>
              <Text style={styles.contactRel}>(913) 555-0142</Text>
            </View>
            <View style={styles.toggleOn}><Text style={styles.toggleText}>ON</Text></View>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.contactRow}>
            <Text style={styles.contactEmoji}>👫</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Becca</Text>
              <Text style={styles.contactRel}>(816) 555-0277</Text>
            </View>
            <View style={styles.toggleOn}><Text style={styles.toggleText}>ON</Text></View>
          </View>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>➕</Text>
            <Text style={styles.menuText}>Add trusted contact</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>📍</Text>
            <Text style={styles.menuText}>Location settings</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>🐕</Text>
            <Text style={styles.menuText}>Dog size preference</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Help & FAQ</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>📧</Text>
            <Text style={styles.menuText}>Contact support</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuIcon}>⭐</Text>
            <Text style={styles.menuText}>Rate Sulli</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={handleSignOut}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.menuText}>Sign out</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} onPress={handleDeleteAccount}>
            <Text style={styles.menuIcon}>🗑</Text>
            <Text style={[styles.menuText, { color: '#D4634A' }]}>Delete account</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>sulli v1.0 · made with 🐾 in Kansas City</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
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
  profilePhotoEmoji: { fontSize: 32 },
  profileInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  profileName: { fontSize: 18, fontWeight: '500', color: '#2C2016' },
  profileDog: { fontSize: 13, color: '#8B5E3C' },
  profileNeighborhood: { fontSize: 12, color: '#8C7B68' },
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
  safetyBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, backgroundColor: '#DDE8D0' },
  safetyIcon: { fontSize: 22 },
  safetyInfo: { flex: 1 },
  safetyTitle: { fontSize: 14, fontWeight: '500', color: '#1A3D0C' },
  safetySub: { fontSize: 12, color: '#3B5230' },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  contactEmoji: { fontSize: 22, width: 28 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '500', color: '#2C2016' },
  contactRel: { fontSize: 12, color: '#8C7B68' },
  toggleOn: { backgroundColor: '#7A8C6E', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  toggleText: { fontSize: 10, color: 'white', fontWeight: '500' },
  version: { fontSize: 11, color: '#8C7B68', textAlign: 'center', marginTop: 8 },
});