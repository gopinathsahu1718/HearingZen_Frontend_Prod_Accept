// screens/OnboardingCheckScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingCheckNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingCheck'>;

const OnboardingCheckScreen = ({ navigation }: { navigation: OnboardingCheckNavigationProp }) => {
    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const hasCompletedOnboarding = await AsyncStorage.getItem('@onboarding_completed');

            // Small delay for smooth transition
            setTimeout(() => {
                if (hasCompletedOnboarding === 'true') {
                    navigation.replace('HomeTabs');
                } else {
                    navigation.replace('Onboarding');
                }
            }, 500);
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            // If error, show onboarding to be safe
            navigation.replace('Onboarding');
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#00BFFF" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OnboardingCheckScreen;