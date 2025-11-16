// MyEnrollmentsScreen.tsx - Updated with Dynamic Progress

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';

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

interface Enrollment {
    _id: string;
    user_id: string;
    course_id: Course;
    start_date: string;
    status: string;
    order_id?: string;
    payment_id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
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

const BASE_URL = 'https://api.hearingzen.in';

const MyEnrollmentsScreen = () => {
    const { theme } = useTheme();
    const { token, isAuthenticated } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [progressMap, setProgressMap] = useState<Map<string, ProgressData>>(new Map());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (isAuthenticated && token) {
                fetchEnrollments();
            } else {
                setLoading(false);
            }
        }, [isAuthenticated, token])
    );

    const fetchEnrollments = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/course/my-enrollments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setEnrollments(data.data);
                // Fetch progress for each enrollment
                await fetchAllProgress(data.data);
            } else {
                Alert.alert('Error', data.message || 'Failed to load enrollments');
            }
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            Alert.alert('Error', 'Failed to load enrollments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAllProgress = async (enrollmentsList: Enrollment[]) => {
        const newProgressMap = new Map<string, ProgressData>();

        await Promise.all(
            enrollmentsList.map(async (enrollment) => {
                try {
                    const response = await fetch(
                        `${BASE_URL}/api/course/progress/${enrollment.course_id._id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        }
                    );
                    const progressData = await response.json();
                    if (progressData.success) {
                        newProgressMap.set(enrollment.course_id._id, progressData.data);
                    }
                } catch (error) {
                    console.error(`Error fetching progress for course ${enrollment.course_id._id}:`, error);
                }
            })
        );

        setProgressMap(newProgressMap);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEnrollments();
    };

    const handleCoursePress = (courseId: string) => {
        navigation.navigate('EnrolledCourse', { courseId });
    };

    const handleBrowseCourses = () => {
        navigation.navigate('CourseCategories');
    };

    const renderEnrollmentCard = (enrollment: Enrollment) => {
        const course = enrollment.course_id;
        const lessonCount = course.lessons?.length || 0;
        const progress = progressMap.get(course._id);
        const progressPercentage = progress ? parseFloat(progress.percentage) : 0;

        const getStatusColor = (status: string) => {
            switch (status.toLowerCase()) {
                case 'active':
                    return '#10B981';
                case 'completed':
                    return '#3B82F6';
                case 'pending':
                    return '#F59E0B';
                default:
                    return '#6B7280';
            }
        };

        return (
            <TouchableOpacity
                key={enrollment._id}
                style={[styles.enrollmentCard, { backgroundColor: theme.cardBackground }]}
                onPress={() => handleCoursePress(course._id)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(enrollment.status) }]}>
                        <Text style={styles.statusText}>{enrollment.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[styles.enrollmentTitle, { color: theme.text }]} numberOfLines={2}>
                    {course.title}
                </Text>
                <Text style={[styles.enrollmentMeta, { color: theme.textSecondary }]}>
                    {lessonCount} Lesson{lessonCount !== 1 ? 's' : ''} • {course.author_name}
                </Text>
                <Text style={[styles.enrollmentDate, { color: theme.textSecondary }]}>
                    Enrolled: {new Date(enrollment.start_date).toLocaleDateString()}
                </Text>

                {progress && (
                    <>
                        <View style={styles.progressStats}>
                            <Text style={[styles.progressStatsText, { color: theme.textSecondary }]}>
                                {progress.completed} of {progress.totalLessons} lessons completed
                            </Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progressPercentage}%`, backgroundColor: theme.primary },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressText, { color: theme.primary }]}>
                                {Math.round(progressPercentage)}% Complete
                            </Text>
                        </View>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    if (!isAuthenticated) {
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
                    <Text style={styles.headerTitle}>My Enrollments</Text>
                </View>
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.text }]}>
                        Please login to view your enrollments
                    </Text>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.actionButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <StatusBar backgroundColor={theme.primary} barStyle="light-content" />
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>My Enrollments</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
            >
                {enrollments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: theme.text }]}>
                            No enrollments yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                            Start learning by enrolling in courses
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                            onPress={handleBrowseCourses}
                        >
                            <Text style={styles.actionButtonText}>Browse Courses</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={[styles.summaryTitle, { color: theme.text }]}>
                                Your Learning Journey
                            </Text>
                            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                                {enrollments.length} Course{enrollments.length !== 1 ? 's' : ''} Enrolled
                            </Text>
                        </View>
                        {enrollments.map(renderEnrollmentCard)}
                    </>
                )}
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
    summaryCard: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    summaryText: {
        fontSize: 15,
    },
    enrollmentCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    enrollmentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 26,
    },
    enrollmentMeta: {
        fontSize: 14,
        marginBottom: 4,
    },
    enrollmentDate: {
        fontSize: 13,
        marginBottom: 12,
    },
    progressStats: {
        marginBottom: 8,
    },
    progressStatsText: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 15,
        marginBottom: 24,
        textAlign: 'center',
    },
    actionButton: {
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 30,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyEnrollmentsScreen;