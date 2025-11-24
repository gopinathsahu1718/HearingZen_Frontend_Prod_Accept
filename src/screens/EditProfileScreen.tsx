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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { getUserProfile, updateProfile } = useAuth();

  // Contact details
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  // Health card
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [genderOther, setGenderOther] = useState('');
  const [age, setAge] = useState('');
  const [deafnessLevel, setDeafnessLevel] = useState('');
  const [disabilityPercentage, setDisabilityPercentage] = useState('');

  const [selectedTab, setSelectedTab] = useState<'info' | 'health'>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load profile data when screen opens
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();

      // Set contact details
      setUsername(data.username || '');
      setContact(data.contact || '');
      setEmail(data.email || '');
      setCurrentLocation(data.currentLocation || '');

      // Set health data
      setHeight(data.height?.toString() || '');
      setWeight(data.weight?.toString() || '');
      setGender(data.gender || '');
      // If stored gender is a custom value (not Male/Female/Other), treat it as 'Other' and populate genderOther
      if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
        setGender('other');
        setGenderOther(data.gender);
      }
      setAge(data.age?.toString() || '');
      setDeafnessLevel(data.deafnessLevel || '');
      setDisabilityPercentage(data.disabilityPercentage?.toString() || '');
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Save data to backend
  const handleSave = async () => {
    try {
      setSaving(true);

      const profileData: any = {
        username,
        contact,
        currentLocation,
      };

      // Only include health fields if they have values
      if (height) profileData.height = parseFloat(height);
      if (weight) profileData.weight = parseFloat(weight);
      if (gender) {
        if (gender === 'Other') {
          profileData.gender = genderOther || 'Other';
        } else {
          profileData.gender = gender;
        }
      }
      if (age) profileData.age = parseInt(age);
      if (deafnessLevel) profileData.deafnessLevel = deafnessLevel;
      if (disabilityPercentage)
        profileData.disabilityPercentage = parseFloat(disabilityPercentage);

      await updateProfile(profileData);

      Alert.alert('✅ Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={require('../assets/icons/arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.topProfilePicContainer}>
        <View style={{ position: 'relative' }}>
          <Image
            source={require('../assets/images/default_dp.png')}
            style={styles.topProfilePic}
          />
        </View>
        <Text style={styles.profileName}>{username || 'Your Name'}</Text>
        <Text style={styles.profileSubText}>
          @{username?.toLowerCase().replace(/\s+/g, '') || 'username'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.verticalButtonContainer}>
        <TouchableOpacity
          style={[
            styles.verticalButton,
            selectedTab === 'info' && styles.activeButton,
          ]}
          onPress={() => setSelectedTab('info')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedTab === 'info' && styles.activeButtonText,
            ]}
          >
            contact details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalButton,
            selectedTab === 'health' && styles.activeButton,
          ]}
          onPress={() => setSelectedTab('health')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedTab === 'health' && styles.activeButtonText,
            ]}
          >
            Health card
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.card}>
        {selectedTab === 'info' ? (
          <>
            <InputField
              label="Full Name"
              value={username}
              onChangeText={setUsername}
            />
            <InputField
              label="Phone"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              editable={false}
            />
            <InputField
              label="Location"
              value={currentLocation}
              onChangeText={setCurrentLocation}
            />
          </>
        ) : (
          <>
            <InputField
              label="Height (in cm or feet)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="e.g., 170 or 5.7"
            />
            <InputField
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="e.g., 70"
            />
            <View style={styles.radioGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioOptions}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setGender('male');
                    setGenderOther('');
                  }}
                >
                  <View style={styles.radioOuter}>
                    {gender === 'male' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setGender('female');
                    setGenderOther('');
                  }}
                >
                  <View style={styles.radioOuter}>
                    {gender === 'female' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Female</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setGender('other')}
                >
                  <View style={styles.radioOuter}>
                    {gender === 'other' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Other</Text>
                </TouchableOpacity>
              </View>

              {gender === 'Other' && (
                <InputField
                  label="Please specify"
                  value={genderOther}
                  onChangeText={setGenderOther}
                  placeholder="e.g., Non-binary"
                />
              )}
            </View>
            <InputField
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="e.g., 25"
            />
            <InputField
              label="Deafness Level"
              value={deafnessLevel}
              onChangeText={setDeafnessLevel}
              placeholder="e.g., none, mild, moderate, severe"
            />
            <InputField
              label="Disability Percentage"
              value={disabilityPercentage}
              onChangeText={setDisabilityPercentage}
              keyboardType="numeric"
              placeholder="e.g., 0-100"
            />
          </>
        )}
      </View>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  placeholder?: string;
};

const InputField: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType = 'default',
  placeholder,
}) => (
  <View style={styles.inputField}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor="#aaa"
      editable={editable}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { padding: 5, marginRight: 10 },
  backIcon: { width: 20, height: 20, tintColor: '#2196F3' },
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
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 6,
  },
  cameraIcon: { width: 18, height: 18, tintColor: '#fff' },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    color: '#000',
  },
  profileSubText: { fontSize: 14, color: '#666', marginBottom: 20 },

  verticalButtonContainer: { marginTop: 10, alignItems: 'center' },
  verticalButton: {
    width: '80%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 1,
  },
  buttonText: { fontSize: 14, fontWeight: '500', color: '#000' },
  activeButton: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
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
  inputDisabled: {
    backgroundColor: '#e9e9e9',
    color: '#666',
  },

  saveContainer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  radioGroup: { marginBottom: 12 },
  radioOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  radioOption: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#2196F3',
  },
  radioLabel: { fontSize: 14, color: '#000', marginRight: 12 },
});