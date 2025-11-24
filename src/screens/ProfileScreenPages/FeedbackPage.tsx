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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

const FeedbackPage = () => {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = () => {
        if (!name.trim() || !feedback.trim() || rating <= 0) {
            Alert.alert(
                'Incomplete',
                'Please fill in all fields and provide a rating before submitting.',
            );
            return;
        }

        Alert.alert(
            'Thank You 💙',
            `Your feedback (rating: ${rating}/5) has been submitted successfully!`,
        );
        setName('');
        setRating(0);
        setFeedback('');
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
                <Text style={styles.headerTitle}>We Value Your Feedback</Text>
                <Text style={styles.headerSubtitle}>
                    Help us make HearingZen even better for you.
                </Text>
            </LinearGradient>

            {/* Feedback Form */}
            <View style={styles.formCard}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#777"
                    style={styles.input}
                />

                <Text style={styles.label}>Rate Your Experience</Text>
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

                <Text style={styles.label}>Your Feedback</Text>
                <TextInput
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder="Tell us about your experience..."
                    placeholderTextColor="#777"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={5}
                />

                {/* Submit Button */}
                <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#1874ed', '#0a4a9e']}
                        style={styles.submitButton}
                    >
                        <Text style={styles.submitText}>Submit Feedback</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Encouragement Card */}
            <View style={styles.tipCard}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                    Your voice matters! Every suggestion helps us improve the way you hear
                    the world. 🌍
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerText}>
                    Thank you for being part of HearingZen.
                </Text>
                <Text style={styles.footerSubtext}>
                    Together, we’re redefining hearing wellness. 💙
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
