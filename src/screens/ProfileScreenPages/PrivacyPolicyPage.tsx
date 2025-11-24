import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

const PrivacyPolicyPage = () => {
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
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <Text style={styles.headerSubtitle}>
                    Your privacy and trust are our top priorities.
                </Text>
            </LinearGradient>

            {/* Content */}
            <View style={styles.contentCard}>
                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.paragraph}>
                    Welcome to HearingZen! We value your privacy and are committed to
                    protecting your personal data. This policy explains how we collect,
                    use, and safeguard your information when you use our app.
                </Text>

                <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                <Text style={styles.paragraph}>
                    We collect the following types of information to improve your hearing
                    experience:
                </Text>
                <View style={styles.bulletList}>
                    <Text style={styles.bullet}>
                        • Audio input from your device microphone
                    </Text>
                    <Text style={styles.bullet}>
                        • Bluetooth and hearing device connection data
                    </Text>
                    <Text style={styles.bullet}>
                        • Optional profile information you provide
                    </Text>
                    <Text style={styles.bullet}>
                        • Basic app usage statistics (anonymous)
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    Your data is used solely to enhance and personalize your hearing
                    experience. Specifically, we use your information to:
                </Text>
                <View style={styles.bulletList}>
                    <Text style={styles.bullet}>
                        • Calibrate your personal hearing profile
                    </Text>
                    <Text style={styles.bullet}>
                        • Improve sound amplification and clarity
                    </Text>
                    <Text style={styles.bullet}>
                        • Provide analytics to track your hearing health
                    </Text>
                    <Text style={styles.bullet}>
                        • Communicate updates and tips (optional)
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>4. Data Security</Text>
                <Text style={styles.paragraph}>
                    We implement advanced encryption and local data storage to ensure your
                    information remains private and secure. HearingZen never sells or
                    shares your personal data with third parties.
                </Text>

                <Text style={styles.sectionTitle}>5. Your Control</Text>
                <Text style={styles.paragraph}>
                    You can review, edit, or delete your data anytime through the app
                    settings. You can also disable microphone or Bluetooth permissions
                    without affecting your account.
                </Text>

                <Text style={styles.sectionTitle}>6. Third-Party Services</Text>
                <Text style={styles.paragraph}>
                    HearingZen may integrate with secure third-party services for
                    analytics or cloud syncing. These services comply with GDPR and
                    privacy standards.
                </Text>

                <Text style={styles.sectionTitle}>7. Updates to This Policy</Text>
                <Text style={styles.paragraph}>
                    We may update this Privacy Policy from time to time to reflect new
                    features or legal requirements. You’ll be notified in-app whenever
                    changes occur.
                </Text>

                <Text style={styles.sectionTitle}>8. Contact Us</Text>
                <Text style={styles.paragraph}>
                    If you have any questions or concerns regarding this Privacy Policy,
                    please reach out to us at:
                </Text>
                <Text style={styles.contactEmail}>support@hearingzen.com</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerText}>
                    © {new Date().getFullYear()} HearingZen. All rights reserved.
                </Text>
                <Text style={styles.footerSubtext}>
                    Together, we're redefining hearing wellness. 💙
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0e0e0e',
        paddingBottom: 40,
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
        fontSize: 28,
        color: '#fff',
        fontWeight: '800',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 20,
    },
    contentCard: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1874ed',
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#ccc',
        lineHeight: 22,
    },
    bulletList: {
        marginTop: 6,
        marginBottom: 10,
    },
    bullet: {
        fontSize: 14,
        color: '#b0b0b0',
        lineHeight: 22,
        marginLeft: 10,
    },
    contactEmail: {
        fontSize: 15,
        color: '#1874ed',
        fontWeight: '600',
        marginTop: 6,
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
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
    },
    footerSubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        marginTop: 6,
        fontStyle: 'italic',
    },
});

export default PrivacyPolicyPage;