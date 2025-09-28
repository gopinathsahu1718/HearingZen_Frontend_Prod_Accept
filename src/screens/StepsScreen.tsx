import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import StepCircle from './StepScreen/StepCircle';
import Header from './StepScreen/Header';
import StatsPanel from './StepScreen/StatsPanel';
import StepsChart from './StepScreen/StepsChart';
import BMICards from './StepScreen/BMICards';
import { ScrollView } from 'react-native-gesture-handler';

const StepsScreen = () => {
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
            backgroundColor: theme.primary,
            borderRadius: 2,
            marginBottom: 20,
        },
    }));

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header />
                <StepCircle />
                <StatsPanel />
                <StepsChart />
                <BMICards />
            </ScrollView>
        </SafeAreaView>
    );
};

export default StepsScreen;