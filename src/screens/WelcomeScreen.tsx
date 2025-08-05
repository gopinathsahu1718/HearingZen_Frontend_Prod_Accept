import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: { navigation: WelcomeScreenNavigationProp }) => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Sign Up</Text>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.buttonTextSignup}>Continue with Mail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonTextLogin}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    buttonPrimary: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonSecondary: {
        borderWidth: 1,
        borderColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
    },
    buttonTextSignup: {
        color: '#fff',
        fontSize: 16,
    },
    buttonTextLogin: {
        color: '#000',
        fontSize: 16,
    },
});

export default WelcomeScreen;