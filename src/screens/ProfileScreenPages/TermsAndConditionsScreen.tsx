import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useTranslation } from 'react-i18next';

export default function TermsAndConditions() {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);
  const appName = 'HearingZen';
  const lastUpdated = 'November 21, 2025';

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const termsData = t('termsAndConditions.sections', { returnObjects: true });

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
        <Text style={styles.headerTitle}>{t('termsAndConditions.headerTitle')}</Text>
        {/* <Text style={styles.headerSubtitle}>
          {t('termsAndConditions.lastUpdated', { lastUpdated })}
        </Text> */}
      </LinearGradient>

      {/* Introduction Card */}
      <View style={styles.introCard}>
        <Text style={styles.cardTitle}>{t('termsAndConditions.welcome', { appName })}</Text>
        <Text style={styles.introText}>
          {t('termsAndConditions.introText', { appName })}
        </Text>
      </View>

      {/* Terms Sections */}
      <View style={styles.section}>
        {termsData.map((term) => (
          <TouchableOpacity
            key={term.id}
            style={styles.termCard}
            onPress={() => toggleSection(term.id)}
            activeOpacity={0.7}
          >
            <View style={styles.termHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(24, 116, 237, 0.2)' }]}>
                <Text style={styles.iconEmoji}>{term.icon}</Text>
              </View>
              <Text style={styles.termTitle}>{term.title}</Text>
              <Text style={styles.expandIcon}>
                {expandedSection === term.id ? '−' : '+'}
              </Text>
            </View>
            {expandedSection === term.id && (
              <Text style={styles.termContent}>{term.content}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Important Notice */}
      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>{t('termsAndConditions.noticeIcon')}</Text>
        <Text style={styles.noticeTitle}>{t('termsAndConditions.noticeTitle')}</Text>
        <Text style={styles.noticeText}>
          {t('termsAndConditions.noticeText', { appName })}
        </Text>
      </View>

      {/* Agreement Card */}
      <View style={styles.agreementCard}>
        <Text style={styles.agreementText}>
          {t('termsAndConditions.agreementText', { appName })}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <Text style={styles.footerText}>
          {t('termsAndConditions.footerThankYou', { appName })}
        </Text>
        <Text style={styles.footerSubtext}>
          {t('termsAndConditions.footerSubtext')}
        </Text>
      </View>
    </ScrollView>
  );
}

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
  introCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 12,
  },
  introText: {
    color: '#d0d0d0',
    fontSize: 15,
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  termCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
  },
  termTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  expandIcon: {
    color: '#1874ed',
    fontSize: 24,
    fontWeight: '300',
    width: 24,
    textAlign: 'center',
  },
  termContent: {
    color: '#d0d0d0',
    fontSize: 14,
    marginLeft: 52,
    marginTop: 12,
    lineHeight: 22,
  },
  noticeCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    marginHorizontal: 24,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    alignItems: 'center',
  },
  noticeIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  noticeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  noticeText: {
    color: '#d0d0d0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  agreementCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  agreementText: {
    color: '#d0d0d0',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
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