// Final CourseDetailScreen.tsx - Fixed auto-navigation issue

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
  AppState,
} from 'react-native';
import Video from 'react-native-video';
import RazorpayCheckout from "react-native-razorpay";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';
import { useTranslation } from 'react-i18next';

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  video_url: string;
  order: number;
}

interface PendingPayment {
  orderId: string;
  courseId: string;
  timestamp: number;
  retryCount: number;
}

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://api.hearingzen.in';
const PENDING_PAYMENT_KEY = '@pending_payments';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

const CourseDetailScreen = () => {
  const { t } = useTranslation();
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
  const [checkingPendingPayment, setCheckingPendingPayment] = useState(false);
  const [hasShownEnrollmentAlert, setHasShownEnrollmentAlert] = useState(false);
  const hasCheckedPendingRef = useRef(false);

  const videoUrl = `${BASE_URL}${course.preview_video_url}`;

  // Check for pending payments on mount and when app comes to foreground
  useEffect(() => {
    checkEnrollmentStatus();
    if (course.lessons && course.lessons.length > 0) {
      setAllLessons(course.lessons as Lesson[]);
    }

    // Check for pending payments for THIS course only - ONLY ONCE on mount
    if (!hasCheckedPendingRef.current) {
      checkPendingPaymentsForCourse();
      hasCheckedPendingRef.current = true;
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Also check when screen comes into focus - BUT NOT for pending payments
  useFocusEffect(
    React.useCallback(() => {
      // Only check enrollment status, NOT pending payments
      checkEnrollmentStatus();
    }, [])
  );

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      // App came to foreground - only check if we haven't checked before
      if (!hasCheckedPendingRef.current) {
        checkPendingPaymentsForCourse();
        hasCheckedPendingRef.current = true;
      }
      checkEnrollmentStatus();
    }
  };

  const savePendingPayment = async (orderId: string, courseId: string) => {
    try {
      const existingPayments = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
      const payments: PendingPayment[] = existingPayments ? JSON.parse(existingPayments) : [];

      // Check if this payment already exists
      const existingIndex = payments.findIndex(p => p.orderId === orderId);
      if (existingIndex >= 0) {
        // Update existing
        payments[existingIndex] = {
          orderId,
          courseId,
          timestamp: Date.now(),
          retryCount: 0,
        };
      } else {
        // Add new pending payment
        payments.push({
          orderId,
          courseId,
          timestamp: Date.now(),
          retryCount: 0,
        });
      }

      await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payments));
      console.log('Saved pending payment:', orderId);
    } catch (error) {
      console.error('Error saving pending payment:', error);
    }
  };

  const removePendingPayment = async (orderId: string) => {
    try {
      const existingPayments = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
      if (existingPayments) {
        const payments: PendingPayment[] = JSON.parse(existingPayments);
        const filtered = payments.filter(p => p.orderId !== orderId);
        await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(filtered));
        console.log('Removed pending payment:', orderId);
      }
    } catch (error) {
      console.error('Error removing pending payment:', error);
    }
  };

  const checkPaymentStatus = async (orderId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/webhook/payment-status/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.status === 'active') {
        console.log('Payment verified, enrollment active');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  };

  const checkPendingPaymentsForCourse = async () => {
    if (!token) return;

    // Prevent multiple checks
    if (hasShownEnrollmentAlert) {
      console.log('Already showed alert, skipping pending payment check');
      return;
    }

    try {
      setCheckingPendingPayment(true);
      const existingPayments = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);

      if (!existingPayments) {
        setCheckingPendingPayment(false);
        return;
      }

      const payments: PendingPayment[] = JSON.parse(existingPayments);
      const now = Date.now();

      // Filter out payments older than 24 hours
      const recentPayments = payments.filter(
        p => now - p.timestamp < 24 * 60 * 60 * 1000
      );

      // Check pending payments ONLY for THIS course
      const coursePayments = recentPayments.filter(p => p.courseId === course._id);

      if (coursePayments.length > 0) {
        console.log(`Found ${coursePayments.length} pending payments for this course`);

        for (const payment of coursePayments) {
          const isVerified = await checkPaymentStatus(payment.orderId);

          if (isVerified) {
            // Payment verified, remove from pending
            await removePendingPayment(payment.orderId);
            setIsEnrolled(true);
            setHasShownEnrollmentAlert(true);

            // Show alert only once
            Alert.alert(
              t('courses.enrollmentSuccessfulTitle'),
              t('courses.enrollmentSuccessfulMessage'),
              [
                {
                  text: t('common.ok'),
                  onPress: () => {
                    // Just dismiss - user stays on screen
                  },
                },
              ]
            );
            break; // Stop checking after first verified payment
          } else if (payment.retryCount < MAX_RETRY_ATTEMPTS) {
            // Retry verification silently in background
            payment.retryCount++;
            await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(recentPayments));
          }
        }
      }

      // Update storage with filtered payments
      await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(recentPayments));
    } catch (error) {
      console.error('Error checking pending payments:', error);
    } finally {
      setCheckingPendingPayment(false);
    }
  };

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
        t('courses.authRequiredTitle'),
        t('courses.authRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.login'),
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

      // Handle free courses
      if (orderData.enrollment_id) {
        Alert.alert(t('common.success'), t('courses.freeEnrollmentMessage'), [
          {
            text: t('common.ok'),
            onPress: () => {
              setIsEnrolled(true);
              navigation.navigate('MyEnrollments');
            },
          },
        ]);
        setEnrolling(false);
        return;
      }

      // Save pending payment before opening Razorpay
      await savePendingPayment(orderData.order.id, course._id);

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
          console.log('Payment error:', error);
          setEnrolling(false);

          if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
            // User cancelled, remove pending payment
            removePendingPayment(orderData.order.id);
          } else {
            // Payment might have succeeded but verification failed
            Alert.alert(
              t('courses.paymentProcessingTitle'),
              t('courses.paymentProcessingMessage'),
              [
                {
                  text: t('common.ok'),
                  onPress: () => checkPendingPaymentsForCourse(),
                },
              ]
            );
          }
        });
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('courses.enrollError'));
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
        // Remove from pending payments
        await removePendingPayment(orderId);

        // Set enrolled state and flag
        setIsEnrolled(true);
        setHasShownEnrollmentAlert(true);

        Alert.alert(t('courses.enrollmentSuccessfulTitle'), t('courses.enrollmentSuccessMessage'), [
          {
            text: t('common.ok'),
            onPress: () => {
              // User stays on screen to view details
            },
          },
        ]);
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);

      // Don't remove pending payment - let webhook handle it
      Alert.alert(
        t('courses.verificationPendingTitle'),
        t('courses.verificationPendingMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Schedule a check after a few seconds
              setTimeout(() => checkPendingPaymentsForCourse(), 3000);
            },
          },
        ]
      );
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
        t('courses.enrollmentRequiredTitle'),
        t('courses.enrollmentRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('courses.enrollNow'),
            onPress: handleEnrollPress,
          },
        ]
      );
      return;
    }

    navigation.navigate('LessonPlayer', {
      lesson,
      courseId: course._id,
      courseTitle: course.title,
      allLessons: allLessons,
      currentIndex: index,
    });
  };

  const renderEnrollButton = () => {
    if (checkingEnrollment || checkingPendingPayment) {
      return (
        <View style={[styles.subscribeContainer, { backgroundColor: theme.primary }]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={[styles.subscribeLabel, { marginTop: 10, color: '#FFFFFF' }]}>
            {checkingPendingPayment ? t('courses.checkingPayment') : t('courses.checkingStatus')}
          </Text>
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View style={[styles.subscribeContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.subscribeLabel}>{t('courses.loginToEnroll')}</Text>
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollPress}>
            <Text style={styles.enrollButtonText}>{t('common.login')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isEnrolled) {
      return (
        <View style={[styles.subscribeContainer, { backgroundColor: '#10B981' }]}>
          <Text style={styles.subscribeLabel}>✓ {t('courses.enrolled')}</Text>
          <Text style={styles.enrolledMessage}>
            {t('courses.enrolledMessage')}
          </Text>
          <TouchableOpacity style={styles.enrollButton} onPress={handleGoToCourse}>
            <Text style={styles.enrollButtonText}>{t('courses.goToCourse')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.subscribeContainer, { backgroundColor: theme.primary }]}>
        <Text style={styles.subscribeLabel}>{t('courses.subscribe')}</Text>
        <Text style={styles.priceText}>
          ₹ {course.price === 0 ? t('courses.free') : course.price}
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
              {course.price === 0 ? t('courses.enrollFree') : t('courses.enrollNow')}
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
          {isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledBadgeText}>✓ {t('courses.enrolled')}</Text>
            </View>
          )}
        </View>

        {/* Course Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('courses.descriptionTitle')}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {course.description}
          </Text>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('courses.whatYouLearnTitle')}
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
            {t('courses.instructorTitle')}
          </Text>
          <Text style={[styles.instructorName, { color: theme.text }]}>
            {course.author_name}
          </Text>
        </View>

        {/* Course Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('courses.contentTitle')}
            </Text>
            {!isEnrolled && (
              <View style={[styles.lockBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.lockIcon, { color: theme.primary }]}>🔒</Text>
                <Text style={[styles.lockText, { color: theme.primary }]}>{t('courses.locked')}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.lessonSubtitle, { color: theme.textSecondary }]}>
            {t('courses.lessonsCount', { count: allLessons.length })}
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
                      <Text style={[styles.lockedText, { color: theme.textSecondary }]}>{t('courses.locked')}</Text>
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
              {t('courses.noLessons')}
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
  enrolledBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  enrolledBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  enrolledMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
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