import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type NewPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NewPassword'>;
type NewPasswordScreenRouteProp = RouteProp<RootStackParamList, 'NewPassword'>;

interface Props {
    navigation: NewPasswordScreenNavigationProp;
    route: NewPasswordScreenRouteProp;
}

const NewPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme();
    const { resetPassword } = useAuth();
    const { resetToken } = route.params;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ⭐ NEW: Track if user tried submitting
    const [submitted, setSubmitted] = useState(false);

    const styles = useThemedStyles(
        (theme) =>
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
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
                content: {
                    paddingHorizontal: 24,
                    paddingTop: 200,
                    paddingBottom: 40,
                },
                logo: {
                    width: 100,
                    height: 100,
                    alignSelf: 'center',
                    marginBottom: 32,
                    resizeMode: 'contain',
                },
                title: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: theme.text,
                    marginBottom: 12,
                    textAlign: 'center',
                },
                subtitle: {
                    fontSize: 14,
                    color: theme.textSecondary,
                    textAlign: 'center',
                    marginBottom: 40,
                    lineHeight: 22,
                },

                // ⭐ Label row for star
                labelRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                },
                label: {
                    fontSize: 14,
                    color: theme.text,
                    fontWeight: '500',
                },
                star: {
                    color: 'red',
                    fontSize: 16,
                    marginLeft: 4,
                    opacity: submitted ? 1 : 0, // ⭐ show only after clicking button
                },

                inputContainer: {
                    width: '100%',
                    marginBottom: 20,
                },

                // ⭐ Red border based on validation
                inputWrapper: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor:
                        submitted &&
                            (!newPassword || !confirmPassword) &&
                            (newPassword.length === 0 || confirmPassword.length === 0)
                            ? 'red'
                            : isDarkMode
                                ? theme.border
                                : '#007BFF',
                    backgroundColor: theme.surface,
                    borderRadius: 8,
                    height: 52,
                    paddingHorizontal: 16,
                },
                input: {
                    flex: 1,
                    color: theme.text,
                    fontSize: 16,
                    height: 52,
                },
                eyeButton: {
                    padding: 8,
                    marginLeft: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
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
                    textAlign: 'center',
                    lineHeight: 18,
                    paddingHorizontal: 10,
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
            }),
        [submitted, newPassword, confirmPassword]
    );

    const handleResetPassword = async () => {
        Keyboard.dismiss();

        setSubmitted(true); // ⭐ show red star + borders

        if (!newPassword || !confirmPassword) {
            return; // Stop here, show red borders & stars
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(resetToken, newPassword, confirmPassword);
            Alert.alert('Success', 'Password reset successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            })
                        );
                    },
                },
            ]);
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollView}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>New{'\n'}Password</Text>
                            </View>

                            <View style={styles.content}>
                                <Image
                                    source={
                                        isDarkMode
                                            ? require('../assets/images/splash-dark.jpg')
                                            : require('../assets/images/splash.png')
                                    }
                                    style={styles.logo}
                                />

                                <Text style={styles.title}>Create New Password</Text>
                                <Text style={styles.subtitle}>
                                    Your new password must be different from previously used passwords
                                </Text>

                                {/* ⭐ New Password */}
                                <View style={styles.inputContainer}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>New Password</Text>
                                        <Text style={styles.star}>*</Text>
                                    </View>

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
                                            onPress={() =>
                                                setShowNewPassword(!showNewPassword)
                                            }
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

                                {/* ⭐ Confirm Password */}
                                <View style={styles.inputContainer}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>Confirm Password</Text>
                                        <Text style={styles.star}>*</Text>
                                    </View>

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
                                            onPress={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
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
                                </View>

                                <Text style={styles.hint}>
                                    Password must be at least 8 characters long, include an uppercase
                                    letter, lowercase letter, number, and special character
                                </Text>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default NewPasswordScreen;