// CourseListScreen.tsx - Shows progress only for enrolled courses

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';

type CourseListRouteProp = RouteProp<RootStackParamList, 'CourseList'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category_id: string;
  thumbnail_image_url: string;
  preview_video_url: string;
  price: number;
  actual_price: number;
  author_name: string;
  what_you_learn: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  lessons?: Lesson[];
}

interface Progress {
  _id: string;
  lesson_id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  completed_at: string | null;
}

interface ProgressData {
  totalLessons: number;
  completed: number;
  percentage: string;
  progresses: Progress[];
}

interface EnrollmentStatus {
  enrolled: boolean;
  progress?: ProgressData;
}

const BASE_URL = 'http://13.200.222.176';

const CourseListScreen = () => {
  const { theme } = useTheme();
  const { token, isAuthenticated } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CourseListRouteProp>();
  const { category, courses } = route.params;

  const [enrollmentMap, setEnrollmentMap] = useState<Map<string, EnrollmentStatus>>(new Map());
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchEnrollmentStatus();
    } else {
      setLoadingEnrollments(false);
    }
  }, []);

  const fetchEnrollmentStatus = async () => {
    const newEnrollmentMap = new Map<string, EnrollmentStatus>();

    await Promise.all(
      courses.map(async (course) => {
        try {
          // Check enrollment
          const enrollResponse = await fetch(
            `${BASE_URL}/api/course/check-enrollment/${course._id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          const enrollData = await enrollResponse.json();

          if (enrollData.success && enrollData.enrolled) {
            // Fetch progress if enrolled
            const progressResponse = await fetch(
              `${BASE_URL}/api/course/progress/${course._id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            const progressData = await progressResponse.json();

            newEnrollmentMap.set(course._id, {
              enrolled: true,
              progress: progressData.success ? progressData.data : undefined,
            });
          } else {
            newEnrollmentMap.set(course._id, { enrolled: false });
          }
        } catch (error) {
          console.error(`Error fetching enrollment for course ${course._id}:`, error);
          newEnrollmentMap.set(course._id, { enrolled: false });
        }
      })
    );

    setEnrollmentMap(newEnrollmentMap);
    setLoadingEnrollments(false);
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', { course });
  };

  const renderCourseCard = ({ item }: { item: Course }) => {
    const imageUrl = `${BASE_URL}${item.thumbnail_image_url}`;
    const lessonCount = item.lessons?.length || 0;
    const enrollmentStatus = enrollmentMap.get(item._id);
    const isEnrolled = enrollmentStatus?.enrolled || false;
    const progress = enrollmentStatus?.progress;

    return (
      <TouchableOpacity
        style={[styles.courseCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => handleCoursePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.courseIconContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.courseIcon}
            resizeMode="cover"
          />
        </View>
        <View style={styles.courseInfo}>
          <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.courseLabel, { color: theme.textSecondary }]}>
            {lessonCount} Lesson{lessonCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Show progress only if enrolled */}
        {isEnrolled && progress ? (
          <>
            <View style={styles.progressCircle}>
              <Text style={[styles.progressText, { color: theme.primary }]}>
                {Math.round(parseFloat(progress.percentage))}
              </Text>
              <Text style={[styles.percentText, { color: theme.primary }]}>%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress.percentage}%`, backgroundColor: theme.primary },
                ]}
              />
              <View style={[styles.progressBarEmpty, { backgroundColor: theme.border }]} />
            </View>
            <View style={styles.enrolledBadgeContainer}>
              <View style={[styles.enrolledBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.enrolledBadgeText}>Enrolled</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Show price badge if not enrolled */}
            <View style={styles.priceCircle}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                {item.price === 0 ? 'FREE' : `₹${item.price}`}
              </Text>
            </View>
            <View style={styles.notEnrolledContainer}>
              <Text style={[styles.notEnrolledText, { color: theme.textSecondary }]}>
                Not Enrolled
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No courses available yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        Check back soon for new courses!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.primary}
        barStyle="light-content"
      />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category.name} Courses
        </Text>
      </View>

      <View style={styles.coursesCountContainer}>
        <View style={[styles.countBadge, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.countNumber, { color: theme.primary }]}>
            {courses.length}
          </Text>
          <Text style={[styles.countLabel, { color: theme.primary }]}>
            Courses
          </Text>
        </View>
      </View>

      {loadingEnrollments && isAuthenticated ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading enrollment status...
          </Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  coursesCountContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  countBadge: {
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  countLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  courseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  courseIcon: {
    width: '100%',
    height: '100%',
  },
  courseInfo: {
    marginBottom: 15,
    paddingRight: 80,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    lineHeight: 26,
  },
  courseLabel: {
    fontSize: 14,
  },
  progressCircle: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceCircle: {
    position: 'absolute',
    right: 20,
    top: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  progressBarEmpty: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
  },
  enrolledBadgeContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  enrolledBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  enrolledBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notEnrolledContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  notEnrolledText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default CourseListScreen;