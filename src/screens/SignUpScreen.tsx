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
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useTranslation } from 'react-i18next';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const { t } = useTranslation();
    const { theme, isDarkMode } = useTheme();
    const { register, getVerificationToken, googleSignIn } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // 🔥 New state: Show errors after clicking Sign Up
    const [showErrors, setShowErrors] = useState(false);

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
                minHeight: 800,
            },
            header: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: 150,
                height: 150,
                backgroundColor: isDarkMode ? theme.primary : '#007BFF',
                borderBottomRightRadius: 75,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
            },
            headerText: {
                color: '#fff',
                fontSize: 24,
                fontWeight: 'bold',
            },
            content: {
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: 24,
                paddingTop: 180,
                paddingBottom: 40,
            },
            logo: {
                width: 100,
                height: 100,
                alignSelf: 'center',
                marginBottom: 32,
                resizeMode: 'contain',
            },

            // ✨ Input Label + Error Star
            fieldLabel: {
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 4,
                color: theme.text,
            },
            star: {
                color: 'red',
                fontSize: 16,
                marginLeft: 3,
            },

            inputContainer: {
                width: '100%',
                marginBottom: 16,
            },

            // ✨ Border turns red if empty and showErrors = true
            inputWrapper: {
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
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
            button: {
                backgroundColor: isDarkMode ? theme.primary : '#007BFF',
                paddingVertical: 14,
                borderRadius: 8,
                width: '100%',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 16,
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
            dividerContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                marginVertical: 16,
            },
            dividerLine: {
                flex: 1,
                height: 1,
                backgroundColor: theme.border,
            },
            orText: {
                marginHorizontal: 16,
                color: theme.textSecondary,
                fontSize: 14,
                fontWeight: '500',
            },
            googleButton: {
                width: '100%',
                height: 52,
                marginBottom: 16,
            },
            linkContainer: {
                alignItems: 'center',
                paddingVertical: 12,
            },
            link: {
                color: isDarkMode ? theme.primary : '#007BFF',
                fontSize: 14,
                fontWeight: '500',
            },
            verifyButton: {
                alignItems: 'center',
                paddingVertical: 12,
            },
            verifyText: {
                color: '#FF6B35',
                fontSize: 14,
                fontWeight: '600',
            },

            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
            },
            modalContent: {
                backgroundColor: theme.cardBackground,
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 400,
            },
            modalTitle: {
                fontSize: 22,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 20,
                textAlign: 'center',
            },
            modalInputWrapper: {
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                borderRadius: 8,
                height: 52,
                paddingHorizontal: 16,
                marginBottom: 20,
                justifyContent: 'center',
            },
            modalInput: {
                color: theme.text,
                fontSize: 16,
                height: '100%',
            },
            modalButtons: {
                flexDirection: 'row',
                gap: 12,
            },
            modalButton: {
                flex: 1,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                height: 52,
                justifyContent: 'center',
            },
            cancelButton: {
                backgroundColor: theme.border,
            },
            confirmButton: {
                backgroundColor: theme.primary,
            },
            cancelButtonText: {
                color: theme.text,
                fontWeight: '600',
                fontSize: 16,
            },
            confirmButtonText: {
                color: '#fff',
                fontWeight: '600',
                fontSize: 16,
            },
        })
    );

    const handleSignUp = async () => {
        Keyboard.dismiss();
        setShowErrors(true); // 🔥 Start showing validation

        if (!username || !email || !contact || !password) {
            return;
        }

        setLoading(true);
        try {
            const tempToken = await register(username, contact, email, password);
            navigation.navigate('OTPScreen', { tempToken, email, fromSignup: true });
        } catch (error: any) {
            Alert.alert(t('signup.registrationFailed'), error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!verifyEmail.trim()) {
            Alert.alert(t('common.error'), t('signup.enterEmail'));
            return;
        }

        setVerifyLoading(true);
        try {
            const tempToken = await getVerificationToken(verifyEmail.toLowerCase());
            setShowVerifyModal(false);
            setVerifyEmail('');
            navigation.navigate('OTPScreen', { tempToken, email: verifyEmail.toLowerCase(), fromSignup: false });
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await googleSignIn();
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeTabs' }],
                })
            );
        } catch (error: any) {
            Alert.alert(t('signup.googleSignInFailed'), error.message);
        } finally {
            setGoogleLoading(false);
        }
    };

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
                                <Text style={styles.headerText}>{t('signup.headerText')}</Text>
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

                                {/* FULL NAME */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {t('signup.fullName')}
                                        {showErrors && !username && <Text style={styles.star}> *</Text>}
                                    </Text>

                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            showErrors && !username && { borderColor: 'red' },
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('signup.fullNamePlaceholder')}
                                            placeholderTextColor={theme.textSecondary}
                                            value={username}
                                            onChangeText={setUsername}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                {/* EMAIL */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {t('signup.email')}
                                        {showErrors && !email && <Text style={styles.star}> *</Text>}
                                    </Text>

                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            showErrors && !email && { borderColor: 'red' },
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('signup.emailPlaceholder')}
                                            placeholderTextColor={theme.textSecondary}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                {/* CONTACT */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {t('signup.contact')}
                                        {showErrors && !contact && <Text style={styles.star}> *</Text>}
                                    </Text>

                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            showErrors && !contact && { borderColor: 'red' },
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('signup.contactPlaceholder')}
                                            placeholderTextColor={theme.textSecondary}
                                            value={contact}
                                            onChangeText={setContact}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                {/* PASSWORD */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {t('signup.password')}
                                        {showErrors && !password && <Text style={styles.star}> *</Text>}
                                    </Text>

                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            showErrors && !password && { borderColor: 'red' },
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('signup.passwordPlaceholder')}
                                            placeholderTextColor={theme.textSecondary}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Image
                                                source={
                                                    showPassword
                                                        ? require('../assets/images/eye-open.png')
                                                        : require('../assets/images/eye-closed.png')
                                                }
                                                style={styles.eyeIcon}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* SIGN UP BUTTON */}
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleSignUp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('signup.signUpButton')}</Text>}
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.orText}>{t('signup.or')}</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <GoogleSigninButton
                                    style={styles.googleButton}
                                    size={GoogleSigninButton.Size.Wide}
                                    color={isDarkMode ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light}
                                    onPress={handleGoogleSignIn}
                                    disabled={googleLoading}
                                />

                                <View style={styles.linkContainer}>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.link}>{t('signup.loginLink')}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.verifyButton}>
                                    <TouchableOpacity onPress={() => setShowVerifyModal(true)}>
                                        <Text style={styles.verifyText}>{t('signup.verifyEmail')}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* EMAIL VERIFY MODAL */}
            <Modal
                visible={showVerifyModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowVerifyModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowVerifyModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>{t('signup.verifyEmailTitle')}</Text>

                                <View style={styles.modalInputWrapper}>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder={t('signup.verifyEmailPlaceholder')}
                                        placeholderTextColor={theme.textSecondary}
                                        value={verifyEmail}
                                        onChangeText={setVerifyEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => {
                                            setShowVerifyModal(false);
                                            setVerifyEmail('');
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.confirmButton]}
                                        onPress={handleVerifyEmail}
                                        disabled={verifyLoading}
                                    >
                                        {verifyLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.confirmButtonText}>{t('signup.verify')}</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </SafeAreaView>
    );
};

export default SignUpScreen;