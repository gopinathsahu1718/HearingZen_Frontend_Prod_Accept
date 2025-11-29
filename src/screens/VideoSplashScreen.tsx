// screens/VideoSplashScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, AppState, Platform } from 'react-native';
import Video from 'react-native-video';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type VideoSplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoSplash'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoSplashScreen = ({ navigation }: { navigation: VideoSplashScreenNavigationProp }) => {
    const videoRef = useRef<Video>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [videoKey, setVideoKey] = useState(0);
    const [paused, setPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Check if there's an active call or audio session
        checkAudioSession();

        // Fallback timeout to ensure navigation happens
        timeoutRef.current = setTimeout(() => {
            console.log('Video timeout - moving to next screen');
            handleVideoEnd();
        }, 8000);

        // Handle app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            subscription.remove();
        };
    }, []);

    const checkAudioSession = async () => {
        try {
            if (Platform.OS === 'android') {
                // For Android, we'll check if audio mode indicates a call
                const { AudioManager } = require('react-native').NativeModules;
                // Note: You might need to create a native module for this
                // For now, we'll use a workaround with the Video component's error handling
                setIsMuted(false); // Try unmuted first
            } else if (Platform.OS === 'ios') {
                // For iOS, similar approach
                setIsMuted(false);
            }
        } catch (error) {
            console.log('Audio session check error:', error);
            // Default to unmuted
            setIsMuted(false);
        }
    };

    const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
            setPaused(false);
            setVideoKey(prev => prev + 1);
        } else {
            setPaused(true);
        }
    };

    const handleVideoEnd = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        navigation.replace('OnboardingCheck');
    };

    const handleVideoError = (error: any) => {
        console.log('Video error:', error);

        // If video fails and we're not muted, it might be due to audio conflict
        // Try muting and replaying
        if (!isMuted) {
            console.log('Video failed - likely audio conflict. Muting and retrying...');
            setIsMuted(true);
            setVideoKey(prev => prev + 1); // Force reload with muted
        } else {
            // If still failing even when muted, proceed to next screen
            setTimeout(() => {
                handleVideoEnd();
            }, 1000);
        }
    };

    const handleVideoLoad = (data: any) => {
        console.log('Video loaded successfully', data);
    };

    const handleVideoProgress = (data: any) => {
        // Optional: Monitor playback progress
    };

    const handleAudioBecomingNoisy = () => {
        // Audio interruption detected (like unplugging headphones during a call)
        console.log('Audio interruption detected');
        setIsMuted(true);
    };

    const handleAudioFocusChanged = (event: any) => {
        // Handle audio focus changes (Android)
        console.log('Audio focus changed:', event);
        if (event.hasAudioFocus === false) {
            // Lost audio focus, likely due to a call
            setIsMuted(true);
        }
    };

    return (
        <View style={styles.container}>
            <Video
                key={videoKey}
                ref={videoRef}
                source={require('../assets/videos/splash.mp4')}
                style={styles.video}
                resizeMode="contain"
                onEnd={handleVideoEnd}
                onError={handleVideoError}
                onLoad={handleVideoLoad}
                onProgress={handleVideoProgress}
                onAudioBecomingNoisy={handleAudioBecomingNoisy}
                onAudioFocusChanged={handleAudioFocusChanged}
                repeat={false}
                paused={paused}
                // Dynamic muting based on audio session
                muted={isMuted}
                volume={isMuted ? 0 : 1.0}
                audioOnly={false}
                // Playback settings
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
                mixWithOthers="mix" // Allow coexistence with other audio
                // Additional props
                controls={false}
                fullscreen={false}
                disableFocus={true}
                hideShutterView={true}
                // Performance optimization
                bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000,
                }}
                poster=""
                posterResizeMode="contain"
                // Automatically handle audio interruptions
                automaticallyWaitsToMinimizeStalling={true}
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