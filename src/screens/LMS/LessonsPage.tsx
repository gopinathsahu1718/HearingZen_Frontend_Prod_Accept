import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';


// 🔹 Define navigation stack params
type RootStackParamList = {
  LessonsPage: undefined;
  TopicDetailScreen: {
    lessonId: number;
    subjectName: string;
    title: string;
    description: string;
  };
};


type NavigationProp = StackNavigationProp<RootStackParamList, 'LessonsPage'>;


const LessonsPage = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');


  // Responsive calculations
  const isTablet = width >= 768;
  const isSmallPhone = width < 375;


  // Colors and theme
  const colors = {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    secondary: '#0891B2',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
  };


  // Sample lesson data
  const subjectsData = {
    Mathematics: {
      color: colors.primary,
      lightColor: '#EBF4FF',
      icon: '📐',
      totalLessons: 24,
      completedLessons: 18,
      lessons: [
        {
          id: 1,
          title: 'Introduction to Algebra',
          duration: '45 min',
          difficulty: 'Beginner',
          progress: 100,
          isCompleted: true,
          type: 'video',
          description: 'Basic algebraic concepts and equations',
        },
        {
          id: 2,
          title: 'Linear Equations',
          duration: '38 min',
          difficulty: 'Beginner',
          progress: 100,
          isCompleted: true,
          type: 'video',
          description: 'Solving linear equations step by step',
        },
        {
          id: 3,
          title: 'Quadratic Functions',
          duration: '52 min',
          difficulty: 'Intermediate',
          progress: 75,
          isCompleted: false,
          type: 'video',
          description: 'Understanding parabolas and quadratic equations',
        },
        {
          id: 4,
          title: 'Geometry Basics',
          duration: '41 min',
          difficulty: 'Beginner',
          progress: 60,
          isCompleted: false,
          type: 'interactive',
          description: 'Points, lines, angles, and basic shapes',
        },
        {
          id: 5,
          title: 'Trigonometry',
          duration: '55 min',
          difficulty: 'Advanced',
          progress: 0,
          isCompleted: false,
          type: 'video',
          description: 'Sine, cosine, and tangent functions',
        },
      ]
    }
  };


  // Get current subject
  const currentSubject = subjectsData[selectedSubject];
  const progressPercentage = Math.round(
    (currentSubject.completedLessons / currentSubject.totalLessons) * 100,
  );


  // Utility functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return colors.success;
      case 'Intermediate':
        return colors.warning;
      case 'Advanced':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };


  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '▶️';
      case 'interactive':
        return '🎯';
      case 'problem':
        return '📝';
      default:
        return '📚';
    }
  };


  // Lesson card renderer
  const renderLessonCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.lessonCard, item.isCompleted && styles.completedCard]}
      onPress={() =>
        navigation.navigate('TopicDetailScreen', {
          lessonId: item.id,
          subjectName: selectedSubject,
          title: item.title,
          description: item.description,
        })
      }
    >
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonTypeIcon}>
          {getLessonTypeIcon(item.type)}
        </Text>
        <Text style={styles.lessonTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>DONE</Text>
          </View>
        )}
      </View>
      <Text style={styles.lessonDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.lessonMeta}>
        <View style={styles.metaLeft}>
          <Text style={styles.duration}>⏱️ {item.duration}</Text>
          <Text
            style={[
              styles.difficulty,
              { color: getDifficultyColor(item.difficulty) },
            ]}
          >
            {item.difficulty}
          </Text>
        </View>
        <View style={styles.progressSection}>
          <Text
            style={[styles.progressPercent, { color: currentSubject.color }]}
          >
            {item.progress}%
          </Text>
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${item.progress}%`,
                  backgroundColor: currentSubject.color,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lessons</Text>
        <Text style={styles.headerSubtitle}>
          Continue your learning journey
        </Text>
      </View>


      {/* Lessons List */}
      <FlatList
        data={currentSubject.lessons}
        renderItem={renderLessonCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lessonsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};


// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  lessonsList: { padding: 20 },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  completedCard: { borderLeftWidth: 4, borderLeftColor: '#059669' },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lessonTypeIcon: { fontSize: 16, marginRight: 12 },
  lessonTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  completedBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  lessonDescription: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: { flexDirection: 'row', alignItems: 'center' },
  duration: { fontSize: 12, color: '#94A3B8', marginRight: 16 },
  difficulty: { fontSize: 11, fontWeight: '600' },
  progressSection: { alignItems: 'flex-end' },
  progressPercent: { fontSize: 12, fontWeight: '600' },
  miniProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: { height: '100%', borderRadius: 2 },
});


export default LessonsPage;
