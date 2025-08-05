import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: { navigation: SplashScreenNavigationProp }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const pulseAnimation = () => {
            Animated.loop(
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 2,
                        duration: 2000,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease),
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        pulseAnimation();

        const timer = setTimeout(() => {
            navigation.replace('HomeTabs');
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.pulse,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                />
                <Image source={require('../assets/images/splash.png')} style={styles.logo} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        zIndex: 2,
    },
    pulse: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 60,
        backgroundColor: '#007BFF',
        zIndex: 1,
    },
});

export default SplashScreen;