// src/screens/TermsAndConditions.tsx
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const TermsAndConditions = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0e0e0e" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Welcome to HearingZen. By using our app, you agree to be bound by these Terms and Conditions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Usage</Text>
          <Text style={styles.text}>
            You agree to use the app only for lawful purposes and in a way that does not infringe the rights of others.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Privacy</Text>
          <Text style={styles.text}>
            We respect your privacy. Please read our Privacy Policy to understand how we collect and use your data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
          <Text style={styles.text}>
            We are not liable for any direct, indirect, incidental, or consequential damages arising out of your use of the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Updates</Text>
          <Text style={styles.text}>
            Terms may change from time to time. Continued use of the app means you accept those changes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0e0e0e', // dark background
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1874ed',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#1c1c1c', // dark card background
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#32b4db', // light blue heading
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  text: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  link: {
    color: '#61dafb',
    textDecorationLine: 'underline',
  },
});
