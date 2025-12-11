import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = 'http://13.200.222.176/api';

const FeedbackPage = () => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !feedback.trim() || rating <= 0) {
            Alert.alert(
                t('feedback.incompleteTitle'),
                t('feedback.incompleteMessage'),
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    rating,
                    feedback: feedback.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert(
                    t('feedback.thankYouTitle'),
                    t('feedback.successMessage', { rating }),
                );
                setName('');
                setRating(0);
                setFeedback('');
            } else {
                Alert.alert(
                    t('feedback.errorTitle'),
                    data.message || t('feedback.errorMessage'),
                );
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            Alert.alert(
                t('feedback.errorTitle'),
                t('feedback.networkError'),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <LinearGradient
                colors={['#1874ed', '#0a4a9e', '#0e0e0e']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={styles.headerLogoWrapper}>
                    <Video
                        source={require('../../assets/videos/LOGO.mp4')}
                        style={styles.headerLogo}
                        resizeMode="cover"
                        repeat
                        muted
                        paused={false}
                    />
                </View>
                <Text style={styles.headerTitle}>{t('feedback.headerTitle')}</Text>
                <Text style={styles.headerSubtitle}>
                    {t('feedback.headerSubtitle')}
                </Text>
            </LinearGradient>

            {/* Feedback Form */}
            <View style={styles.formCard}>
                <Text style={styles.label}>{t('feedback.yourName')}</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('feedback.namePlaceholder')}
                    placeholderTextColor="#777"
                    style={styles.input}
                />

                <Text style={styles.label}>{t('feedback.rateExperience')}</Text>
                <View style={styles.ratingRow} accessibilityRole="radiogroup">
                    {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: rating === star }}
                            accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.star,
                                    rating >= star ? styles.activeStar : styles.inactiveStar,
                                ]}
                            >
                                {rating >= star ? '★' : '☆'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>{t('feedback.yourFeedback')}</Text>
                <TextInput
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder={t('feedback.feedbackPlaceholder')}
                    placeholderTextColor="#777"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={5}
                />

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <LinearGradient
                        colors={['#1874ed', '#0a4a9e']}
                        style={[
                            styles.submitButton,
                            isSubmitting && styles.submitButtonDisabled
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.submitText}>{t('feedback.submitButton')}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Encouragement Card */}
            <View style={styles.tipCard}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                    {t('feedback.tipText')}
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerText}>
                    {t('feedback.footerThankYou')}
                </Text>
                <Text style={styles.footerSubtext}>
                    {t('feedback.footerSubtext')}
                </Text>
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
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerEmoji: {
        fontSize: 52,
        marginBottom: 10,
    },
    headerLogoWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#000',
    },
    headerLogo: {
        width: '100%',
        height: '100%',
    },
    headerTitle: {
        fontSize: 26,
        color: '#fff',
        fontWeight: '800',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 6,
    },
    formCard: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    label: {
        fontSize: 15,
        color: '#fff',
        marginBottom: 6,
        marginTop: 12,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#121212',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    ratingRow: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    star: {
        fontSize: 30,
        marginRight: 8,
    },
    inactiveStar: {
        color: '#555',
    },
    activeStar: {
        color: '#ffd700',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    submitButton: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
    tipCard: {
        backgroundColor: 'rgba(24, 116, 237, 0.1)',
        marginHorizontal: 24,
        marginTop: 28,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(24, 116, 237, 0.3)',
        alignItems: 'center',
    },
    tipIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    tipText: {
        color: '#d0d0d0',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        paddingHorizontal: 24,
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
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    footerSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 6,
    },
});

export default FeedbackPage;