import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      setError(t('Please fill in both fields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('Passwords do not match'));
      return;
    }

    setError('');
    Alert.alert(t('Password changed successfully!'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || '#fff' }]}>
      <Text style={[styles.title, { color: theme?.text || '#000' }]}>{t('Change Password')}</Text>

      {/* New Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t('New Password')}
          placeholderTextColor={theme?.textSecondary || '#888'}
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          style={[styles.input, { borderColor: theme?.border || '#ccc', color: theme?.text || '#000' }]}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowNewPassword(!showNewPassword)}
        >
          <Image
            source={
              showNewPassword
                ? require('../assets/images/password1.png') // open eye
                : require('../assets/images/password.png') // closed eye
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t('Confirm Password')}
          placeholderTextColor={theme?.textSecondary || '#888'}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { borderColor: theme?.border || '#ccc', color: theme?.text || '#000' }]}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Image
            source={
              showConfirmPassword
                ? require('../assets/images/password1.png') // open eye
                : require('../assets/images/password.png') // closed eye
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={[styles.error, { color: theme?.deleteText || 'red' }]}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme?.primary || '#007AFF' }]}
        onPress={handleChangePassword}
      >
        <Text style={styles.buttonText}>{t('Submit')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  error: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
