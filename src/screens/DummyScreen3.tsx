import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const DummyScreen3 = () => (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.title}>Dummy 3</Text>
            <Text style={styles.subtitle}>This is the third dummy screen with added text for better visibility. Enjoy exploring this section of the app!</Text>
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
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default DummyScreen3;