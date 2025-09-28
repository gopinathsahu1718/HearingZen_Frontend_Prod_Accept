import React from 'react';
import { View, Text, StyleSheet, SafeAreaView,StatusBar } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import WeatherScreen from "./Weather/features/weather/components/WeatherScreen";
import { ThemeProvider } from "./Weather/theme.tsx";

const DummyScreen2 = () => {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
    }));

    return (
        <ThemeProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <WeatherScreen />
      </SafeAreaView> 
    </ThemeProvider>
    );
};

export default DummyScreen2;
