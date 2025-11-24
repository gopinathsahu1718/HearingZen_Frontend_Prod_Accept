import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

export default function AboutApp() {
  const appVersion = '1.0.0';
  const appName = 'HearingZen';

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
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
        <Text style={styles.headerTitle}>About {appName}</Text>
        <Text style={styles.headerSubtitle}>
          Version {appVersion}
        </Text>
      </LinearGradient>

      {/* Description Card */}
      <View style={styles.descriptionCard}>
        <Text style={styles.cardTitle}>Our Mission</Text>
        <Text style={styles.description}>
          {appName} is designed to provide you with an exceptional hearing wellness experience.
          We're committed to delivering quality, performance, and user satisfaction in everything we do.
          Together, we're redefining hearing wellness.
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Us</Text>

        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(24, 116, 237, 0.2)' }]}>
              <Text style={styles.iconEmoji}>🔒</Text>
            </View>
            <Text style={styles.featureTitle}>Secure & Private</Text>
          </View>
          <Text style={styles.featureText}>
            Your data is encrypted and protected with industry-standard security measures.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(24, 116, 237, 0.2)' }]}>
              <Text style={styles.iconEmoji}>❤️</Text>
            </View>
            <Text style={styles.featureTitle}>User-Focused</Text>
          </View>
          <Text style={styles.featureText}>
            Built with you in mind, featuring intuitive design and seamless functionality.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(24, 116, 237, 0.2)' }]}>
              <Text style={styles.iconEmoji}>🌐</Text>
            </View>
            <Text style={styles.featureTitle}>Always Improving</Text>
          </View>
          <Text style={styles.featureText}>
            Regular updates bring new features and improvements based on your feedback.
          </Text>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get In Touch</Text>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => openLink('mailto:support@hearingzen.com')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: 'rgba(24, 116, 237, 0.2)' }]}>
            <Text style={styles.contactEmoji}>📧</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactSubtitle}>support@hearingzen.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => openLink('https://www.hearingzen.com')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: 'rgba(24, 116, 237, 0.2)' }]}>
            <Text style={styles.contactEmoji}>🌍</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Website</Text>
            <Text style={styles.contactSubtitle}>www.hearingzen.com</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tip Card */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          Your voice matters! Every suggestion helps us improve the way you hear
          the world. Share your feedback to help us grow. 🌍
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <Text style={styles.footerText}>
          Thank you for being part of {appName}.
        </Text>
        <Text style={styles.footerSubtext}>
          Together, we're redefining hearing wellness. 💙
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
  descriptionCard: {
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
  description: {
    color: '#d0d0d0',
    fontSize: 15,
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  featureTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  featureText: {
    color: '#d0d0d0',
    fontSize: 14,
    marginLeft: 52,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactEmoji: {
    fontSize: 24,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactSubtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: 'rgba(24, 116, 237, 0.1)',
    marginHorizontal: 24,
    marginTop: 24,
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
  legalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  legalItem: {
    paddingVertical: 12,
  },
  dividerSmall: {
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  legalText: {
    color: '#d0d0d0',
    fontSize: 15,
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