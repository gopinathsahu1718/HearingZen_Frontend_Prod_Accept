import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import PerformanceCard from './LMS/performance';
import Subjects from './LMS/subjects';
import HorizontalCards from './LMS/HorizontalScrollingCard';

const DummyScreen3 = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add the heading here */}
        <Text style={styles.heading}>Performance</Text>

        <PerformanceCard />
        <HorizontalCards />
        <Subjects />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 16, paddingTop: 1 },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
    marginBottom: 8,
  },
});

export default DummyScreen3;
