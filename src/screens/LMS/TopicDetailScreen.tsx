import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

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

type NavigationProp = StackNavigationProp<RootStackParamList, 'TopicDetailScreen'>;
type RouteProp = RouteProp<RootStackParamList, 'TopicDetailScreen'>;

const TopicDetailScreen = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [scrollY] = useState(new Animated.Value(0));

  // Get route params
  const { lessonId, subjectName, title, description } = route.params;

  // Responsive calculations
  const isTablet = width >= 768;
  const isSmallPhone = width < 375;

  // Colors and theme
  const colors = {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    secondary: '#0891B2',
    success: '#ffffffff',
    warning: '#ffffffff',
    danger: '#ffffffff',
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
  };

  // Sample detailed lesson data (would typically come from API)
  const lessonDetails = {
    id: lessonId,
    title: title,
    description: description,
    subject: subjectName,
    duration: '45 min',
    difficulty: 'Beginner',
    progress: 75,
    isCompleted: false,
    type: 'video',
    instructor: 'Dr. Sarah Johnson',
    rating: 4.8,
    totalStudents: 1247,
    prerequisites: ['Basic Arithmetic', 'Number Theory'],
    learningObjectives: [
      'Understand basic algebraic concepts',
      'Solve simple equations',
      'Apply algebraic thinking to real-world problems',
      'Master variable manipulation'
    ],
    topicOutline: [
      { id: 1, title: 'Introduction to Variables', duration: '8 min', completed: true },
      { id: 2, title: 'Basic Equations', duration: '12 min', completed: true },
      { id: 3, title: 'Solving for X', duration: '15 min', completed: false },
      { id: 4, title: 'Practice Problems', duration: '10 min', completed: false },
    ],
    resources: [
      { id: 1, title: 'Practice Worksheet', type: 'PDF', size: '2.3 MB' },
      { id: 2, title: 'Formula Reference', type: 'PDF', size: '1.1 MB' },
      { id: 3, title: 'Interactive Calculator', type: 'Tool', size: 'Online' },
    ]
  };

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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'Tool':
        return '🛠️';
      case 'Video':
        return '▶️';
      default:
        return '📚';
    }
  };

  // Tab content renderers
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Learning Objectives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Objectives</Text>
        {lessonDetails.learningObjectives.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.objectiveText}>{objective}</Text>
          </View>
        ))}
      </View>

      {/* Prerequisites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prerequisites</Text>
        <View style={styles.prerequisiteContainer}>
          {lessonDetails.prerequisites.map((prereq, index) => (
            <View key={index} style={styles.prerequisiteTag}>
              <Text style={styles.prerequisiteText}>{prereq}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Instructor Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructor</Text>
        <View style={styles.instructorCard}>
          <View style={styles.instructorAvatar}>
            <Text style={styles.avatarText}>SJ</Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{lessonDetails.instructor}</Text>
            <Text style={styles.instructorTitle}>Mathematics Professor</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {lessonDetails.rating}</Text>
              <Text style={styles.studentCount}>• {lessonDetails.totalStudents} students</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContentTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Course Outline</Text>
      {lessonDetails.topicOutline.map((topic, index) => (
        <TouchableOpacity key={topic.id} style={styles.topicItem}>
          <View style={styles.topicHeader}>
            <View style={[styles.topicNumber, topic.completed && styles.completedTopic]}>
              <Text style={[styles.topicNumberText, topic.completed && styles.completedTopicText]}>
                {topic.completed ? '✓' : index + 1}
              </Text>
            </View>
            <View style={styles.topicInfo}>
              <Text style={[styles.topicTitle, topic.completed && styles.completedTopicTitle]}>
                {topic.title}
              </Text>
              <Text style={styles.topicDuration}>{topic.duration}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResourcesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Learning Resources</Text>
      {lessonDetails.resources.map((resource) => (
        <TouchableOpacity key={resource.id} style={styles.resourceItem}>
          <Text style={styles.resourceIcon}>{getResourceIcon(resource.type)}</Text>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceMeta}>{resource.type} • {resource.size}</Text>
          </View>
          <Text style={styles.downloadIcon}>⬇️</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'content':
        return renderContentTab();
      case 'resources':
        return renderResourcesTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
      >
        
        <View style={styles.headerContent}>
          <Text style={styles.subjectTag}>{subjectName}</Text>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerDescription}>{description}</Text>
          
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{lessonDetails.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📊</Text>
              <Text style={[styles.metaText, { color: getDifficultyColor(lessonDetails.difficulty) }]}>
                {lessonDetails.difficulty}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📈</Text>
              <Text style={styles.metaText}>{lessonDetails.progress}% Complete</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'content', label: 'Lectures' },
          { key: 'resources', label: 'Resources' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab.key && styles.activeTabButtonText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>
              {lessonDetails.progress > 0 ? 'Continue Learning' : 'Start Lesson'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  subjectTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#2563EB',
    marginRight: 12,
    marginTop: 2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  prerequisiteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  prerequisiteTag: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  prerequisiteText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  instructorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  instructorTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  studentCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  topicItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  completedTopic: {
    backgroundColor: '#059669',
  },
  topicNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  completedTopicText: {
    color: '#fff',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  completedTopicTitle: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  topicDuration: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resourceIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  resourceMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  downloadIcon: {
    fontSize: 16,
  },
  bottomAction: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TopicDetailScreen;