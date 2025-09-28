import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';

// --- Only Course Data ---
const COURSE_DATA = [
  { id: '1', title: 'React Native Dev', level: 'Advanced', color: '#3B82F6', isNew: true, type: 'course' },
  { id: '2', title: 'Machine Learning', level: 'Intermediate', color: '#10B981', type: 'course' },
  { id: '3', title: 'Digital Marketing', level: 'Beginner', color: '#F59E0B', isNew: true, type: 'course' },
  { id: '4', title: 'Data Science', level: 'Intermediate', color: '#8B5CF6', type: 'course' },
];

// Helper color function for course levels
const getLevelColor = (level) => {
  const colors = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
  };
  return colors[level] || '#6B7280';
};

// Course Card Component
const CourseCard = ({ item, width }) => (
  <TouchableOpacity style={[styles.card, { width }]} activeOpacity={0.7}>
    {item.isNew && (
      <View style={styles.badgeGreen}>
        <Text style={styles.badgeTextWhite}>NEW</Text>
      </View>
    )}
    <View style={[styles.colorBar, { backgroundColor: item.color }]} />
    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
    <View style={[styles.badge, { backgroundColor: getLevelColor(item.level) + '30' }]}>
      <Text style={[styles.badgeText, { color: getLevelColor(item.level) }]}>{item.level}</Text>
    </View>
  </TouchableOpacity>
);

// Main HorizontalCards Component
const HorizontalCards = () => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(220, width * 0.6);
  const cardSpacing = 16;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Recent Courses</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 0, paddingRight: 16 }}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
      >
        {COURSE_DATA.map(item => (
          <CourseCard key={item.id} item={item} width={cardWidth} />
        ))}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#ebf4fdff',
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
    minHeight: 120,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgeTextWhite: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  badgeGreen: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  colorBar: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    marginBottom: 12,
  },
});

export default HorizontalCards;
