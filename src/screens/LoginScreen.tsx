import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Login</Text>
            </View>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <TextInput style={styles.input} placeholder="Email" defaultValue="hello@reallygreatsite.com" />
            <View style={styles.passwordContainer}>
                <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} defaultValue="******" />
                <Image source={require('../assets/images/lock.png')} style={styles.lockIcon} />
            </View>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}>Not have account? Signup here</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        backgroundColor: '#007BFF',
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
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#007BFF',
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
    },
    button: {
        backgroundColor: '#007BFF',
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
        color: '#007BFF',
        marginTop: 10,
    },
});

export default LoginScreen;