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
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
    GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
    const { theme, isDarkMode } = useTheme();
    const { login, googleSignIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // NEW STATE TO CONTROL VALIDATION DISPLAY
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
                    minHeight: 700,
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
                    marginBottom: 40,
                    resizeMode: 'contain',
                },
                inputContainer: {
                    width: '100%',
                    marginBottom: 16,
                },

                // RED BORDER WHEN EMPTY AFTER SUBMIT
                inputWrapper: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor:
                        submitted && (!email || !password)
                            ? 'red'
                            : isDarkMode
                                ? theme.border
                                : '#007BFF',
                    backgroundColor: theme.surface,
                    borderRadius: 8,
                    height: 52,
                    paddingHorizontal: 16,
                },

                inputLabelRow: {
                    flexDirection: 'row',
                    marginBottom: 4,
                },
                inputLabel: {
                    fontSize: 14,
                    color: theme.text,
                    fontWeight: '500',
                },

                // RED STAR (hidden initially)
                requiredStar: {
                    color: 'red',
                    marginLeft: 4,
                    opacity: submitted ? 1 : 0,
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
                forgotPasswordContainer: {
                    alignItems: 'flex-end',
                    marginBottom: 24,
                    marginTop: 8,
                },
                forgotPasswordText: {
                    color: isDarkMode ? theme.primary : '#007BFF',
                    fontSize: 14,
                    fontWeight: '500',
                },
                button: {
                    backgroundColor: isDarkMode ? theme.primary : '#007BFF',
                    paddingVertical: 14,
                    borderRadius: 8,
                    width: '100%',
                    alignItems: 'center',
                    marginBottom: 20,
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
                    marginVertical: 20,
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
                    marginBottom: 20,
                },
                signUpContainer: {
                    alignItems: 'center',
                    paddingVertical: 16,
                },
                link: {
                    color: isDarkMode ? theme.primary : '#007BFF',
                    fontSize: 14,
                    fontWeight: '500',
                },
            }),
        [submitted, email, password]
    );

    const handleLogin = async () => {
        Keyboard.dismiss();
        setSubmitted(true); // 👈 SHOW VALIDATION NOW

        if (!email || !password) {
            return; // Validation only, no alert needed
        }

        setLoading(true);
        try {
            await login(email.toLowerCase(), password);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeTabs' }],
                })
            );
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await googleSignIn();
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeTabs' }],
                })
            );
        } catch (error: any) {
            Alert.alert('Google Sign In Failed', error.message);
        } finally {
            setLoading(false);
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
                                <Text style={styles.headerText}>Login</Text>
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

                                {/* EMAIL */}
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputLabelRow}>
                                        <Text style={styles.inputLabel}>Email</Text>
                                        <Text style={styles.requiredStar}>*</Text>
                                    </View>

                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor={theme.textSecondary}
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                {/* PASSWORD */}
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputLabelRow}>
                                        <Text style={styles.inputLabel}>Password</Text>
                                        <Text style={styles.requiredStar}>*</Text>
                                    </View>

                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your password"
                                            placeholderTextColor={theme.textSecondary}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                            activeOpacity={0.7}
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

                                <View style={styles.forgotPasswordContainer}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ForgotPassword')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* LOGIN BUTTON */}
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>Login</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.orText}>Or</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <GoogleSigninButton
                                    style={styles.googleButton}
                                    size={GoogleSigninButton.Size.Wide}
                                    color={isDarkMode ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light}
                                    onPress={handleGoogleSignIn}
                                    disabled={loading}
                                />

                                <View style={styles.signUpContainer}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('SignUp')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.link}>Don't have an account? Sign up here</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;