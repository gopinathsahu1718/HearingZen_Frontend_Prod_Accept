// EnrolledCourseScreen.tsx - Updated with Dynamic Progress

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';

type EnrolledCourseRouteProp = RouteProp<RootStackParamList, 'EnrolledCourse'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Progress {
    _id: string;
    lesson_id: string;
    user_id: string;
    status: 'in_progress' | 'completed';
    completed_at: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Lesson {
    _id: string;
    course_id: string;
    title: string;
    video_url: string;
    order: number;
    createdAt: string;
    updatedAt: string;
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
    lessons: Lesson[];
}

interface ProgressData {
    totalLessons: number;
    completed: number;
    percentage: string;
    progresses: Progress[];
}

const BASE_URL = 'https://api.hearingzen.in';

const EnrolledCourseScreen = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<EnrolledCourseRouteProp>();
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseData();
    }, []);

    const fetchCourseData = async () => {
        try {
            // Fetch course details
            const courseResponse = await fetch(
                `${BASE_URL}/api/course/enrolled-course/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const courseData = await courseResponse.json();

            if (!courseData.success) {
                throw new Error(courseData.message || 'Failed to load course');
            }

            setCourse(courseData.data);

            // Fetch progress data
            const progressResponse = await fetch(
                `${BASE_URL}/api/course/progress/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const progressResult = await progressResponse.json();

            if (progressResult.success) {
                setProgressData(progressResult.data);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
            Alert.alert('Error', 'Failed to load course', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonPress = (lesson: Lesson, index: number) => {
        navigation.navigate('LessonPlayer', {
            lesson,
            courseId,
            courseTitle: course!.title,
            allLessons: course!.lessons,
            currentIndex: index,
        });
    };

    const isLessonCompleted = (lessonId: string): boolean => {
        if (!progressData) return false;
        return progressData.progresses.some(
            p => p.lesson_id === lessonId && p.status === 'completed'
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!course) {
        return null;
    }

    const progressPercentage = progressData ? parseFloat(progressData.percentage) : 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {course.title}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Course Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.courseTitle, { color: theme.text }]}>
                        {course.title}
                    </Text>
                    <Text style={[styles.authorName, { color: theme.textSecondary }]}>
                        by {course.author_name}
                    </Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {course.lessons.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Lessons
                            </Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>
                                {Math.round(progressPercentage)}%
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Complete
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progressPercentage}%`, backgroundColor: theme.primary },
                            ]}
                        />
                    </View>
                </View>

                {/* Lessons Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Course Lessons
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                        {progressData?.completed || 0} of {course.lessons.length} completed
                    </Text>

                    {course.lessons.map((lesson, index) => {
                        const isCompleted = isLessonCompleted(lesson._id);
                        return (
                            <TouchableOpacity
                                key={lesson._id}
                                style={[styles.lessonCard, { backgroundColor: theme.cardBackground }]}
                                onPress={() => handleLessonPress(lesson, index)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.lessonNumber,
                                    { backgroundColor: isCompleted ? '#10B981' : theme.primary }
                                ]}>
                                    {isCompleted ? (
                                        <Text style={styles.checkmark}>✓</Text>
                                    ) : (
                                        <Text style={styles.lessonNumberText}>{index + 1}</Text>
                                    )}
                                </View>
                                <View style={styles.lessonInfo}>
                                    <Text style={[styles.lessonTitle, { color: theme.text }]} numberOfLines={2}>
                                        {lesson.title}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.lessonStatus,
                                            { color: isCompleted ? '#10B981' : theme.textSecondary }
                                        ]}
                                    >
                                        {isCompleted ? 'Completed' : 'Not Started'}
                                    </Text>
                                </View>
                                <Text style={[styles.playIcon, { color: theme.primary }]}>▶</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    scrollContent: {
        padding: 20,
    },
    infoCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    courseTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 28,
    },
    authorName: {
        fontSize: 15,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
    },
    progressFill: {
        height: 10,
        borderRadius: 5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 15,
        marginBottom: 16,
    },
    lessonCard: {
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
    lessonNumber: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    lessonNumberText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    lessonInfo: {
        flex: 1,
        marginRight: 12,
    },
    lessonTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 22,
    },
    lessonStatus: {
        fontSize: 14,
    },
    playIcon: {
        fontSize: 20,
    },
});

export default EnrolledCourseScreen;