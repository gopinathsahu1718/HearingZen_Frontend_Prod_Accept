import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type ChangePasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen = ({ navigation }: { navigation: ChangePasswordScreenNavigationProp }) => {
  const { theme, isDarkMode } = useTheme();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
      },
      header: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 180,
        height: 180,
        backgroundColor: isDarkMode ? theme.primary : '#007BFF',
        borderBottomRightRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 20,
      },
      headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
      },
      backIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 10,
        marginTop: 100,
      },
      subtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 30,
      },
      passwordContainer: {
        width: '100%',
        marginBottom: 15,
      },
      label: {
        fontSize: 14,
        color: theme.text,
        marginBottom: 8,
        fontWeight: '500',
      },
      inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: isDarkMode ? theme.border : '#007BFF',
        backgroundColor: theme.surface,
        color: theme.text,
        borderRadius: 5,
        paddingHorizontal: 10,
      },
      lockIcon: {
        width: 20,
        height: 20,
        marginLeft: -25,
        resizeMode: 'contain',
      },
      button: {
        backgroundColor: isDarkMode ? theme.primary : '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
      hint: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 10,
        lineHeight: 18,
      },
    })
  );

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Change{'\n'}Password</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/images/back.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Enter your current password and choose a new secure password
        </Text>

        <View style={styles.passwordContainer}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={true}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <Image
              source={require('../assets/images/lock.png')}
              style={styles.lockIcon}
            />
          </View>
        </View>

        <View style={styles.passwordContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={true}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Image
              source={require('../assets/images/lock.png')}
              style={styles.lockIcon}
            />
          </View>
        </View>

        <View style={styles.passwordContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Image
              source={require('../assets/images/lock.png')}
              style={styles.lockIcon}
            />
          </View>
        </View>

        <Text style={styles.hint}>
          Password must be at least 8 characters long, include an uppercase letter, lowercase letter, number, and special character.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;