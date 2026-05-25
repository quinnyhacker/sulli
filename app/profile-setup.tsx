import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [dogEmoji, setDogEmoji] = useState('🐕');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dogEmojis = ['🐕', '🐩', '🐶', '🦮', '🐾'];

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('user:', user?.id);
      if (!user) {
        Alert.alert('Error', 'No user found');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        age: parseInt(age),
        neighborhood,
        dog_name: dogName,
        dog_breed: dogBreed,
        dog_age: parseInt(dogAge),
        dog_emoji: dogEmoji,
      }).select();
      console.log('save result:', data, error);
      if (error) {
        Alert.alert('Error', JSON.stringify(error));
        setLoading(false);
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Caught error', JSON.stringify(e));
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logo}>sulli 🐾</Text>
        <Text style={styles.stepText}>step {step} of 2</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { flex: 1, backgroundColor: '#8B5E3C' }]} />
          <View style={[styles.progressBar, { flex: 1, backgroundColor: step === 2 ? '#8B5E3C' : '#E8D5B7' }]} />
        </View>
        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.heading}>tell us about you</Text>
            <Text style={styles.label}>your first name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#8C7B68" />
            <Text style={styles.label}>your age</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="Age" placeholderTextColor="#8C7B68" keyboardType="numeric" />
            <Text style={styles.label}>your KC neighborhood</Text>
            <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="e.g. Brookside, Overland Park..." placeholderTextColor="#8C7B68" />
            <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>next →</Text>
            </TouchableOpacity>
          </View>
        )}
        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.heading}>tell us about your pup</Text>
            <Text style={styles.label}>dog's name</Text>
            <TextInput style={styles.input} value={dogName} onChangeText={setDogName} placeholder="Dog's name" placeholderTextColor="#8C7B68" />
            <Text style={styles.label}>breed</Text>
            <TextInput style={styles.input} value={dogBreed} onChangeText={setDogBreed} placeholder="e.g. Golden Retriever mix" placeholderTextColor="#8C7B68" />
            <Text style={styles.label}>age</Text>
            <TextInput style={styles.input} value={dogAge} onChangeText={setDogAge} placeholder="Dog's age" placeholderTextColor="#8C7B68" keyboardType="numeric" />
            <Text style={styles.label}>pick an emoji for your pup</Text>
            <View style={styles.emojiRow}>
              {dogEmojis.map(e => (
                <TouchableOpacity key={e} style={[styles.emojiBtn, dogEmoji === e && styles.emojiBtnActive]} onPress={() => setDogEmoji(e)}>
                  <Text style={styles.emoji}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>← back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'saving...' : "let's go 🐾"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  scroll: { padding: 28, paddingTop: 70 },
  logo: { fontSize: 28, color: '#8B5E3C', fontWeight: '300', marginBottom: 24 },
  stepText: { fontSize: 12, color: '#8C7B68', marginBottom: 8 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 32, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: 4, borderRadius: 2 },
  form: { width: '100%' },
  heading: { fontSize: 28, color: '#2C2016', fontWeight: '300', marginBottom: 24 },
  label: { fontSize: 12, color: '#8C7B68', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: 'white', borderRadius: 14, padding: 14, fontSize: 15, color: '#2C2016', borderWidth: 1, borderColor: '#E8D5B7' },
  button: { backgroundColor: '#8B5E3C', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  backBtn: { alignItems: 'center', marginTop: 16 },
  backBtnText: { color: '#8C7B68', fontSize: 14 },
  emojiRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  emojiBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'white', borderWidth: 1, borderColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { borderColor: '#8B5E3C', borderWidth: 2, backgroundColor: '#F7F2EA' },
  emoji: { fontSize: 26 },
});