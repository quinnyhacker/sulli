import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function EditProfile() {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const dogEmojis = ['🐕', '🐩', '🐶', '🦮', '🐾'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setName(data.name || '');
      setAge(data.age?.toString() || '');
      setBio(data.bio || '');
      setNeighborhood(data.neighborhood || '');
      setDogName(data.dog_name || '');
      setDogBreed(data.dog_breed || '');
      setDogAge(data.dog_age?.toString() || '');
      setDogEmoji(data.dog_emoji || '🐕');
      setPhotos(data.photos || []);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Max photos', 'You can only have 6 photos. Remove one first.');
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
      if (uploadError) { Alert.alert('Upload error', uploadError.message); return; }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setPhotos(prev => [...prev, publicUrl]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert('Remove photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPhotos(prev => prev.filter((_, i) => i !== index)) }
    ]);
  };

  const saveProfile = async () => {
    if (photos.length < 6) {
      Alert.alert('Need 6 photos', 'Please make sure you have 6 photos');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
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
      photos,
    });
    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>edit profile</Text>
        <TouchableOpacity onPress={saveProfile} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'saving...' : 'save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll}>

        <Text style={styles.sectionLabel}>ABOUT YOU</Text>
        <View style={styles.card}>
          <Text style={styles.label}>first name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#8C7B68" />
          <Text style={styles.label}>age</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="Age" placeholderTextColor="#8C7B68" keyboardType="numeric" />
          <Text style={styles.label}>KC neighborhood</Text>
          <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="e.g. Brookside, Overland Park..." placeholderTextColor="#8C7B68" />
          <Text style={styles.label}>bio</Text>
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Tell people about yourself and your dog..." placeholderTextColor="#8C7B68" multiline />
        </View>

        <Text style={styles.sectionLabel}>YOUR PUP</Text>
        <View style={styles.card}>
          <Text style={styles.label}>dog's name</Text>
          <TextInput style={styles.input} value={dogName} onChangeText={setDogName} placeholder="Dog's name" placeholderTextColor="#8C7B68" />
          <Text style={styles.label}>breed</Text>
          <TextInput style={styles.input} value={dogBreed} onChangeText={setDogBreed} placeholder="e.g. Golden Retriever mix" placeholderTextColor="#8C7B68" />
          <Text style={styles.label}>age</Text>
          <TextInput style={styles.input} value={dogAge} onChangeText={setDogAge} placeholder="Dog's age" placeholderTextColor="#8C7B68" keyboardType="numeric" />
          <Text style={styles.label}>emoji</Text>
          <View style={styles.emojiRow}>
            {dogEmojis.map(e => (
              <TouchableOpacity key={e} style={[styles.emojiBtn, dogEmoji === e && styles.emojiBtnActive]} onPress={() => setDogEmoji(e)}>
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>PHOTOS ({photos.length}/6)</Text>
        <View style={styles.card}>
          <View style={styles.photoGrid}>
            {photos.map((photo, i) => (
              <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => removePhoto(i)}>
                <Image source={{ uri: photo }} style={styles.photoThumb} />
                <View style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </View>
              </TouchableOpacity>
            ))}
            {photos.length < 6 && (
              <TouchableOpacity style={styles.photoSlot} onPress={pickImage}>
                <View style={styles.photoEmpty}>
                  <Text style={styles.photoEmptyIcon}>+</Text>
                  <Text style={styles.photoEmptyText}>add photo</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {uploading && <Text style={styles.uploadingText}>uploading...</Text>}
          <Text style={styles.photoHint}>tap a photo to remove it</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F2EA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { fontSize: 14, color: '#8C7B68' },
  title: { fontSize: 18, color: '#2C2016', fontWeight: '500' },
  saveBtn: { fontSize: 14, color: '#8B5E3C', fontWeight: '500' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: { fontSize: 10, color: '#8C7B68', letterSpacing: 1, fontWeight: '500', marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E8D5B7' },
  label: { fontSize: 11, color: '#8C7B68', marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#F7F2EA', borderRadius: 12, padding: 12, fontSize: 14, color: '#2C2016', borderWidth: 1, borderColor: '#E8D5B7' },
  emojiRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  emojiBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8D5B7', alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { borderColor: '#8B5E3C', borderWidth: 2 },
  emoji: { fontSize: 24 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: { width: '30%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoEmpty: { width: '100%', height: '100%', backgroundColor: '#F7F2EA', borderWidth: 1.5, borderColor: '#E8D5B7', borderStyle: 'dashed', borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoEmptyIcon: { fontSize: 22, color: '#C8956C' },
  photoEmptyText: { fontSize: 10, color: '#8C7B68' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: 'white', fontSize: 10, fontWeight: '700' },
  uploadingText: { fontSize: 12, color: '#8B5E3C', textAlign: 'center', marginTop: 8 },
  photoHint: { fontSize: 11, color: '#8C7B68', textAlign: 'center', marginTop: 8 },
});