import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<any>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'info' | 'health'>('info');

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
          source={require('../assets/images/default_dp.png')}
          style={styles.topProfilePic}
        />
        <Text style={styles.profileName}>Saishree Bisoi</Text>
        <Text style={styles.profileSubText}>@saishree</Text>
      </View>

      {/* Edit Profile Button */}
      <View style={styles.editContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}> Edit Profile</Text>
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
            <InfoRow label="Full Name" value="saishree bisoi" />
            <InfoRow label="Email" value="sai87@gmail.com" />
            <InfoRow label="Phone" value="(+91) 1759263000" />
            <InfoRow label="Location" value="odagaon, nayagarh" />
          </>
        ) : (
          <>
            <InfoRow label="Height" value="5'8''" />
            <InfoRow label="Weight" value="47 kg" />
            <InfoRow label="Gender" value="female" />
            <InfoRow label="Blood Group" value="O+" />
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

  // Edit button
  editContainer: { alignItems: 'center', marginTop: 15 },
  editButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Divider

  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 20,
    marginHorizontal: 30,
    marginTop: 40,
  },

  // Vertical Buttons
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

  // Card Content
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  infoLabel: { fontSize: 14, color: '#777' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#000' },
});
