import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const HomeScreen = () => {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 20,
        },
        subtitle: {
            fontSize: 16,
            color: theme.textSecondary,
            textAlign: 'center',
        },
    }));

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Home Screen</Text>
            <Text style={styles.subtitle}>This screen automatically adapts to dark/light mode!</Text>
        </SafeAreaView>
    );
};

export default HomeScreen;