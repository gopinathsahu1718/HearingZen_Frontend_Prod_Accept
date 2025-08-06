// screens/SignUpScreen.tsx

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const { theme, isDarkMode } = useTheme();

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
            },
            link: {
                color: isDarkMode ? theme.primary : '#007BFF',
                marginTop: 10,
            },
        })
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Sign Up</Text>
                </View>

                {/* Theme-based image */}
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
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.textSecondary}
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={true}
                    />
                    <Image
                        source={require('../assets/images/lock.png')}
                        style={styles.lockIcon}
                    />
                </View>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already Registered? Log in here.</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default SignUpScreen;
