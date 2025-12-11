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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqs = t('help.faqs', { returnObjects: true });

    const quickActions = t('help.quickActions', { returnObjects: true });

    const helpTopics = t('help.helpTopics', { returnObjects: true });

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
                <Text style={styles.tagline}>{t('help.tagline')}</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('help.badge')}</Text>
                </View>
            </LinearGradient>

            {/* Welcome Message */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>{t('help.welcomeTitle')}</Text>
                <Text style={styles.welcomeText}>
                    {t('help.welcomeText')}
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('help.contactUs')}</Text>
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
                <Text style={styles.sectionTitle}>{t('help.faqTitle')}</Text>
                <Text style={styles.sectionSubtitle}>
                    {t('help.faqSubtitle')}
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
                <Text style={styles.sectionTitle}>{t('help.helpTopicsTitle')}</Text>
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
                    <Text style={styles.emergencyTitle}>{t('help.emergencyTitle')}</Text>
                    <Text style={styles.emergencyText}>
                        {t('help.emergencyText')}
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerSubtext}>
                    {t('help.footerSubtext')}
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