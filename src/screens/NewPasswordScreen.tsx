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
            passwordContainer: {
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
            },
            input: {
                width: '100%',
                height: 50,
                borderWidth: 1,
                borderColor: isDarkMode ? theme.border : '#007BFF',
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: 5,
                paddingHorizontal: 10,
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
                marginTop: 20,
            },
            buttonText: {
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
            },
            hint: {
                fontSize: 12,
                color: theme.textSecondary,
                marginTop: 10,
                textAlign: 'center',
                paddingHorizontal: 10,
            },
        })
    );

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
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
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>New{'\n'}Password</Text>
                </View>

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

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={true}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <Image
                        source={require('../assets/images/lock.png')}
                        style={styles.lockIcon}
                    />
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={true}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <Image
                        source={require('../assets/images/lock.png')}
                        style={styles.lockIcon}
                    />
                </View>

                <Text style={styles.hint}>
                    Password must be at least 8 characters long, include an uppercase letter, lowercase letter, number, and special character
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default NewPasswordScreen;