import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
    Alert,
    Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Simple icon components using Text
const Icon = ({ name, size = 24, color = '#000' }) => {
    const icons = {
        messageCircle: '💬',
        mail: '✉️',
        phone: '📞',
        helpCircle: '❓',
        chevronDown: '▼',
        chevronRight: '▶',
        bookOpen: '📖',
        externalLink: '↗',
        alertCircle: '⚠️',
        shield: '🛡️',
        settings: '⚙️',
    };

    return (
        <Text style={{ fontSize: size }}>
            {icons[name] || '•'}
        </Text>
    );
};

const HelpPage = () => {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqs = [
        {
            question: 'How do I start a hearing test?',
            answer: 'Navigate to the Hearing Test tab, ensure you\'re in a quiet environment, put on your headphones, and tap "Start Test". Follow the on-screen instructions and tap when you hear a sound.',
        },
        {
            question: 'Why am I not getting accurate results?',
            answer: 'Make sure you\'re in a quiet room, your headphones are properly connected, and the volume is set to a comfortable level. Avoid taking the test in noisy environments or while moving.',
        },
        {
            question: 'Can I use HearingZen without headphones?',
            answer: 'For accurate hearing tests, headphones are required. However, you can use the Sound Amplifier feature with your device\'s built-in speakers or hearing aids.',
        },
        {
            question: 'How often should I take the hearing test?',
            answer: 'We recommend taking the hearing test once a month to track changes in your hearing health. If you notice sudden changes, consult with a healthcare professional.',
        },
        {
            question: 'Is my hearing data private and secure?',
            answer: 'Yes, all your hearing data is encrypted and stored securely on your device. We never share your personal health information with third parties without your explicit consent.',
        },
        {
            question: 'What do the hearing test results mean?',
            answer: 'Your results show your hearing sensitivity across different frequencies. Lower numbers indicate better hearing. Results are color-coded: Green (Normal), Yellow (Mild loss), Orange (Moderate), Red (Significant loss).',
        },
        {
            question: 'Can HearingZen replace a professional hearing test?',
            answer: 'No. HearingZen is designed for monitoring and tracking, not medical diagnosis. Always consult with an audiologist or healthcare professional for medical advice.',
        },
        {
            question: 'How do I calibrate the Sound Amplifier?',
            answer: 'Go to Settings > Sound Amplifier > Calibration. Follow the steps to adjust gain, bass, and treble to your preference. Start with low settings and gradually increase.',
        },
    ];

    const quickActions = [
        {
            icon: 'messageCircle',
            title: 'Live Chat',
            description: 'Chat with our support team',
            color: '#10B981',
            action: () => {
                Alert.alert('Live Chat', 'Live chat feature coming soon!');
            },
        },
        {
            icon: 'mail',
            title: 'Email Support',
            description: 'support@hearingzen.com',
            color: '#3B82F6',
            action: () => {
                Linking.openURL('mailto:support@hearingzen.com');
            },
        },
        {
            icon: 'phone',
            title: 'Call Us',
            description: '+1 (800) 123-4567',
            color: '#8B5CF6',
            action: () => {
                Linking.openURL('tel:+18001234567');
            },
        },
    ];

    const helpTopics = [
        {
            icon: 'settings',
            title: 'Getting Started',
            description: 'Setup and initial configuration',
            color: '#F59E0B',
        },
        {
            icon: 'bookOpen',
            title: 'User Guide',
            description: 'Complete app documentation',
            color: '#06B6D4',
        },
        {
            icon: 'shield',
            title: 'Privacy & Security',
            description: 'How we protect your data',
            color: '#EC4899',
        },
        {
            icon: 'alertCircle',
            title: 'Troubleshooting',
            description: 'Common issues and fixes',
            color: '#EF4444',
        },
    ];

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
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
                    <Text style={styles.badgeText}>Help & Support</Text>
                </View>
            </LinearGradient>

            {/* Welcome Message */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>We're here to help! 👋</Text>
                <Text style={styles.welcomeText}>
                    Find answers to common questions, contact our support team, or explore our help resources. We're available 24/7 to assist you.
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Us</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionCard}
                            onPress={action.action}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                                <Icon name={action.icon} size={28} color={action.color} />
                            </View>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                            <Text style={styles.actionDescription}>{action.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* FAQs */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <Text style={styles.sectionSubtitle}>
                    Find quick answers to common questions
                </Text>

                <View style={styles.faqContainer}>
                    {faqs.map((faq, index) => (
                        <View key={index} style={styles.faqCard}>
                            <TouchableOpacity
                                style={styles.faqHeader}
                                onPress={() => toggleFAQ(index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqQuestionContainer}>
                                    <View style={styles.faqIcon}>
                                        <Icon name="helpCircle" size={20} color="#1874ed" />
                                    </View>
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                </View>
                                <Icon
                                    name={expandedFAQ === index ? 'chevronDown' : 'chevronRight'}
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>

                            {expandedFAQ === index && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Help Topics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Help Topics</Text>
                <View style={styles.topicsGrid}>
                    {helpTopics.map((topic, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.topicCard}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.topicIconContainer, { backgroundColor: `${topic.color}20` }]}>
                                <Icon name={topic.icon} size={24} color={topic.color} />
                            </View>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                            <Text style={styles.topicDescription}>{topic.description}</Text>
                            <View style={styles.externalIcon}>
                                <Icon name="externalLink" size={16} color="#666" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Emergency Notice */}
            <View style={styles.emergencyCard}>
                <Icon name="alertCircle" size={24} color="#EF4444" />
                <View style={styles.emergencyContent}>
                    <Text style={styles.emergencyTitle}>Medical Emergency?</Text>
                    <Text style={styles.emergencyText}>
                        If you're experiencing sudden hearing loss or severe symptoms, please contact a healthcare professional immediately.
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerSubtext}>
                    Together, we're redefining hearing wellness. 💙
                </Text>
                <Text style={styles.footerVersion}>HearingZen v1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e0e0e',
    },
    contentContainer: {
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
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
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
    section: {
        paddingHorizontal: 24,
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    actionCard: {
        width: '31%',
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: '1.16%',
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
    },
    faqContainer: {
        marginTop: 8,
    },
    faqCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqQuestionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 12,
    },
    faqIcon: {
        marginRight: 12,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        flex: 1,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingLeft: 48,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#b0b0b0',
        lineHeight: 22,
    },
    topicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    topicCard: {
        width: '47%',
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: '1.5%',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        position: 'relative',
    },
    topicIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    topicDescription: {
        fontSize: 13,
        color: '#999',
        lineHeight: 18,
    },
    externalIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emergencyCard: {
        marginHorizontal: 24,
        marginTop: 24,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    emergencyContent: {
        flex: 1,
        marginLeft: 12,
    },
    emergencyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
        marginBottom: 4,
    },
    emergencyText: {
        fontSize: 13,
        color: '#d0d0d0',
        lineHeight: 20,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    resourceContent: {
        flex: 1,
        marginLeft: 12,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 2,
    },
    resourceSubtitle: {
        fontSize: 13,
        color: '#999',
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    divider: {
        width: 60,
        height: 3,
        backgroundColor: '#1874ed',
        borderRadius: 2,
        marginBottom: 16,
    },
    footerText: {
        fontSize: 16,
        color: '#999',
        marginBottom: 16,
    },
    footerButton: {
        backgroundColor: '#1874ed',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    footerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    footerSubtext: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    footerVersion: {
        fontSize: 12,
        color: '#666',
    },
});

export default HelpPage;