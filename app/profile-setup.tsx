import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function ProfileSetup() {
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [dogEmoji, setDogEmoji] = useState('🐕');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const [dogSize, setDogSize] = useState('Medium');

  const dogEmojis = ['🐕', '🐩', '🐶', '🦮', '🐾'];
  const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Location needed', 'Please allow location access to find matches near you');
    return;
  }
  const loc = await Location.getCurrentPositionAsync({});
  setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
};

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Max photos', 'You can only add 6 photos');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const uri = result.assets[0].uri;
      const fileName = `${user.id}_${Date.now()}.jpg`;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) {
        Alert.alert('Upload error', uploadError.message);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setPhotos(prev => [...prev, publicUrl]);
    } catch (e: any) {
      Alert.alert('Error', e.message || JSON.stringify(e));
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    if (photos.length < 6) {
      Alert.alert('Add more photos', 'Please add 6 photos to continue');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        age: parseInt(age),
        bio,
        neighborhood,
        dog_name: dogName,
        dog_breed: dogBreed,
        dog_age: parseInt(dogAge),
        dog_emoji: dogEmoji,
        dog_size: dogSize,
        latitude: location?.latitude,
longitude: location?.longitude,
        photos,
      });
      if (error) {
        Alert.alert('Error', JSON.stringify(error));
        setLoading(false);
      } else {
        setDone(true);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || JSON.stringify(e));
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={styles.doneScreen}>
        <Text style={styles.doneEmoji}>🐾</Text>
        <Text style={styles.doneTitle}>you're all set!</Text>
        <Text style={styles.doneSub}>time to find your pup's new best friend</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.doneButtonText}>start exploring →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logo}>sulli 🐾</Text>
        <Text style={styles.stepText}>step {step} of 3</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { flex: 1, backgroundColor: '#8B5E3C' }]} />
          <View style={[styles.progressBar, { flex: 1, backgroundColor: step >= 2 ? '#8B5E3C' : '#E8D5B7' }]} />
          <View style={[styles.progressBar, { flex: 1, backgroundColor: step === 3 ? '#8B5E3C' : '#E8D5B7' }]} />
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
            <Text style={styles.label}>about you and your pup</Text>
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Tell people about yourself and your dog..." placeholderTextColor="#8C7B68" multiline />
            <TouchableOpacity style={[styles.button, { backgroundColor: location ? '#7A8C6E' : '#C8956C', marginTop: 12 }]} onPress={getLocation}>
  <Text style={styles.buttonText}>{location ? '📍 location captured!' : '📍 get my location'}</Text>
</TouchableOpacity>
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
            <Text style={styles.label}>dog size</Text>
<View style={styles.emojiRow}>
  {['Small', 'Medium', 'Large'].map(size => (
    <TouchableOpacity
      key={size}
      style={[styles.emojiBtn, dogSize === size && styles.emojiBtnActive]}
      onPress={() => setDogSize(size)}>
      <Text style={styles.emoji}>{size === 'Small' ? '🐩' : size === 'Medium' ? '🐕' : '🦮'}</Text>
      <Text style={{ fontSize: 10, color: dogSize === size ? '#8B5E3C' : '#8C7B68' }}>{size}</Text>
    </TouchableOpacity>
  ))}
</View>
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
            <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>next →</Text>
            </TouchableOpacity>
          </View>
        )}
        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.heading}>add 6 photos 📸</Text>
            <Text style={styles.photoSubtitle}>show off you and your pup! all 6 are required.</Text>
            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => photos[i] ? removePhoto(i) : pickImage()}>
                  {photos[i] ? (
                    <>
                      <Image source={{ uri: photos[i] }} style={styles.photoThumb} />
                      <View style={styles.removeBtn}>
                        <Text style={styles.removeBtnText}>✕</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoEmpty}>
                      <Text style={styles.photoEmptyIcon}>+</Text>
                      <Text style={styles.photoEmptyText}>photo {i + 1}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {uploading && <Text style={styles.uploadingText}>uploading photo...</Text>}
            <Text style={styles.photoCount}>{photos.length} of 6 photos added</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>← back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, photos.length < 6 && styles.buttonDisabled]}
              onPress={saveProfile}
              disabled={loading || photos.length < 6}>
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
  heading: { fontSize: 28, color: '#2C2016', fontWeight: '300', marginBottom: 8 },
  photoSubtitle: { fontSize: 13, color: '#8C7B68', marginBottom: 20 },
  label: { fontSize: 12, color: '#8C7B68', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: 'white', borderRadius: 14, padding: 14, fontSize: 15, color: '#2C2016', borderWidth: 1, borderColor: '#E8D5B7' },
  button: { backgroundColor: '#8B5E3C', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#C8956C', opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  backBtn: { alignItems: 'center', marginTop: 16 },
  backBtnText: { color: '#8C7B68', fontSize: 14 },
  emojiRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  emojiBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'white', borderWidth: 1, borderColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { borderColor: '#8B5E3C', borderWidth: 2, backgroundColor: '#F7F2EA' },
  emoji: { fontSize: 26 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  photoSlot: { width: '30%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoEmpty: { width: '100%', height: '100%', backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E8D5B7', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoEmptyIcon: { fontSize: 24, color: '#C8956C' },
  photoEmptyText: { fontSize: 10, color: '#8C7B68' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: 'white', fontSize: 10, fontWeight: '700' },
  uploadingText: { fontSize: 13, color: '#8B5E3C', textAlign: 'center', marginBottom: 8 },
  photoCount: { fontSize: 12, color: '#8C7B68', textAlign: 'center', marginBottom: 8 },
  doneScreen: { flex: 1, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  doneEmoji: { fontSize: 72 },
  doneTitle: { fontSize: 36, color: 'white', fontWeight: '300', fontStyle: 'italic' },
  doneSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  doneButton: { marginTop: 16, backgroundColor: 'white', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  doneButtonText: { color: '#8B5E3C', fontSize: 16, fontWeight: '500' },
});