// screens/VideoSplashScreen.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type VideoSplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoSplash'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoSplashScreen = ({ navigation }: { navigation: VideoSplashScreenNavigationProp }) => {
    const videoRef = useRef<Video>(null);

    const handleVideoEnd = () => {
        // Navigate to onboarding or home based on first launch
        navigation.replace('OnboardingCheck');
    };

    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                source={require('../assets/videos/splash.mp4')}
                style={styles.video}
                resizeMode="contain"
                onEnd={handleVideoEnd}
                repeat={false}
                paused={false}
            />
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
    video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});

export default VideoSplashScreen;