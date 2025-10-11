import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = StackNavigationProp<any>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getUserProfile } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'info' | 'health'>('info');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../assets/icons/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.topProfilePicContainer}>
        <Image
          source={
            profileData.profilePhotoUrl
              ? { uri: profileData.profilePhotoUrl }
              : require('../assets/images/default_dp.png')
          }
          style={styles.topProfilePic}
        />
        <Text style={styles.profileName}>{profileData.username || 'No Name'}</Text>
        <Text style={styles.profileSubText}>@{profileData.username?.toLowerCase().replace(/\s+/g, '') || 'username'}</Text>
      </View>

      {/* Edit Profile Button */}
      <View style={styles.editContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Vertical Buttons */}
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

      {/* Tab Content */}
      <View style={styles.card}>
        {selectedTab === 'info' ? (
          <>
            <InfoRow label="Full Name" value={profileData.username || 'Not set'} />
            <InfoRow label="Email" value={profileData.email || 'Not set'} />
            <InfoRow label="Phone" value={profileData.contact || 'Not set'} />
            <InfoRow label="Location" value={profileData.currentLocation || 'Not set'} />
          </>
        ) : (
          <>
            <InfoRow label="Height" value={profileData.height ? `${profileData.height}` : 'Not set'} />
            <InfoRow label="Weight" value={profileData.weight ? `${profileData.weight} kg` : 'Not set'} />
            <InfoRow label="Gender" value={profileData.gender || 'Not set'} />
            <InfoRow label="Age" value={profileData.age ? `${profileData.age} years` : 'Not set'} />
            <InfoRow label="Deafness Level" value={profileData.deafnessLevel || 'none'} />
            <InfoRow label="Disability %" value={`${profileData.disabilityPercentage || 0}%`} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

type InfoRowProps = { label: string; value: string };
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { padding: 5, marginRight: 10 },
  backIcon: { width: 20, height: 20, tintColor: '#000' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },

  topProfilePicContainer: { alignItems: 'center', marginTop: 10 },
  topProfilePic: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  profileName: { fontSize: 20, fontWeight: '700', marginTop: 10, color: '#000' },
  profileSubText: { fontSize: 14, color: '#666', marginTop: 4 },

  editContainer: { alignItems: 'center', marginTop: 15 },
  editButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 20,
    marginHorizontal: 30,
    marginTop: 40,
  },

  verticalButtonContainer: { alignItems: 'center' },
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
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  infoLabel: { fontSize: 14, color: '#777' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#000' },

  errorText: { fontSize: 16, color: '#666', marginBottom: 20 },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});