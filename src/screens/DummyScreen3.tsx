import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const DummyScreen3 = () => {
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
            backgroundColor: theme.tertiary,
            borderRadius: 2,
            marginBottom: 20,
        },
    }));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.accent} />
                <Text style={styles.title}>Dummy Screen 3</Text>
                <Text style={styles.subtitle}>
                    This is the third dummy screen with added text for better visibility.
                    Enjoy exploring this section of the app! Each screen maintains consistent
                    theming while offering unique visual elements.
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default DummyScreen3;