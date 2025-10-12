// Updated Frontend: SignUpScreen.tsx
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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
    GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const { theme, isDarkMode } = useTheme();
    const { register, getVerificationToken, googleSignIn } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const styles = useThemedStyles((theme) =>
        StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: theme.background,
            },
            content: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
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
            },
            headerText: {
                color: '#fff',
                fontSize: 24,
                fontWeight: 'bold',
            },
            logo: {
                width: 100,
                height: 100,
                marginBottom: 20,
                resizeMode: 'contain',
            },
            input: {
                width: '100%',
                height: 50,
                borderWidth: 1,
                borderColor: isDarkMode ? theme.border : '#007BFF',
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: 5,
                marginBottom: 10,
                paddingHorizontal: 10,
            },
            passwordContainer: {
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
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
                marginVertical: 10,
            },
            buttonText: {
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
            },
            link: {
                color: isDarkMode ? theme.primary : '#007BFF',
                marginTop: 10,
                fontSize: 14,
            },
            verifyButton: {
                marginTop: 5,
            },
            verifyText: {
                color: '#FF6B35',
                fontSize: 14,
                fontWeight: '600',
            },
            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContent: {
                backgroundColor: theme.cardBackground,
                borderRadius: 12,
                padding: 20,
                width: '85%',
                maxWidth: 400,
            },
            modalTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 15,
                textAlign: 'center',
            },
            modalInput: {
                width: '100%',
                height: 50,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: 8,
                paddingHorizontal: 15,
                marginBottom: 15,
            },
            modalButtons: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 10,
            },
            modalButton: {
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
            },
            cancelButton: {
                backgroundColor: theme.border,
            },
            confirmButton: {
                backgroundColor: theme.primary,
            },
            googleButton: {
                width: '100%',
                height: 48,
                marginVertical: 10,
            },
            orText: {
                marginVertical: 10,
                color: theme.textSecondary,
                fontSize: 14,
            },
        })
    );

    const handleSignUp = async () => {
        if (!username || !email || !contact || !password) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        setLoading(true);
        try {
            const tempToken = await register(username, contact, email, password);
            navigation.navigate('OTPScreen', { tempToken, email, fromSignup: true });
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        try {
            await googleSignIn();
            // Reset navigation stack to prevent going back to signup
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeTabs' }],
                })
            );
        } catch (error: any) {
            console.log(error);
            Alert.alert('Google Sign Up Failed', error.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!verifyEmail.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setVerifyLoading(true);
        try {
            const tempToken = await getVerificationToken(verifyEmail.toLowerCase());
            setShowVerifyModal(false);
            setVerifyEmail('');
            navigation.navigate('OTPScreen', { tempToken, email: verifyEmail.toLowerCase(), fromSignup: false });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setVerifyLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Sign Up</Text>
                </View>

                <Image
                    source={
                        isDarkMode
                            ? require('../assets/images/splash-dark.jpg')
                            : require('../assets/images/splash.png')
                    }
                    style={styles.logo}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textSecondary}
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contact Number"
                    placeholderTextColor={theme.textSecondary}
                    value={contact}
                    onChangeText={setContact}
                    keyboardType="phone-pad"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Image
                        source={require('../assets/images/lock.png')}
                        style={styles.lockIcon}
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignUp}
                    disabled={loading || googleLoading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.orText}>Or</Text>

                <GoogleSigninButton
                    style={styles.googleButton}
                    color={isDarkMode ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light}
                    onPress={handleGoogleSignUp}
                    disabled={loading || googleLoading}
                />

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already Registered? Log in here.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => setShowVerifyModal(true)}
                >
                    <Text style={styles.verifyText}>Already registered? Verify Email</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showVerifyModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowVerifyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verify Email</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your email"
                            placeholderTextColor={theme.textSecondary}
                            value={verifyEmail}
                            onChangeText={setVerifyEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowVerifyModal(false);
                                    setVerifyEmail('');
                                }}
                            >
                                <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleVerifyEmail}
                                disabled={verifyLoading}
                            >
                                {verifyLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>Verify</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SignUpScreen;