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
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: { navigation: ForgotPasswordScreenNavigationProp }) => {
    const { t } = useTranslation();
    const { theme, isDarkMode } = useTheme();
    const { forgotPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

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
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
            },
            content: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingTop: 200,
                paddingBottom: 40,
            },
            logo: {
                width: 100,
                height: 100,
                marginBottom: 32,
                resizeMode: 'contain',
            },
            title: {
                fontSize: 28,
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: 12,
            },
            subtitle: {
                fontSize: 14,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 40,
                paddingHorizontal: 20,
                lineHeight: 22,
            },
            inputContainer: {
                width: '100%',
                marginBottom: 32,
            },
            inputWrapper: {
                borderWidth: 1,
                borderColor: isDarkMode ? theme.border : '#007BFF',
                backgroundColor: theme.surface,
                borderRadius: 8,
                height: 52,
                paddingHorizontal: 16,
                justifyContent: 'center',
            },
            input: {
                color: theme.text,
                fontSize: 16,
                paddingVertical: 0,
                height: '100%',
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
            backButton: {
                alignItems: 'center',
                paddingVertical: 12,
            },
            backButtonText: {
                color: isDarkMode ? theme.primary : '#007BFF',
                fontSize: 14,
                fontWeight: '500',
            },
        })
    );

    const handleSendOTP = async () => {
        Keyboard.dismiss();

        if (!email) {
            Alert.alert(t('forgotPassword.error'), t('forgotPassword.enterEmail'));
            return;
        }

        setLoading(true);
        try {
            const resetInitToken = await forgotPassword(email.toLowerCase());
            navigation.navigate('ResetPasswordOTP', { resetInitToken, email: email.toLowerCase() });
        } catch (error: any) {
            Alert.alert(t('forgotPassword.error'), error.message);
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
                                <Text style={styles.headerText}>{t('forgotPassword.headerText')}</Text>
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

                                <Text style={styles.title}>{t('forgotPassword.title')}</Text>
                                <Text style={styles.subtitle}>
                                    {t('forgotPassword.subtitle')}
                                </Text>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={t('forgotPassword.emailPlaceholder')}
                                            placeholderTextColor={theme.textSecondary}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleSendOTP}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>{t('forgotPassword.sendOTP')}</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.backButton}>
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.backButtonText}>{t('forgotPassword.backToLogin')}</Text>
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

export default ForgotPasswordScreen;