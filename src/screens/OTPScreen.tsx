import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
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

type OTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPScreen'>;
type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTPScreen'>;

interface Props {
    navigation: OTPScreenNavigationProp;
    route: OTPScreenRouteProp;
}

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme();
    const { verifyEmail, resendOTP } = useAuth();
    const { tempToken: initialTempToken, email, fromSignup } = route.params;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [tempToken, setTempToken] = useState(initialTempToken);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

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
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingTop: 180,
                paddingBottom: 40,
            },
            title: {
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 12,
            },
            subtitle: {
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 40,
                lineHeight: 24,
                paddingHorizontal: 20,
            },
            email: {
                color: theme.primary,
                fontWeight: '600',
            },
            otpContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: 40,
                paddingHorizontal: 10,
            },
            otpInput: {
                width: 50,
                height: 56,
                borderWidth: 2,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
            },
            otpInputFocused: {
                borderColor: theme.primary,
                borderWidth: 2,
            },
            button: {
                backgroundColor: isDarkMode ? theme.primary : '#007BFF',
                paddingVertical: 14,
                borderRadius: 8,
                width: '100%',
                alignItems: 'center',
                marginBottom: 24,
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
            resendContainer: {
                alignItems: 'center',
            },
            resendText: {
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: 12,
            },
            resendButton: {
                paddingVertical: 12,
                paddingHorizontal: 24,
            },
            resendButtonText: {
                fontSize: 16,
                fontWeight: '600',
            },
            resendButtonEnabled: {
                color: theme.primary,
            },
            resendButtonDisabled: {
                color: theme.textSecondary,
            },
        })
    );

    const handleOtpChange = (text: string, index: number) => {
        if (text.length > 1) {
            text = text[text.length - 1];
        }

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        Keyboard.dismiss();

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter complete OTP');
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(tempToken, otpCode);
            Alert.alert('Success', 'Email verified successfully!', [
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
            Alert.alert('Verification Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || resendLoading) return;

        setResendLoading(true);
        try {
            const newTempToken = await resendOTP(tempToken);
            setTempToken(newTempToken);
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
            setCanResend(false);
            Alert.alert('Success', 'OTP resent successfully!');
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setResendLoading(false);
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
                                <Text style={styles.headerText}>Verify</Text>
                            </View>

                            <View style={styles.content}>
                                <Text style={styles.title}>Enter OTP</Text>
                                <Text style={styles.subtitle}>
                                    We've sent a verification code to{'\n'}
                                    <Text style={styles.email}>{email}</Text>
                                </Text>

                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => (inputRefs.current[index] = ref)}
                                            style={[
                                                styles.otpInput,
                                                digit ? styles.otpInputFocused : null,
                                            ]}
                                            value={digit}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                        />
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleVerify}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>Verify Email</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.resendContainer}>
                                    <Text style={styles.resendText}>Didn't receive the code?</Text>
                                    <TouchableOpacity
                                        style={styles.resendButton}
                                        onPress={handleResend}
                                        disabled={!canResend || resendLoading}
                                        activeOpacity={0.7}
                                    >
                                        {resendLoading ? (
                                            <ActivityIndicator color={theme.primary} size="small" />
                                        ) : (
                                            <Text
                                                style={[
                                                    styles.resendButtonText,
                                                    canResend ? styles.resendButtonEnabled : styles.resendButtonDisabled,
                                                ]}
                                            >
                                                {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                                            </Text>
                                        )}
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

export default OTPScreen;