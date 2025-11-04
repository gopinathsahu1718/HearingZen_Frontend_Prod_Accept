// src/screens/AboutApp.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');

const AboutApp = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.videoWrapper}>
        <Video
          source={require('../../assets/videos/LOGO.mp4')}
          style={styles.video}
          resizeMode="cover"
          repeat
          muted
          paused={false}
        />
      </View>

      <Text style={styles.appName}>HearingZen</Text>
      <Text style={styles.version}>Version 1.0.0</Text>

      <View style={styles.textWrapper}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <Text style={styles.description}>
          HearingZen is your personalized auditory wellness assistant.Track, improve, and support your hearing with user-friendly features designed to give you peace of mind and confidence.
          {'\n\n'}
          At HearingZen, we believe in the power of inclusive technology. Hearing loss affects millions of people globally, yet access to smart, intuitive, and reliable hearing assistance remains limited in many regions.
          Our app brings a solution that is both affordable and easy to use, right at your fingertips.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0e0e0e',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  videoWrapper: {
    width: 70,
    height: 70,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
  },

  video: {
    width: '100%',
    height: '100%',
  },

  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1874ed',
    fontFamily: 'sans-serif-medium',
    marginBottom: 6,
  },
  version: {
    fontSize: 16,
    color: '#aaa',
    fontFamily: 'sans-serif',
    marginBottom: 24,
  },
  textWrapper: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1874ed',
    fontFamily: 'sans-serif-medium',
    marginBottom: 12,
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    color: '#e6e6e6',
    lineHeight: 26,
    fontFamily: 'sans-serif',
    textAlign: 'justify',
  },
});

export default AboutApp;
