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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type ResetPasswordOTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPasswordOTP'>;
type ResetPasswordOTPScreenRouteProp = RouteProp<RootStackParamList, 'ResetPasswordOTP'>;

interface Props {
    navigation: ResetPasswordOTPScreenNavigationProp;
    route: ResetPasswordOTPScreenRouteProp;
}

const ResetPasswordOTPScreen: React.FC<Props> = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme();
    const { verifyResetOtp, forgotPassword } = useAuth();
    const { resetInitToken: initialResetInitToken, email } = route.params;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resetInitToken, setResetInitToken] = useState(initialResetInitToken);
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
                fontSize: 22,
                fontWeight: 'bold',
                textAlign: 'center',
            },
            title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 10,
            },
            subtitle: {
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 30,
            },
            email: {
                color: theme.primary,
                fontWeight: '600',
            },
            otpContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: 30,
            },
            otpInput: {
                width: 50,
                height: 55,
                borderWidth: 2,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: 8,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
            },
            otpInputFocused: {
                borderColor: theme.primary,
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
            resendContainer: {
                marginTop: 20,
                alignItems: 'center',
            },
            resendText: {
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: 5,
            },
            resendButton: {
                padding: 10,
            },
            resendButtonText: {
                color: canResend ? theme.primary : theme.textSecondary,
                fontSize: 16,
                fontWeight: '600',
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
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter complete OTP');
            return;
        }

        setLoading(true);
        try {
            const resetToken = await verifyResetOtp(otpCode, resetInitToken);
            navigation.navigate('NewPassword', { resetToken });
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
            const newResetInitToken = await forgotPassword(email);
            setResetInitToken(newResetInitToken);
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
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Reset{'\n'}Password</Text>
                </View>

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
                    style={styles.button}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the code?</Text>
                    <TouchableOpacity
                        style={styles.resendButton}
                        onPress={handleResend}
                        disabled={!canResend || resendLoading}
                    >
                        {resendLoading ? (
                            <ActivityIndicator color={theme.primary} />
                        ) : (
                            <Text style={styles.resendButtonText}>
                                {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ResetPasswordOTPScreen;