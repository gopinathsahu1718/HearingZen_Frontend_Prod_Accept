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

interface SubjectPerformance {
    name: string;
    percentage: number;
    color: string;
}

interface RecentCourse {
    id: string;
    title: string;
    level: string;
    levelColor: string;
    isNew?: boolean;
}

const BASE_URL = 'http://13.200.222.176';
const API_URL = `${BASE_URL}/api/course/public-categories`;

// Dummy data for Performance section
const performanceData: SubjectPerformance[] = [
    { name: 'Mathematics', percentage: 85, color: '#3B82F6' },
    { name: 'Chemistry', percentage: 70, color: '#10B981' },
    { name: 'Physics', percentage: 60, color: '#EF4444' },
];

// Dummy data for Recent Courses
const recentCoursesData: RecentCourse[] = [
    { id: '1', title: 'React Native Dev', level: 'Advanced', levelColor: '#FEE2E2', isNew: true },
    { id: '2', title: 'Machine Learning', level: 'Intermediate', levelColor: '#FEF3C7', isNew: false },
];

const CourseCategoriesScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [categories, setCategories] = useState<CategoryData[]>([]);
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
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories();
    };

    const handleCategoryPress = (categoryData: CategoryData) => {
        navigation.navigate('CourseList', {
            category: categoryData.category,
            courses: categoryData.courses,
        });
    };

    const calculateOverallPerformance = (): number => {
        const total = performanceData.reduce((sum, item) => sum + item.percentage, 0);
        return Math.round(total / performanceData.length);
    };

    const renderPerformanceSection = () => {
        const overallPerformance = calculateOverallPerformance();

        return (
            <View style={[styles.performanceCard, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.performanceHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Weekly test overview
                    </Text>
                    <Text style={[styles.updatedText, { color: theme.primary }]}>Updated</Text>
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

                    <View style={styles.subjectsContainer}>
                        {performanceData.map((subject, index) => (
                            <View key={index} style={styles.subjectRow}>
                                <View style={styles.subjectInfo}>
                                    <View style={[styles.dot, { backgroundColor: subject.color }]} />
                                    <View>
                                        <Text style={[styles.subjectName, { color: theme.text }]}>
                                            {subject.name}
                                        </Text>
                                        <Text style={[styles.subjectPercentage, { color: theme.textSecondary }]}>
                                            {subject.percentage}%
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.progressBarWrapper}>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            { width: `${subject.percentage}%`, backgroundColor: subject.color },
                                        ]}
                                    />
                                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const renderRecentCourses = () => {
        return (
            <View style={styles.recentCoursesSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Courses</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentCoursesScroll}
                >
                    {recentCoursesData.map((course) => (
                        <View
                            key={course.id}
                            style={[styles.recentCourseCard, { backgroundColor: theme.cardBackground }]}
                        >
                            <View style={[styles.courseProgress, { backgroundColor: theme.primary }]} />
                            <Text
                                style={[styles.recentCourseTitle, { color: theme.text }]}
                                numberOfLines={2}
                            >
                                {course.title}
                            </Text>
                            <View style={styles.courseBadgeContainer}>
                                <View style={[styles.levelBadge, { backgroundColor: course.levelColor }]}>
                                    <Text style={[styles.levelText, { color: course.level === 'Advanced' ? '#DC2626' : '#F59E0B' }]}>
                                        {course.level}
                                    </Text>
                                </View>
                                {course.isNew && (
                                    <View style={[styles.newBadge, { backgroundColor: '#10B981' }]}>
                                        <Text style={styles.newText}>NEW</Text>
                                    </View>
                                )}
                            </View>
                        </View>
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
                <Text style={[styles.mainTitle, { color: theme.text }]}>Performance</Text>

                {renderPerformanceSection()}
                {renderRecentCourses()}

                <Text style={[styles.mainTitle, { color: theme.text, marginTop: 10 }]}>
                    Course Categories
                </Text>

                <View style={styles.categoriesContainer}>
                    {categories.map((item) => (
                        <View key={item.category._id}>
                            {renderCategoryCard({ item })}
                        </View>
                    ))}
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
        alignItems: 'center',
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
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '600',
    },
    subjectPercentage: {
        fontSize: 13,
        marginTop: 2,
    },
    progressBarWrapper: {
        height: 8,
        position: 'relative',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        left: 0,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        width: '100%',
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
        padding: 16,
        marginRight: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    courseProgress: {
        height: 4,
        borderRadius: 2,
        marginBottom: 16,
        width: '100%',
    },
    recentCourseTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 12,
        lineHeight: 22,
    },
    courseBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 8,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '600',
    },
    newBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    newText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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