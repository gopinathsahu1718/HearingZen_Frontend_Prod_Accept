// CourseDetailScreen.tsx - Navigate to lesson only if enrolled

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import RazorpayCheckout from "react-native-razorpay";
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  video_url: string;
  order: number;
}

const { width, height } = Dimensions.get('window');
const BASE_URL = 'http://13.200.222.176';

const CourseDetailScreen = () => {
  const { theme } = useTheme();
  const { token, isAuthenticated } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CourseDetailRouteProp>();
  const { course } = route.params;
  const videoRef = useRef<Video>(null);

  const [paused, setPaused] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  const videoUrl = `${BASE_URL}${course.preview_video_url}`;

  useEffect(() => {
    checkEnrollmentStatus();
    // Use lessons from course object if available, otherwise fetch
    if (course.lessons && course.lessons.length > 0) {
      setAllLessons(course.lessons as Lesson[]);
    }
  }, []);


  const checkEnrollmentStatus = async () => {
    if (!token) {
      setCheckingEnrollment(false);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/course/check-enrollment/${course._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setIsEnrolled(data.enrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollPress = async () => {
    if (!isAuthenticated || !token) {
      Alert.alert(
        'Authentication Required',
        'Please login to enroll in this course',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      return;
    }

    setEnrolling(true);

    try {
      const orderResponse = await fetch(
        `${BASE_URL}/api/course/create-order/${course._id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      if (orderData.enrollment_id) {
        Alert.alert('Success', 'You have been enrolled in this course!', [
          {
            text: 'OK',
            onPress: () => {
              setIsEnrolled(true);
              navigation.navigate('MyEnrollments');
            },
          },
        ]);
        setEnrolling(false);
        return;
      }

      const options = {
        description: course.title,
        image: `${BASE_URL}${course.thumbnail_image_url}`,
        currency: 'INR',
        key: orderData.key,
        amount: orderData.order.amount,
        name: 'Course Enrollment',
        order_id: orderData.order.id,
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
        },
        theme: { color: theme.primary },
      };

      RazorpayCheckout.open(options)
        .then((response: any) => handlePaymentSuccess(response, orderData.order.id))
        .catch((error: any) => {
          console.log('Payment cancelled or failed:', error);
          setEnrolling(false);
          if (error.code !== RazorpayCheckout.PAYMENT_CANCELLED) {
            Alert.alert('Payment Failed', 'Please try again');
          }
        });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process enrollment');
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    try {
      const verifyResponse = await fetch(
        `${BASE_URL}/api/course/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id || orderId,
            signature: response.razorpay_signature,
            courseId: course._id,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        Alert.alert('Success', 'Enrollment successful!', [
          {
            text: 'OK',
            onPress: () => {
              setIsEnrolled(true);
              navigation.navigate('MyEnrollments');
            },
          },
        ]);
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment verification failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleGoToCourse = () => {
    navigation.navigate('EnrolledCourse', { courseId: course._id });
  };

  const handleLessonPress = (lesson: Lesson, index: number) => {
    if (!isEnrolled) {
      Alert.alert(
        'Enrollment Required',
        'You need to enroll in this course to access the lessons',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enroll Now',
            onPress: handleEnrollPress,
          },
        ]
      );
      return;
    }

    // Navigate to lesson player if enrolled
    navigation.navigate('LessonPlayer', {
      lesson,
      courseId: course._id,
      courseTitle: course.title,
      allLessons: allLessons,
      currentIndex: index,
    });
  };

  const renderEnrollButton = () => {
    if (checkingEnrollment) {
      return (
        <View style={[styles.subscribeContainer, { backgroundColor: theme.primary }]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View style={[styles.subscribeContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.subscribeLabel}>LOGIN TO ENROLL</Text>
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollPress}>
            <Text style={styles.enrollButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isEnrolled) {
      return (
        <View style={[styles.subscribeContainer, { backgroundColor: '#10B981' }]}>
          <Text style={styles.subscribeLabel}>ENROLLED</Text>
          <TouchableOpacity style={styles.enrollButton} onPress={handleGoToCourse}>
            <Text style={styles.enrollButtonText}>Go To Course</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.subscribeContainer, { backgroundColor: theme.primary }]}>
        <Text style={styles.subscribeLabel}>SUBSCRIBE</Text>
        <Text style={styles.priceText}>
          ₹ {course.price === 0 ? 'Free' : course.price}
        </Text>
        {course.actual_price > course.price && course.price !== 0 && (
          <Text style={styles.actualPrice}>₹ {course.actual_price}</Text>
        )}
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={handleEnrollPress}
          disabled={enrolling}
        >
          {enrolling ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text style={styles.enrollButtonText}>
              {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Player Section */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            paused={paused}
            resizeMode="contain"
            controls={true}
          />
        </View>

        {/* Course Title */}
        <View style={styles.contentSection}>
          <Text style={[styles.courseTitle, { color: theme.text }]}>
            {course.title}
          </Text>
        </View>

        {/* Course Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Course Description
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {course.description}
          </Text>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            What You'll Learn
          </Text>
          {course.what_you_learn.map((item, index) => (
            <View key={index} style={styles.learningItem}>
              <View style={styles.checkIcon}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={[styles.learningText, { color: theme.text }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Instructor
          </Text>
          <Text style={[styles.instructorName, { color: theme.text }]}>
            {course.author_name}
          </Text>
        </View>

        {/* Course Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Course Content
            </Text>
            {!isEnrolled && (
              <View style={[styles.lockBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.lockIcon, { color: theme.primary }]}>🔒</Text>
                <Text style={[styles.lockText, { color: theme.primary }]}>Locked</Text>
              </View>
            )}
          </View>
          <Text style={[styles.lessonSubtitle, { color: theme.textSecondary }]}>
            {allLessons.length} Lessons
          </Text>

          {allLessons.length > 0 ? (
            allLessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson._id}
                style={[
                  styles.lessonItem,
                  { backgroundColor: theme.cardBackground },
                  !isEnrolled && styles.lessonItemLocked,
                ]}
                onPress={() => handleLessonPress(lesson, index)}
              >
                <View style={[
                  styles.lessonNumber,
                  { backgroundColor: isEnrolled ? theme.primary : '#D1D5DB' }
                ]}>
                  <Text style={styles.lessonNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.lessonContent}>
                  <Text style={[
                    styles.lessonTitle,
                    { color: theme.text },
                    !isEnrolled && styles.lessonTitleLocked
                  ]} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                  {!isEnrolled && (
                    <View style={styles.lockedLabel}>
                      <Text style={[styles.lockIconSmall, { color: theme.textSecondary }]}>🔒</Text>
                      <Text style={[styles.lockedText, { color: theme.textSecondary }]}>Locked</Text>
                    </View>
                  )}
                </View>
                {isEnrolled && (
                  <Text style={[styles.playIcon, { color: theme.primary }]}>▶</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noLessonsText, { color: theme.textSecondary }]}>
              No lessons available yet
            </Text>
          )}
        </View>

        {/* Enroll Button */}
        {renderEnrollButton()}

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  videoContainer: {
    width: width,
    height: height * 0.3,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  lockText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  learningText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  instructorName: {
    fontSize: 18,
    marginTop: 8,
  },
  lessonSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lessonItemLocked: {
    opacity: 0.6,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lessonContent: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  lessonTitleLocked: {
    fontStyle: 'italic',
  },
  lockedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lockIconSmall: {
    fontSize: 12,
    marginRight: 4,
  },
  lockedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  playIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  noLessonsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  subscribeContainer: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  subscribeLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  actualPrice: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  enrollButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CourseDetailScreen;