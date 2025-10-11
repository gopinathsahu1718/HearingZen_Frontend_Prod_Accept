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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: { navigation: ForgotPasswordScreenNavigationProp }) => {
    const { theme, isDarkMode } = useTheme();
    const { forgotPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

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
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
            },
            logo: {
                width: 100,
                height: 100,
                marginBottom: 20,
                resizeMode: 'contain',
            },
            title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 10,
            },
            subtitle: {
                fontSize: 14,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 30,
                paddingHorizontal: 20,
            },
            input: {
                width: '100%',
                height: 50,
                borderWidth: 1,
                borderColor: isDarkMode ? theme.border : '#007BFF',
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: 5,
                marginBottom: 20,
                paddingHorizontal: 10,
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
            backButton: {
                marginTop: 20,
            },
            backButtonText: {
                color: isDarkMode ? theme.primary : '#007BFF',
                fontSize: 14,
            },
        })
    );

    const handleSendOTP = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            const resetInitToken = await forgotPassword(email.toLowerCase());
            navigation.navigate('ResetPasswordOTP', { resetInitToken, email: email.toLowerCase() });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Forgot{'\n'}Password</Text>
                </View>

                <Image
                    source={
                        isDarkMode
                            ? require('../assets/images/splash-dark.jpg')
                            : require('../assets/images/splash.png')
                    }
                    style={styles.logo}
                />

                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you an OTP to reset your password
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSendOTP}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;