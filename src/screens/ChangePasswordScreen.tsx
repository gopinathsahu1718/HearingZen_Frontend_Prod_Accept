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
import { useTranslation } from 'react-i18next';

type ChangePasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChangePassword'
>;

const ChangePasswordScreen = ({ navigation }: { navigation: ChangePasswordScreenNavigationProp }) => {
  const { t, i18n } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // NEW — show error only after submit
  const [submitted, setSubmitted] = useState(false);

  // Show/Hide password states
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
      requiredStar: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
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
      errorBorder: {
        borderColor: 'red',
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
    setSubmitted(true); // show validation UI only after submit

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('changePassword.error'), t('changePassword.fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('changePassword.error'), t('changePassword.passwordsDoNotMatch'));
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(t('changePassword.error'), t('changePassword.newPasswordDifferent'));
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert(t('changePassword.success'), t('changePassword.passwordChanged'), [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSubmitted(false);
    } catch (error: any) {
      Alert.alert(t('changePassword.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = (value: string) => submitted && value.trim() === '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                <Text style={styles.headerText}>{t('changePassword.header')}</Text>
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
                <Text style={styles.title}>{t('changePassword.title')}</Text>
                <Text style={styles.subtitle}>
                  {t('changePassword.subtitle')}
                </Text>

                {/* CURRENT PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('changePassword.currentPassword')}
                    {isEmpty(currentPassword) && (
                      <Text style={styles.requiredStar}> *</Text>
                    )}
                  </Text>

                  <View
                    style={[
                      styles.inputWrapper,
                      isEmpty(currentPassword) && styles.errorBorder,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder={t('changePassword.currentPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showCurrentPassword}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
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

                {/* NEW PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('changePassword.newPassword')}
                    {isEmpty(newPassword) && (
                      <Text style={styles.requiredStar}> *</Text>
                    )}
                  </Text>

                  <View
                    style={[
                      styles.inputWrapper,
                      isEmpty(newPassword) && styles.errorBorder,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder={t('changePassword.newPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
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

                {/* CONFIRM PASSWORD */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('changePassword.confirmPassword')}
                    {isEmpty(confirmPassword) && (
                      <Text style={styles.requiredStar}> *</Text>
                    )}
                  </Text>

                  <View
                    style={[
                      styles.inputWrapper,
                      isEmpty(confirmPassword) && styles.errorBorder,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder={t('changePassword.confirmPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {t('changePassword.hint')}
                  </Text>
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>{t('changePassword.button')}</Text>
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