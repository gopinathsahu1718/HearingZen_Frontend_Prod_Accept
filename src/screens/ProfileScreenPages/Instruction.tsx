import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const InstructionPage = () => {
    const instructions = [
        {
            icon: '🚀',
            title: 'Getting Started',
            steps: [
                'Open the HearingZen app and grant the required microphone and Bluetooth permissions',
                'Ensure your hearing device or headphones are connected properly',
                'Youll be guided through a simple setup to personalize your hearing profile'
            ]
        },
        {
            icon: '🎧',
            title: 'Hearing Test',
            steps: [
                'Go to the Hearing Test section from the main menu',
                'Follow the on-screen audio instructions carefully in a quiet environment',
                'The app will measure your hearing sensitivity and provide results instantly'
            ]
        },
        {
            icon: '🔊',
            title: 'Sound Amplifier',
            steps: [
                'Access the Sound Amplifier to enhance ambient sounds',
                'Use the volume slider to adjust amplification safely',
                'Avoid using maximum volume for long periods to protect your ears'
            ]
        },
        {
            icon: '📊',
            title: 'Hearing Health Tracker',
            steps: [
                'View your hearing trends and progress in the Tracker tab',
                'Track improvements over time with detailed analytics',
                'Get daily tips and insights to maintain ear health'
            ]
        },
        {
            icon: '💬',
            title: 'Support',
            steps: [
                'Visit the Help & Support section for FAQs and guides',
                'Contact our team directly for personalized assistance',
                'Access video tutorials and documentation anytime'
            ]
        }
    ];

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {/* Header with Gradient Background */}
            <LinearGradient
                colors={['#1874ed', '#0a4a9e', '#0e0e0e']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                {/* App Logo / Video Animation */}
                <View style={styles.videoWrapper}>
                    <Video
                        source={require('../../assets/videos/LOGO.mp4')}
                        style={styles.video}
                        resizeMode="cover"
                        repeat
                        muted
                        paused={false}
                    />
                    <View style={styles.videoOverlay} />
                </View>

                {/* App Title */}
                <Text style={styles.appName}>HearingZen</Text>
                <Text style={styles.tagline}>Your Personal Hearing Companion</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>User Guide</Text>
                </View>
            </LinearGradient>

            {/* Welcome Message */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Welcome! 👋</Text>
                <Text style={styles.welcomeText}>
                    This guide will help you get the most out of HearingZen. Follow these simple steps to enhance your hearing experience.
                </Text>
            </View>

            {/* Instruction Cards */}
            <View style={styles.contentWrapper}>
                {instructions.map((section, index) => (
                    <View key={index} style={styles.instructionCard}>
                        {/* Card Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>{section.icon}</Text>
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                            </View>
                        </View>

                        {/* Card Content */}
                        <View style={styles.cardContent}>
                            {section.steps.map((step, stepIndex) => (
                                <View key={stepIndex} style={styles.stepRow}>
                                    <View style={styles.bullet} />
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Connector Line (except for last card) */}
                        {index < instructions.length - 1 && <View style={styles.connector} />}
                    </View>
                ))}
            </View>

            {/* Tips Section */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsIcon}>💡</Text>
                <Text style={styles.tipsTitle}>Pro Tips</Text>
                <View style={styles.tipsList}>
                    <Text style={styles.tipItem}>• Use headphones in quiet spaces for accurate test results</Text>
                    <Text style={styles.tipItem}>• Take regular breaks during extended use</Text>
                    <Text style={styles.tipItem}>• Update your hearing profile monthly for best results</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerText}>
                    Thank you for being part of HearingZen
                </Text>
                <Text style={styles.footerSubtext}>
                    Together, we're redefining hearing wellness. 💙
                </Text>
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0e0e0e',
        paddingBottom: 32,
        flexGrow: 1,
    },
    header: {
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    videoWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#1874ed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(24, 116, 237, 0.1)',
    },
    appName: {
        fontSize: 34,
        fontWeight: '800',
        color: '#ffffff',
        fontFamily: 'sans-serif-medium',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
        fontFamily: 'sans-serif',
        marginBottom: 16,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeText: {
        fontSize: 13,
        color: '#ffffff',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    welcomeCard: {
        marginHorizontal: 24,
        marginTop: 24,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 15,
        color: '#b0b0b0',
        lineHeight: 22,
    },
    contentWrapper: {
        paddingHorizontal: 24,
        marginTop: 16,
    },
    instructionCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#1874ed20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#1874ed40',
    },
    icon: {
        fontSize: 28,
    },
    titleContainer: {
        flex: 1,
    },
    stepNumber: {
        fontSize: 12,
        color: '#1874ed',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        fontFamily: 'sans-serif-medium',
    },
    cardContent: {
        paddingLeft: 8,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1874ed',
        marginTop: 8,
        marginRight: 12,
        marginLeft: 4,
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        color: '#d0d0d0',
        lineHeight: 22,
        fontFamily: 'sans-serif',
    },
    connector: {
        position: 'absolute',
        left: 48,
        bottom: -16,
        width: 2,
        height: 16,
        backgroundColor: '#2a2a2a',
    },
    tipsCard: {
        marginHorizontal: 24,
        marginTop: 24,
        backgroundColor: 'rgba(24, 116, 237, 0.1)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(24, 116, 237, 0.3)',
        alignItems: 'center',
    },
    tipsIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    tipsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    tipsList: {
        width: '100%',
    },
    tipItem: {
        fontSize: 14,
        color: '#d0d0d0',
        lineHeight: 22,
        marginBottom: 6,
    },
    footer: {
        marginTop: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    divider: {
        width: 60,
        height: 3,
        backgroundColor: '#1874ed',
        borderRadius: 2,
        marginBottom: 16,
    },
    footerText: {
        fontSize: 17,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 6,
    },
    footerSubtext: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    versionText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});

export default InstructionPage;