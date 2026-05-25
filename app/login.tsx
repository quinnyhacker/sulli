import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
  email, 
  password,
  options: {
    emailRedirectTo: 'exp://localhost:8081'
  }
});
      if (error) Alert.alert('Error', error.message);
      else Alert.alert('Success!', 'Check your email to confirm your account, then log in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Error', error.message);
      else router.replace('/(tabs)');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.paw}>🐾</Text>
      <Text style={styles.logo}>sulli</Text>
      <Text style={styles.tagline}>dates with your best friend</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8C7B68"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8C7B68"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'loading...' : isSignUp ? 'create account' : 'sign in'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp ? 'already have an account? sign in' : "don't have an account? sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center', padding: 32 },
  paw: { fontSize: 52 },
  logo: { fontSize: 52, color: 'white', fontWeight: '300', marginBottom: 4 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 48 },
  form: { width: '100%', gap: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, fontSize: 15, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  button: { backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#8B5E3C', fontSize: 16, fontWeight: '500' },
  switchText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginTop: 8 },
});