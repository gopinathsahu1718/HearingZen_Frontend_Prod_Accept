// screens/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Image,
    ViewToken,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingItem {
    id: string;
    image: any;
    title: string;
    description: string;
}

const onboardingData: OnboardingItem[] = [
    {
        id: '1',
        image: require('../assets/onboarding/screen1.png'),
        title: 'Welcome to HEARINGZEN',
        description: 'Hello! Welcome to HEARINGZEN, the Teeth Hearing Aid App, which uses bone conduction technology to improve your hearing',
    },
    {
        id: '2',
        image: require('../assets/onboarding/screen2.png'),
        title: 'Hear Through Your Teeth',
        description: 'Experience revolutionary bone conduction technology that transmits sound through your teeth',
    },
    {
        id: '3',
        image: require('../assets/onboarding/screen3.png'),
        title: 'Integrated Clarity & Tracking',
        description: 'Track your health metrics including calories, BMI, steps, and running distance',
    },
    {
        id: '4',
        image: require('../assets/onboarding/screen4.png'),
        title: 'Instant Control & Cognitive Training',
        description: 'Choose from face-to-face, self-blended, or fully online learning experiences',
    },
];

const OnboardingScreen = ({ navigation }: { navigation: OnboardingScreenNavigationProp }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('@onboarding_completed', 'true');
            navigation.replace('HomeTabs');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const renderItem = ({ item }: { item: OnboardingItem }) => (
        <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            {/* <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View> */}
        </View>
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {onboardingData.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === currentIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            {renderDots()}

            <View style={styles.buttonContainer}>
                {currentIndex < onboardingData.length - 1 ? (
                    <>
                        {/* <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextText}>Next</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.getStartedButton} onPress={handleFinish}>
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.6,
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 120,
        width: '100%',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#00BFFF',
        width: 30,
    },
    inactiveDot: {
        backgroundColor: '#444444',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 40,
        paddingBottom: 50,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    skipButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    skipText: {
        color: '#888888',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#00BFFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    getStartedButton: {
        backgroundColor: '#00BFFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        flex: 1,
        alignItems: 'center',
    },
    getStartedText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default OnboardingScreen;