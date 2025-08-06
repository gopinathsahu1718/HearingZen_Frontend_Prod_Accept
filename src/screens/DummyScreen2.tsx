import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const DummyScreen2 = () => {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
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
            color: theme.text,
            marginBottom: 15,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: 16,
            color: theme.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: 10,
        },
        accent: {
            width: 50,
            height: 4,
            backgroundColor: theme.secondary,
            borderRadius: 2,
            marginBottom: 20,
        },
    }));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.accent} />
                <Text style={styles.title}>Dummy Screen 2</Text>
                <Text style={styles.subtitle}>
                    This is another placeholder with extra text to demonstrate the layout.
                    Feel free to customize this space as needed! The design seamlessly
                    transitions between light and dark themes.
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default DummyScreen2;
