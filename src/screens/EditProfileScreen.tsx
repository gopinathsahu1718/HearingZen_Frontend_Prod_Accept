import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const navigation = useNavigation();

  //  contact details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [username, setUsername] = useState('');

  // Health card
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  const [selectedTab, setSelectedTab] = useState<'info' | 'health'>('info');

  // 🔹 Load data when screen opens
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const data = JSON.parse(storedProfile);
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setLocation(data.location || '');
          setUsername(data.username || '');
          setHeight(data.height || '');
          setWeight(data.weight || '');
          setGender(data.gender || '');
          setBloodGroup(data.bloodGroup || '');
        }
      } catch (error) {
        console.log('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // 🔹 Save data permanently
  const handleSave = async () => {
    const profileData = {
      fullName,
      phone,
      email,
      location,
      username,
      height,
      weight,
      gender,
      bloodGroup,
    };

    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      Alert.alert('✅ Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../assets/icons/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.topProfilePicContainer}>
        <View style={{ position: 'relative' }}>
          <Image source={require('../assets/images/default_dp.png')} style={styles.topProfilePic} />
          <TouchableOpacity style={styles.cameraWrapper}>
            <Image source={require('../assets/icons/camera.png')} style={styles.cameraIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{fullName || 'Your Name'}</Text>
        <Text style={styles.profileSubText}>{username || '@username'}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.verticalButtonContainer}>
        <TouchableOpacity
          style={[styles.verticalButton, selectedTab === 'info' && styles.activeButton]}
          onPress={() => setSelectedTab('info')}
        >
          <Text style={[styles.buttonText, selectedTab === 'info' && styles.activeButtonText]}>
            contact details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.verticalButton, selectedTab === 'health' && styles.activeButton]}
          onPress={() => setSelectedTab('health')}
        >
          <Text style={[styles.buttonText, selectedTab === 'health' && styles.activeButtonText]}>
            Health card
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.card}>
        {selectedTab === 'info' ? (
          <>
            <InputField label="Full Name" value={fullName} onChangeText={setFullName} />
            <InputField label="Phone" value={phone} onChangeText={setPhone} />
            <InputField label="Email" value={email} onChangeText={setEmail} />
            <InputField label="Location" value={location} onChangeText={setLocation} />
            <InputField label="Username" value={username} onChangeText={setUsername} />
          </>
        ) : (
          <>
            <InputField label="Height" value={height} onChangeText={setHeight} />
            <InputField label="Weight" value={weight} onChangeText={setWeight} />
            <InputField label="Gender" value={gender} onChangeText={setGender} />
            <InputField label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} />
          </>
        )}
      </View>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

type InputProps = { label: string; value: string; onChangeText: (text: string) => void };

const InputField: React.FC<InputProps> = ({ label, value, onChangeText }) => (
  <View style={styles.inputField}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor="#aaa"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { padding: 5, marginRight: 10 },
  backIcon: { width: 20, height: 20, tintColor: '#000' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },

  topProfilePicContainer: { alignItems: 'center', marginTop: 10 },
  topProfilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  cameraWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 6,
  },
  cameraIcon: { width: 18, height: 18, tintColor: '#fff' },
  profileName: { fontSize: 20, fontWeight: '700', marginTop: 10, color: '#000' },
  profileSubText: { fontSize: 14, color: '#666', marginBottom: 20 },

  verticalButtonContainer: { marginTop: 10, alignItems: 'center' },
  verticalButton: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 1,
  },
  buttonText: { fontSize: 14, fontWeight: '500', color: '#333' },
  activeButton: { backgroundColor: '#000', borderColor: '#000' },
  activeButtonText: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputField: { marginBottom: 16 },
  label: { fontSize: 14, color: '#777', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },

  saveContainer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
