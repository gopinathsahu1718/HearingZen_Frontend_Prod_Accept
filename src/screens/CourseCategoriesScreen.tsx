import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface Category {
    _id: string;
    name: string;
    thumbnail_image_url: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface CategoryData {
    category: Category;
    courses: any[];
}

interface ApiResponse {
    success: boolean;
    data: CategoryData[];
}

interface EnrolledCourseProgress {
    _id: string;
    title: string;
    description: string;
    thumbnail_image_url: string;
    author_name: string;
    category: string;
    progress: {
        percentage: number;
        completed: number;
        total: number;
    };
    enrolledAt: string;
}

interface RecentCourse {
    _id: string;
    title: string;
    thumbnail_image_url: string;
    author_name: string;
    category: string;
    enrolledAt: string;
    preview_video_url: string;
    description: string;
    price: number;
    actual_price: number;
    what_you_learn: string[];
}

const BASE_URL = 'https://api.hearingzen.in';
const API_URL = `${BASE_URL}/api/course/public-categories`;
const ENROLLED_PROGRESS_URL = `${BASE_URL}/api/course/enrolled-with-progress`;
const RECENT_COURSES_URL = `${BASE_URL}/api/course/recent-enrolled`;

const CourseCategoriesScreen = () => {
    const { theme } = useTheme();
    const { token, isAuthenticated } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseProgress[]>([]);
    const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL);
            const data: ApiResponse = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchEnrolledCoursesWithProgress = async () => {
        if (!isAuthenticated || !token) {
            setEnrolledCourses([]);
            return;
        }

        try {
            const response = await fetch(ENROLLED_PROGRESS_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setEnrolledCourses(data.data || []);
            } else {
                setEnrolledCourses([]);
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            setEnrolledCourses([]);
        }
    };

    const fetchRecentCourses = async () => {
        if (!isAuthenticated || !token) {
            setRecentCourses([]);
            return;
        }

        try {
            const response = await fetch(RECENT_COURSES_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setRecentCourses(data.data || []);
            } else {
                setRecentCourses([]);
            }
        } catch (error) {
            console.error('Error fetching recent courses:', error);
            setRecentCourses([]);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchCategories(),
            fetchEnrolledCoursesWithProgress(),
            fetchRecentCourses(),
        ]);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchAllData();
    }, [isAuthenticated, token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    const handleCategoryPress = (categoryData: CategoryData) => {
        navigation.navigate('CourseList', {
            category: categoryData.category,
            courses: categoryData.courses,
        });
    };

    const handleEnrolledCoursePress = (courseId: string) => {
        navigation.navigate('EnrolledCourse', { courseId });
    };

    const handleRecentCoursePress = (course: RecentCourse) => {
        // Navigate to CourseDetail with full course data
        const courseData = {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail_image_url: course.thumbnail_image_url,
            preview_video_url: course.preview_video_url,
            author_name: course.author_name,
            price: course.price,
            actual_price: course.actual_price,
            what_you_learn: course.what_you_learn,
            lessons: [], // Will be fetched in CourseDetail if needed
        };
        navigation.navigate('CourseDetail', { course: courseData });
    };

    const calculateOverallPerformance = (): number => {
        if (enrolledCourses.length === 0) return 0;
        const total = enrolledCourses.reduce((sum, course) => sum + course.progress.percentage, 0);
        return Math.round(total / enrolledCourses.length);
    };

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 75) return '#10B981';
        if (percentage >= 50) return '#F59E0B';
        if (percentage >= 25) return '#3B82F6';
        return '#EF4444';
    };

    const renderPerformanceSection = () => {
        if (!isAuthenticated) return null;
        if (enrolledCourses.length === 0) return null;

        const overallPerformance = calculateOverallPerformance();

        return (
            <View style={[styles.performanceCard, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.performanceHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        My Progress
                    </Text>
                    <Text style={[styles.updatedText, { color: theme.primary }]}>
                        {enrolledCourses.length} Course{enrolledCourses.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                <View style={styles.performanceContent}>
                    <View style={styles.circularProgress}>
                        <View style={styles.circleOuter}>
                            <View style={[styles.circleInner, { backgroundColor: theme.cardBackground }]}>
                                <Text style={[styles.percentageText, { color: theme.primary }]}>
                                    {overallPerformance}%
                                </Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.subjectsContainer}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {enrolledCourses.map((course, index) => {
                            const color = getProgressColor(course.progress.percentage);
                            return (
                                <TouchableOpacity
                                    key={course._id}
                                    style={styles.subjectRow}
                                    onPress={() => handleEnrolledCoursePress(course._id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.subjectInfo}>
                                        <View style={[styles.dot, { backgroundColor: color }]} />
                                        <View style={styles.subjectTextContainer}>
                                            <Text
                                                style={[styles.subjectName, { color: theme.text }]}
                                                numberOfLines={1}
                                            >
                                                {course.title}
                                            </Text>
                                            <Text style={[styles.subjectPercentage, { color: theme.textSecondary }]}>
                                                {course.progress.completed}/{course.progress.total} lessons • {course.progress.percentage}%
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.progressBarContainer}>
                                        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                                            <View
                                                style={[
                                                    styles.progressBar,
                                                    { width: `${course.progress.percentage}%`, backgroundColor: color },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderRecentCourses = () => {
        if (!isAuthenticated) return null;
        if (recentCourses.length === 0) return null;

        return (
            <View style={styles.recentCoursesSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Enrolled Courses</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentCoursesScroll}
                >
                    {recentCourses.map((course) => (
                        <TouchableOpacity
                            key={course._id}
                            style={[styles.recentCourseCard, { backgroundColor: theme.cardBackground }]}
                            onPress={() => handleRecentCoursePress(course)}
                            activeOpacity={0.7}
                        >
                            {course.thumbnail_image_url && (
                                <Image
                                    source={{ uri: `${BASE_URL}${course.thumbnail_image_url}` }}
                                    style={styles.recentCourseThumbnail}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.recentCourseContent}>
                                <Text
                                    style={[styles.recentCourseTitle, { color: theme.text }]}
                                    numberOfLines={2}
                                >
                                    {course.title}
                                </Text>
                                <View style={styles.authorContainer}>
                                    <Text style={[styles.authorText, { color: theme.textSecondary }]} numberOfLines={1}>
                                        {course.author_name || 'Unknown Author'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderCategoryCard = ({ item }: { item: CategoryData }) => {
        const imageUrl = `${BASE_URL}${item.category.thumbnail_image_url}`;
        const courseCount = item.courses.length;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.cardBackground }]}
                onPress={() => handleCategoryPress(item)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                />
                <View style={styles.cardContent}>
                    <Text style={[styles.categoryName, { color: theme.text }]}>
                        {item.category.name}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        onPress={() => handleCategoryPress(item)}
                    >
                        <Text style={styles.buttonText}>
                            {courseCount > 0 ? `See more...` : 'Coming Soon'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                backgroundColor={theme.background}
                barStyle={'light-content'}
            />
            <ScrollView
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
                {isAuthenticated && enrolledCourses.length > 0 && (
                    <Text style={[styles.mainTitle, { color: theme.text }]}>Performance</Text>
                )}

                {renderPerformanceSection()}
                {renderRecentCourses()}

                <Text style={[styles.mainTitle, { color: theme.text, marginTop: 10 }]}>
                    Course Categories
                </Text>

                <View style={styles.categoriesContainer}>
                    {categories.length === 0 ? (
                        <Text style={[styles.noCategoriesText, { color: theme.textSecondary }]}>
                            No categories available.
                        </Text>
                    ) : (
                        categories.map((item) => (
                            <View key={item.category._id}>
                                {renderCategoryCard({ item })}
                            </View>
                        ))
                    )}
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
    mainTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    performanceCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    updatedText: {
        fontSize: 14,
        fontWeight: '600',
    },
    performanceContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    circularProgress: {
        marginRight: 30,
    },
    circleOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 10,
        borderColor: '#3B82F6',
        borderLeftColor: 'transparent',
        borderTopColor: 'transparent',
        transform: [{ rotate: '135deg' }],
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-135deg' }],
    },
    percentageText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subjectsContainer: {
        flex: 1,
        maxHeight: 180, // Fixed height for ~3 courses
    },
    subjectRow: {
        marginBottom: 16,
    },
    subjectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
        flexShrink: 0,
    },
    subjectTextContainer: {
        flex: 1,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '600',
    },
    subjectPercentage: {
        fontSize: 12,
        marginTop: 2,
    },
    progressBarContainer: {
        height: 8,
        width: '100%',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    recentCoursesSection: {
        marginTop: 24,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    recentCoursesScroll: {
        paddingRight: 20,
        paddingVertical: 10,
    },
    recentCourseCard: {
        width: width * 0.55,
        minWidth: 200,
        maxWidth: 280,
        borderRadius: 16,
        marginRight: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    recentCourseThumbnail: {
        width: '100%',
        height: 120,
    },
    recentCourseContent: {
        padding: 16,
    },
    recentCourseTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 22,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    noCategoriesText: {
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 20,
        fontStyle: 'italic',
    },
    card: {
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    categoryImage: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 20,
    },
    categoryName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CourseCategoriesScreen;