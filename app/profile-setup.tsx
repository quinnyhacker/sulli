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
  const [gender, setGender] = useState('');
  const [seeking, setSeeking] = useState('Everyone');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [dogSize, setDogSize] = useState('Medium');
  const router = useRouter();

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access in Settings');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const uri = result.assets[0].uri;
      const fileName = `${user.id}_${Date.now()}.jpg`;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setPhotos(prev => [...prev, publicUrl]);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
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
    if (!gender) {
      Alert.alert('Missing info', 'Please select your gender');
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
        gender,
        seeking,
        dog_name: dogName,
        dog_breed: dogBreed,
        dog_age: parseInt(dogAge),
        dog_size: dogSize,
        latitude: location?.latitude,
        longitude: location?.longitude,
        last_active: new Date().toISOString(),
        photos,
      });
      if (error) throw new Error(JSON.stringify(error));
      setDone(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={styles.doneScreen}>
        <View style={styles.doneIcon}>
          <View style={styles.doneCircle} />
          <View style={styles.doneCheck} />
        </View>
        <Text style={styles.doneTitle}>you're all set!</Text>
        <Text style={styles.doneSub}>time to find your pup's new best friend</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.doneButtonText}>start exploring</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>sulli</Text>
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

            <Text style={styles.label}>i am a</Text>
            <View style={styles.sizeRow}>
              {['Man', 'Woman', 'Non-binary'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.sizeBtn, gender === g && styles.sizeBtnActive]}
                  onPress={() => setGender(g)}>
                  <Text style={[styles.sizeBtnText, { color: gender === g ? '#8B5E3C' : '#8C7B68' }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>i want to meet</Text>
            <View style={styles.sizeRow}>
              {['Men', 'Women', 'Everyone'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeBtn, seeking === s && styles.sizeBtnActive]}
                  onPress={() => setSeeking(s)}>
                  <Text style={[styles.sizeBtnText, { color: seeking === s ? '#8B5E3C' : '#8C7B68' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>your KC neighborhood</Text>
            <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="e.g. Brookside, Overland Park..." placeholderTextColor="#8C7B68" />

            <Text style={styles.label}>about you and your pup</Text>
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Tell people about yourself and your dog..." placeholderTextColor="#8C7B68" multiline />

            <TouchableOpacity style={[styles.locationBtn, { backgroundColor: location ? '#DDE8D0' : 'white', borderColor: location ? '#7A8C6E' : '#E8D5B7' }]} onPress={getLocation}>
              <View style={styles.locationIcon}>
                <View style={[styles.locationCircle, { borderColor: location ? '#3B6D11' : '#8B5E3C' }]} />
                <View style={[styles.locationPin, { backgroundColor: location ? '#3B6D11' : '#8B5E3C' }]} />
              </View>
              <Text style={[styles.locationBtnText, { color: location ? '#3B6D11' : '#8B5E3C' }]}>
                {location ? 'location captured' : 'get my location'}
              </Text>
              {location && <Text style={{ color: '#3B6D11', fontSize: 12 }}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>next</Text>
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
            <View style={styles.sizeRow}>
              {['Small', 'Medium', 'Large'].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeBtn, dogSize === size && styles.sizeBtnActive]}
                  onPress={() => setDogSize(size)}>
                  <View style={styles.sizeDogIcon}>
                    <View style={[styles.sizeDogBody, {
                      width: size === 'Small' ? 16 : size === 'Medium' ? 22 : 28,
                      height: size === 'Small' ? 12 : size === 'Medium' ? 16 : 20,
                      borderColor: dogSize === size ? '#8B5E3C' : '#C4B8AC'
                    }]} />
                    <View style={[styles.sizeDogHead, {
                      width: size === 'Small' ? 10 : size === 'Medium' ? 13 : 16,
                      height: size === 'Small' ? 10 : size === 'Medium' ? 13 : 16,
                      borderColor: dogSize === size ? '#8B5E3C' : '#C4B8AC'
                    }]} />
                  </View>
                  <Text style={[styles.sizeBtnText, { color: dogSize === size ? '#8B5E3C' : '#8C7B68' }]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>← back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.heading}>add your photos</Text>
            <View style={styles.dogFirstBanner}>
              <Text style={styles.dogFirstText}>make your dog the first photo!</Text>
            </View>
            <Text style={styles.photoSubtitle}>all 6 photos are required to continue</Text>
            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.photoSlot}
                  activeOpacity={0.7}
                  onPress={() => { if (photos[i]) { removePhoto(i); } else { pickImage(); } }}>
                  {photos[i] ? (
                    <>
                      <Image source={{ uri: photos[i] }} style={styles.photoThumb} />
                      {i === 0 && <View style={styles.firstBadge}><Text style={styles.firstBadgeText}>first</Text></View>}
                      <View style={styles.removeBtn}><Text style={styles.removeBtnText}>×</Text></View>
                    </>
                  ) : (
                    <View style={styles.photoEmpty}>
                      <Text style={styles.photoEmptyIcon}>+</Text>
                      <Text style={styles.photoEmptyText}>{i === 0 ? 'your dog' : `photo ${i + 1}`}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {uploading && <Text style={styles.uploadingText}>uploading...</Text>}
            <Text style={styles.photoCount}>{photos.length} of 6 photos added</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>← back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, photos.length < 6 && styles.buttonDisabled]}
              onPress={saveProfile}
              disabled={loading || photos.length < 6}>
              <Text style={styles.buttonText}>{loading ? 'saving...' : "let's go"}</Text>
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
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 16 },
  locationIcon: { width: 20, height: 24, alignItems: 'center' },
  locationCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  locationPin: { width: 2, height: 6, borderRadius: 1, marginTop: -1 },
  locationBtnText: { flex: 1, fontSize: 14 },
  sizeRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  sizeBtn: { flex: 1, borderWidth: 1, borderColor: '#E8D5B7', borderRadius: 12, padding: 12, alignItems: 'center', backgroundColor: 'white', gap: 6 },
  sizeBtnActive: { borderColor: '#8B5E3C', borderWidth: 1.5, backgroundColor: '#F7F2EA' },
  sizeDogIcon: { width: 32, height: 24, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' },
  sizeDogBody: { borderWidth: 1.5, borderRadius: 4 },
  sizeDogHead: { borderWidth: 1.5, borderRadius: 8, position: 'absolute', top: 0, right: 0 },
  sizeBtnText: { fontSize: 11, fontWeight: '500' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  photoSlot: { width: '30%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoEmpty: { width: '100%', height: '100%', backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E8D5B7', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoEmptyIcon: { fontSize: 24, color: '#C8956C' },
  photoEmptyText: { fontSize: 10, color: '#8C7B68' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: 'white', fontSize: 14, fontWeight: '300' },
  uploadingText: { fontSize: 13, color: '#8B5E3C', textAlign: 'center', marginBottom: 8 },
  photoCount: { fontSize: 12, color: '#8C7B68', textAlign: 'center', marginBottom: 8 },
  firstBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#8B5E3C', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  firstBadgeText: { fontSize: 9, color: 'white', fontWeight: '500' },
  dogFirstBanner: { backgroundColor: '#DDE8D0', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#B8C8A8', alignItems: 'center' },
  dogFirstText: { fontSize: 13, color: '#1A3D0C', fontWeight: '500' },
  doneScreen: { flex: 1, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  doneIcon: { width: 80, height: 80, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  doneCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.8)' },
  doneCheck: { position: 'absolute', width: 28, height: 16, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: 'white', transform: [{ rotate: '-45deg' }], marginTop: -8 },
  doneTitle: { fontSize: 36, color: 'white', fontWeight: '300', fontStyle: 'italic' },
  doneSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  doneButton: { marginTop: 16, backgroundColor: 'white', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  doneButtonText: { color: '#8B5E3C', fontSize: 16, fontWeight: '500' },
});