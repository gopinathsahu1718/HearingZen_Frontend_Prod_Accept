import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const DummyScreen1 = () => (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.title}>Dummy 1</Text>
            <Text style={styles.subtitle}>This is a placeholder screen with additional content to fill the space. Explore more features and enjoy your time here!</Text>
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

export default DummyScreen1;