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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: theme.background,
      },
      keyboardView: {
        flex: 1,
      },
      scrollView: {
        flexGrow: 1,
      },
      container: {
        flex: 1,
        backgroundColor: theme.background,
        minHeight: 700,
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
        zIndex: 10,
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
        zIndex: 20,
        padding: 8,
      },
      backIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
      },
      content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 200,
        paddingBottom: 40,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 8,
      },
      subtitle: {
        fontSize: 14,
        color: theme.textSecondary,
        marginBottom: 32,
        lineHeight: 20,
      },
      inputContainer: {
        width: '100%',
        marginBottom: 20,
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
        borderWidth: 1,
        borderColor: isDarkMode ? theme.border : '#007BFF',
        backgroundColor: theme.surface,
        borderRadius: 8,
        height: 52,
        paddingHorizontal: 16,
      },
      input: {
        flex: 1,
        color: theme.text,
        fontSize: 16,
        paddingVertical: 0,
        height: '100%',
      },
      eyeButton: {
        padding: 8,
        marginLeft: 8,
      },
      eyeIcon: {
        width: 22,
        height: 22,
        tintColor: theme.iconTint,
      },
      hint: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 8,
        lineHeight: 18,
      },
      button: {
        backgroundColor: isDarkMode ? theme.primary : '#007BFF',
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 24,
        height: 52,
        justifyContent: 'center',
      },
      buttonDisabled: {
        opacity: 0.6,
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
    })
  );

  const handleChangePassword = async () => {
    Keyboard.dismiss();

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Change{'\n'}Password</Text>
              </View>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
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

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter current password"
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showCurrentPassword}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={
                          showCurrentPassword
                            ? require('../assets/images/eye-open.png')
                            : require('../assets/images/eye-closed.png')
                        }
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={
                          showNewPassword
                            ? require('../assets/images/eye-open.png')
                            : require('../assets/images/eye-closed.png')
                        }
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter new password"
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={
                          showConfirmPassword
                            ? require('../assets/images/eye-open.png')
                            : require('../assets/images/eye-closed.png')
                        }
                        style={styles.eyeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.hint}>
                    Password must be at least 8 characters long, include an uppercase letter, lowercase letter, number, and special character.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;