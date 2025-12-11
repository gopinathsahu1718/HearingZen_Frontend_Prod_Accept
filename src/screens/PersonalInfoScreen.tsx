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
import { useTranslation } from 'react-i18next';

type NavigationProp = StackNavigationProp<any>;

export default function ProfileScreen() {
  const { t } = useTranslation();
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
    }, []),
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
        <Text style={styles.errorText}>{t('profile.loadError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>{t('profile.retry')}</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{t('profile.myProfile')}</Text>
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
        <Text style={styles.profileName}>
          {profileData.username || t('profile.noName')}
        </Text>
        <Text style={styles.profileSubText}>
          @{profileData.username?.toLowerCase().replace(/\s+/g, '') ||
            t('profile.username')}
        </Text>
      </View>

      {/* Edit Profile Button */}
      <View style={styles.editContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Vertical Buttons */}
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
            {t('profile.contactDetails')}
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
            {t('profile.healthCard')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.card}>
        {selectedTab === 'info' ? (
          <>
            <InfoRow
              label={t('profile.fullName')}
              value={profileData.username || t('profile.notSet')}
            />
            <InfoRow label={t('profile.email')} value={profileData.email || t('profile.notSet')} />
            <InfoRow label={t('profile.phone')} value={profileData.contact || t('profile.notSet')} />
            <InfoRow
              label={t('profile.location')}
              value={profileData.currentLocation || t('profile.notSet')}
            />
          </>
        ) : (
          <>
            <InfoRow
              label={t('profile.height')}
              value={profileData.height ? `${profileData.height}` : t('profile.notSet')}
            />
            <InfoRow
              label={t('profile.weight')}
              value={
                profileData.weight ? `${profileData.weight} ${t('profile.kg')}` : t('profile.notSet')
              }
            />
            <InfoRow label={t('profile.gender')} value={profileData.gender || t('profile.notSet')} />
            <InfoRow
              label={t('profile.age')}
              value={profileData.age ? `${profileData.age} ${t('profile.years')}` : t('profile.notSet')}
            />
            <InfoRow
              label={t('profile.deafnessLevel')}
              value={profileData.deafnessLevel || t('profile.none')}
            />
            <InfoRow
              label={t('profile.disabilityPercentage')}
              value={`${profileData.disabilityPercentage || 0}%`}
            />
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
  backIcon: { width: 20, height: 20, tintColor: '#2196F3' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000' },

  topProfilePicContainer: { alignItems: 'center', marginTop: 10 },
  topProfilePic: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    color: '#000',
  },
  profileSubText: { fontSize: 14, color: '#666', marginTop: 4 },

  editContainer: { alignItems: 'center', marginTop: 15 },
  editButton: {
    backgroundColor: '#2196F3',
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
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});