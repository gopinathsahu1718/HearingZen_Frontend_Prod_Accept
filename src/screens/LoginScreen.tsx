// Updated Frontend: LoginScreen
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
    ActivityIndicator
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

    const styles = useThemedStyles((theme) => StyleSheet.create({
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
        forgotPassword: {
            alignSelf: 'flex-end',
            marginBottom: 10,
        },
        forgotPasswordText: {
            color: isDarkMode ? theme.primary : '#007BFF',
            fontSize: 14,
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
    }));

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password are required');
            return;
        }

        setLoading(true);
        try {
            await login(email.toLowerCase(), password);
            // Reset navigation stack to prevent going back to login
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
            // Reset navigation stack to prevent going back to login
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
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Login</Text>
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
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.orText}>Or</Text>

                <GoogleSigninButton
                    style={styles.googleButton}
                    color={isDarkMode ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                />

                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.link}>Don't have an account? Sign up here</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;