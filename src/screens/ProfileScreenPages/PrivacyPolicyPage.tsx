import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyPage = () => {
    const { t } = useTranslation();

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
                <Text style={styles.headerTitle}>{t('privacyPolicy.headerTitle')}</Text>
                <Text style={styles.headerSubtitle}>
                    {t('privacyPolicy.headerSubtitle')}
                </Text>
            </LinearGradient>

            {/* Content */}
            <View style={styles.contentCard}>
                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.introduction.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.introduction.description')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.informationCollected.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.informationCollected.description')}
                </Text>
                <View style={styles.bulletList}>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.informationCollected.bullets.audioInput')}
                    </Text>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.informationCollected.bullets.bluetoothData')}
                    </Text>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.informationCollected.bullets.profileInfo')}
                    </Text>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.informationCollected.bullets.usageStats')}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.howWeUse.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.howWeUse.description')}
                </Text>
                <View style={styles.bulletList}>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.howWeUse.bullets.calibrateProfile')}
                    </Text>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.howWeUse.bullets.improveSound')}
                    </Text>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.howWeUse.bullets.provideAnalytics')}
                    </Text>
                    <Text style={styles.bullet}>
                        • {t('privacyPolicy.sections.howWeUse.bullets.communicateUpdates')}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.dataSecurity.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.dataSecurity.description')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.yourControl.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.yourControl.description')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.thirdParty.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.thirdParty.description')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.updates.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.updates.description')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacyPolicy.sections.contactUs.title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacyPolicy.sections.contactUs.description')}
                </Text>
                <Text style={styles.contactEmail}>support@hearingzen.com</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.divider} />
                <Text style={styles.footerText}>
                    © {new Date().getFullYear()} HearingZen. {t('privacyPolicy.footer.rightsReserved')}
                </Text>
                <Text style={styles.footerSubtext}>
                    {t('privacyPolicy.footer.subtext')}
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