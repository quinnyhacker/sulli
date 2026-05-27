import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

const PERSONALITY_TRAITS = ['Energetic', 'Calm', 'Playful', 'Shy', 'Friendly', 'Loves other dogs', 'Protective', 'Lazy', 'Adventurous', 'Cuddly'];

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
  const [dogSize, setDogSize] = useState('Medium');
  const [dogPhotos, setDogPhotos] = useState<string[]>([]);
  const [dogPersonality, setDogPersonality] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
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

  const uploadPhoto = async (bucket: string, prefix: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access in Settings');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });
    if (result.canceled) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const uri = result.assets[0].uri;
    const fileName = `${prefix}_${user.id}_${Date.now()}.jpg`;
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const { error } = await supabase.storage.from(bucket).upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  };

  const pickOwnerPhoto = async () => {
    if (photos.length >= 4) { Alert.alert('Max photos', 'You can add up to 4 photos'); return; }
    setUploading(true);
    try {
      const url = await uploadPhoto('avatars', 'owner');
      if (url) setPhotos(prev => [...prev, url]);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const pickDogPhoto = async () => {
    if (dogPhotos.length >= 4) { Alert.alert('Max photos', 'You can add up to 4 dog photos'); return; }
    setUploading(true);
    try {
      const url = await uploadPhoto('avatars', 'dog');
      if (url) setDogPhotos(prev => [...prev, url]);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const togglePersonality = (trait: string) => {
    setDogPersonality(prev => prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]);
  };

  const saveProfile = async () => {
    if (photos.length < 4) { Alert.alert('Add more photos', 'Please add 4 owner photos'); return; }
    if (!gender) { Alert.alert('Missing info', 'Please select your gender'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name, age: parseInt(age), bio, neighborhood,
        gender, seeking,
        dog_name: dogName, dog_breed: dogBreed,
        dog_age: parseInt(dogAge), dog_size: dogSize,
        dog_photos: dogPhotos,
        dog_personality: dogPersonality,
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

  const PhotoGrid = ({ photoList, onAdd, onRemove, maxCount, emptyLabel }: any) => (
    <View style={styles.photoGrid}>
      {[0, 1, 2, 3].map(i => (
        <TouchableOpacity
          key={i}
          style={styles.photoSlot}
          activeOpacity={0.7}
          onPress={() => photoList[i] ? onRemove(i) : onAdd()}>
          {photoList[i] ? (
            <>
              <Image source={{ uri: photoList[i] }} style={styles.photoThumb} />
              <View style={styles.removeBtn}><Text style={styles.removeBtnText}>×</Text></View>
            </>
          ) : (
            <View style={styles.photoEmpty}>
              <Text style={styles.photoEmptyIcon}>+</Text>
              <Text style={styles.photoEmptyText}>{i === 0 ? emptyLabel : `photo ${i + 1}`}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

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
        <Text style={styles.stepText}>step {step} of 4</Text>
        <View style={styles.progressRow}>
          {[1,2,3,4].map(s => (
            <View key={s} style={[styles.progressBar, { flex: 1, backgroundColor: step >= s ? '#8B5E3C' : '#E8D5B7' }]} />
          ))}
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
                <TouchableOpacity key={g} style={[styles.sizeBtn, gender === g && styles.sizeBtnActive]} onPress={() => setGender(g)}>
                  <Text style={[styles.sizeBtnText, { color: gender === g ? '#8B5E3C' : '#8C7B68' }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>i want to meet</Text>
            <View style={styles.sizeRow}>
              {['Men', 'Women', 'Everyone'].map(s => (
                <TouchableOpacity key={s} style={[styles.sizeBtn, seeking === s && styles.sizeBtnActive]} onPress={() => setSeeking(s)}>
                  <Text style={[styles.sizeBtnText, { color: seeking === s ? '#8B5E3C' : '#8C7B68' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>your KC neighborhood</Text>
            <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="e.g. Brookside, Overland Park..." placeholderTextColor="#8C7B68" />

            <Text style={styles.label}>about you</Text>
            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Tell people about yourself..." placeholderTextColor="#8C7B68" multiline />

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
                <TouchableOpacity key={size} style={[styles.sizeBtn, dogSize === size && styles.sizeBtnActive]} onPress={() => setDogSize(size)}>
                  <View style={styles.sizeDogIcon}>
                    <View style={[styles.sizeDogBody, { width: size === 'Small' ? 16 : size === 'Medium' ? 22 : 28, height: size === 'Small' ? 12 : size === 'Medium' ? 16 : 20, borderColor: dogSize === size ? '#8B5E3C' : '#C4B8AC' }]} />
                    <View style={[styles.sizeDogHead, { width: size === 'Small' ? 10 : size === 'Medium' ? 13 : 16, height: size === 'Small' ? 10 : size === 'Medium' ? 13 : 16, borderColor: dogSize === size ? '#8B5E3C' : '#C4B8AC' }]} />
                  </View>
                  <Text style={[styles.sizeBtnText, { color: dogSize === size ? '#8B5E3C' : '#8C7B68' }]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>personality traits</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {PERSONALITY_TRAITS.map(trait => (
                <TouchableOpacity
                  key={trait}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: dogPersonality.includes(trait) ? '#8B5E3C' : '#E8D5B7', backgroundColor: dogPersonality.includes(trait) ? '#F7F2EA' : 'white' }}
                  onPress={() => togglePersonality(trait)}>
                  <Text style={{ fontSize: 13, color: dogPersonality.includes(trait) ? '#8B5E3C' : '#8C7B68', fontWeight: dogPersonality.includes(trait) ? '500' : '400' }}>{trait}</Text>
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
            <Text style={styles.heading}>pup photos</Text>
            <Text style={styles.photoSubtitle}>add up to 4 photos of {dogName || 'your dog'}</Text>
            <PhotoGrid
              photoList={dogPhotos}
              onAdd={pickDogPhoto}
              onRemove={(i: number) => setDogPhotos(prev => prev.filter((_, idx) => idx !== i))}
              maxCount={4}
              emptyLabel="dog photo"
            />
            {uploading && <Text style={styles.uploadingText}>uploading...</Text>}
            <Text style={styles.photoCount}>{dogPhotos.length} of 4 photos added</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>← back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
              <Text style={styles.buttonText}>next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.form}>
            <Text style={styles.heading}>your photos</Text>
            <Text style={styles.photoSubtitle}>add 4 photos of yourself</Text>
            <PhotoGrid
              photoList={photos}
              onAdd={pickOwnerPhoto}
              onRemove={(i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
              maxCount={4}
              emptyLabel="your photo"
            />
            {uploading && <Text style={styles.uploadingText}>uploading...</Text>}
            <Text style={styles.photoCount}>{photos.length} of 4 photos added</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
              <Text style={styles.backBtnText}>← back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, photos.length < 4 && styles.buttonDisabled]}
              onPress={saveProfile}
              disabled={loading || photos.length < 4}>
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
  photoSubtitle: { fontSize: 13, color: '#8C7B68', marginBottom: 16 },
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
  photoSlot: { width: '47%', aspectRatio: 3/4, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoEmpty: { width: '100%', height: '100%', backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E8D5B7', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoEmptyIcon: { fontSize: 24, color: '#C8956C' },
  photoEmptyText: { fontSize: 10, color: '#8C7B68' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: 'white', fontSize: 14, fontWeight: '300' },
  uploadingText: { fontSize: 13, color: '#8B5E3C', textAlign: 'center', marginBottom: 8 },
  photoCount: { fontSize: 12, color: '#8C7B68', textAlign: 'center', marginBottom: 8 },
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