import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>privacy policy</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <Text style={styles.updated}>Last updated: June 2025</Text>

        <Text style={styles.heading}>Welcome to Sulli</Text>
        <Text style={styles.body}>Sulli ("we," "us," or "our") is a dating app for dog owners in the Kansas City metro area. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.</Text>

        <Text style={styles.heading}>Information we collect</Text>
        <Text style={styles.body}>We collect information you provide directly to us, including your name, age, email address, neighborhood, photos, and information about your dog. We also collect information about your activity in the app, such as profiles you view, swipes, matches, and messages.</Text>

        <Text style={styles.heading}>How we use your information</Text>
        <Text style={styles.body}>We use the information we collect to provide and improve the Sulli service, show your profile to potential matches, send you notifications about matches and messages, and ensure the safety of our community.</Text>

        <Text style={styles.heading}>Photos and media</Text>
        <Text style={styles.body}>Photos you upload are stored securely on our servers. Your profile photos are visible to other Sulli users. We do not sell or share your photos with third parties.</Text>

        <Text style={styles.heading}>Location information</Text>
        <Text style={styles.body}>We use your Kansas City neighborhood to show you relevant matches in your area. We do not track your precise real-time location unless you choose to share it through the Safety Circle feature.</Text>

        <Text style={styles.heading}>Safety Circle</Text>
        <Text style={styles.body}>When you use the Safety Circle feature, you choose to share your date details with trusted contacts. This information is only shared with the contacts you explicitly select.</Text>

        <Text style={styles.heading}>Data sharing</Text>
        <Text style={styles.body}>We do not sell your personal information to third parties. We may share your information with service providers who help us operate the app, such as our database provider Supabase, which is subject to its own privacy policy.</Text>

        <Text style={styles.heading}>Data retention</Text>
        <Text style={styles.body}>We retain your data for as long as your account is active. You may delete your account at any time by contacting us at support@sulliapp.com. Upon deletion, your profile and personal data will be removed from our systems within 30 days.</Text>

        <Text style={styles.heading}>Security</Text>
        <Text style={styles.body}>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet is 100% secure.</Text>

        <Text style={styles.heading}>Children's privacy</Text>
        <Text style={styles.body}>Sulli is not intended for users under the age of 18. We do not knowingly collect personal information from anyone under 18. If you believe we have collected information from a minor, please contact us immediately.</Text>

        <Text style={styles.heading}>Changes to this policy</Text>
        <Text style={styles.body}>We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or by email.</Text>

        <Text style={styles.heading}>Contact us</Text>
        <Text style={styles.body}>If you have any questions about this Privacy Policy, please contact us at support@sulliapp.com</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { fontSize: 14, color: '#8C7B68' },
  title: { fontSize: 20, color: '#2C2016', fontWeight: '500' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  updated: { fontSize: 12, color: '#8C7B68', marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: '500', color: '#2C2016', marginTop: 20, marginBottom: 8 },
  body: { fontSize: 14, color: '#8C7B68', lineHeight: 22 },
});