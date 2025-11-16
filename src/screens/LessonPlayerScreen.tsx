// LessonPlayerScreen.tsx - Enhanced with Navigation and Sidebar

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
    Dimensions,
    Modal,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';

type LessonPlayerRouteProp = RouteProp<RootStackParamList, 'LessonPlayer'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Lesson {
    _id: string;
    course_id: string;
    title: string;
    video_url: string;
    order: number;
}

interface Progress {
    _id: string;
    lesson_id: string;
    user_id: string;
    status: 'in_progress' | 'completed';
    completed_at: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface LessonWithProgress extends Lesson {
    progress?: Progress;
}

interface ProgressData {
    totalLessons: number;
    completed: number;
    percentage: string;
    progresses: Progress[];
}

const { width } = Dimensions.get('window');
const BASE_URL = 'https://api.hearingzen.in';

const LessonPlayerScreen = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<LessonPlayerRouteProp>();
    const { lesson, courseId, courseTitle, allLessons, currentIndex } = route.params;

    const [markingComplete, setMarkingComplete] = useState(false);
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [showLessonNav, setShowLessonNav] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState<LessonWithProgress>(lesson);

    useEffect(() => {
        setCurrentLesson(lesson);
        fetchLessonDetails();
        fetchProgress();
        setIsVideoLoading(true); // Ensure loading starts fresh for each lesson
    }, [lesson._id]);

    const fetchLessonDetails = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${BASE_URL}/api/course/lesson/${lesson._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            if (data.success) {
                setCurrentLesson(data.data);
            }
        } catch (error) {
            console.error('Error fetching lesson details:', error);
            // Fallback to passed lesson if fetch fails
        }
    };

    const fetchProgress = async () => {
        if (!token) {
            setLoadingProgress(false);
            return;
        }

        try {
            const response = await fetch(
                `${BASE_URL}/api/course/progress/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            if (data.success) {
                setProgressData(data.data);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoadingProgress(false);
        }
    };

    const isLessonCompleted = (lessonId: string): boolean => {
        if (!progressData) return false;
        return progressData.progresses.some(
            p => p.lesson_id === lessonId && p.status === 'completed'
        );
    };

    const isCurrentLessonCompleted = currentLesson.progress?.status === 'completed' || false;

    const handleMarkComplete = async () => {
        if (isCurrentLessonCompleted) {
            Alert.alert('Already Completed', 'This lesson is already marked as complete');
            return;
        }

        if (!token) {
            Alert.alert('Authentication Required', 'Please login to mark lesson as complete');
            return;
        }

        setMarkingComplete(true);
        try {
            const response = await fetch(`${BASE_URL}/api/course/mark-complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ lessonId: currentLesson._id }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Lesson marked as complete!');
                fetchLessonDetails(); // Refresh current lesson progress
                fetchProgress(); // Refresh overall progress
            } else {
                throw new Error(data.message || 'Failed to mark lesson as complete');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to mark lesson as complete');
        } finally {
            setMarkingComplete(false);
        }
    };

    const handlePreviousLesson = () => {
        if (currentIndex > 0) {
            const prevLesson = allLessons[currentIndex - 1];
            navigation.replace('LessonPlayer', {
                lesson: prevLesson,
                courseId,
                courseTitle,
                allLessons,
                currentIndex: currentIndex - 1,
            });
        }
    };

    const handleNextLesson = () => {
        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            navigation.replace('LessonPlayer', {
                lesson: nextLesson,
                courseId,
                courseTitle,
                allLessons,
                currentIndex: currentIndex + 1,
            });
        }
    };

    const handleLessonSelect = (selectedLesson: Lesson, index: number) => {
        setShowLessonNav(false);
        setIsVideoLoading(true); // Reset loading state when switching lessons
        if (selectedLesson._id !== lesson._id) {
            navigation.replace('LessonPlayer', {
                lesson: selectedLesson,
                courseId,
                courseTitle,
                allLessons,
                currentIndex: index,
            });
        }
    };

    const getYouTubeVideoId = (url: string) => {
        if (!url) {
            console.log('No URL provided');
            return null;
        }

        console.log('Original URL:', url);

        // Try multiple extraction methods

        // Method 1: Extract from youtu.be/ format
        if (url.includes('youtu.be/')) {
            const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
            if (match && match[1]) {
                console.log('Extracted from youtu.be:', match[1]);
                return match[1];
            }
        }

        // Method 2: Extract from youtube.com/watch?v= format
        if (url.includes('youtube.com/watch')) {
            const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            if (match && match[1]) {
                console.log('Extracted from watch?v=:', match[1]);
                return match[1];
            }
        }

        // Method 3: Extract from youtube.com/embed/ format
        if (url.includes('youtube.com/embed/')) {
            const match = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
            if (match && match[1]) {
                console.log('Extracted from embed:', match[1]);
                return match[1];
            }
        }

        // Method 4: Check if it's already just the video ID (11 chars)
        const directMatch = url.match(/^([a-zA-Z0-9_-]{11})$/);
        if (directMatch && directMatch[1]) {
            console.log('Direct video ID:', directMatch[1]);
            return directMatch[1];
        }

        console.log('Could not extract video ID from URL');
        return null;
    };

    const videoId = getYouTubeVideoId(currentLesson.video_url);

    const renderVideoPlayer = () => {
        console.log('Lesson video_url:', currentLesson.video_url);

        if (!videoId) {
            return (
                <View style={[styles.videoContainer, styles.errorContainer]}>
                    <Text style={styles.errorText}>Invalid video URL</Text>
                    <Text style={styles.videoUrl}>URL: {currentLesson.video_url}</Text>
                    <Text style={styles.videoUrl}>
                        Expected format: https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID
                    </Text>
                </View>
            );
        }

        console.log('Embedding video ID:', videoId);

        const youtubeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body { height: 100%; margin: 0; padding: 0; background-color: #000; }
            #player { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="player"></div>
          <script>
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            var player;
            function onYouTubeIframeAPIReady() {
              player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: '${videoId}',
                playerVars: {
                  'playsinline': 1,
                  'rel': 0,
                  'modestbranding': 1
                },
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                }
              });
            }

            function onPlayerReady(event) {
              console.log('YouTube player ready');
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'playerReady' }));
            }

            function onPlayerStateChange(event) {
              console.log('Player state changed:', event.data);
            }
          </script>
        </body>
      </html>
    `;

        return (
            <View style={styles.videoContainer}>
                {isVideoLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading video...</Text>
                    </View>
                )}
                <WebView
                    source={{ html: youtubeHTML }}
                    style={styles.webView}
                    allowsFullscreenVideo
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={true}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                        setIsVideoLoading(false);
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView HTTP error: ', nativeEvent);
                        setIsVideoLoading(false);
                    }}
                    onLoadEnd={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.log('WebView load end:', nativeEvent.url, nativeEvent.loading);
                    }}
                    onMessage={(event) => {
                        try {
                            const data = JSON.parse(event.nativeEvent.data);
                            if (data.type === 'playerReady') {
                                setIsVideoLoading(false);
                            }
                        } catch (e) {
                            console.log('Message parse error:', e);
                        }
                        console.log('WebView message:', event.nativeEvent.data);
                    }}
                />
            </View>
        );
    };

    const renderLessonNavModal = () => (
        <Modal
            visible={showLessonNav}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowLessonNav(false)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowLessonNav(false)}
                />
                <View style={[styles.lessonNavContainer, { backgroundColor: theme.background }]}>
                    <View style={[styles.lessonNavHeader, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.lessonNavTitle, { color: theme.text }]}>
                            Course Lessons
                        </Text>
                        <TouchableOpacity onPress={() => setShowLessonNav(false)}>
                            <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.lessonNavScroll}>
                        {allLessons.map((item, index) => {
                            const completed = isLessonCompleted(item._id);
                            const isCurrent = item._id === lesson._id;
                            return (
                                <TouchableOpacity
                                    key={item._id}
                                    style={[
                                        styles.lessonNavItem,
                                        { backgroundColor: theme.cardBackground },
                                        isCurrent && { borderColor: theme.primary, borderWidth: 2 }
                                    ]}
                                    onPress={() => handleLessonSelect(item, index)}
                                >
                                    <View style={[
                                        styles.lessonNavNumber,
                                        { backgroundColor: completed ? '#10B981' : theme.primary }
                                    ]}>
                                        {completed ? (
                                            <Text style={styles.lessonNavCheckmark}>✓</Text>
                                        ) : (
                                            <Text style={styles.lessonNavNumberText}>{index + 1}</Text>
                                        )}
                                    </View>
                                    <View style={styles.lessonNavInfo}>
                                        <Text style={[styles.lessonNavItemTitle, { color: theme.text }]} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.lessonNavStatus, { color: completed ? '#10B981' : theme.textSecondary }]}>
                                            {completed ? 'Completed' : 'Not Started'}
                                        </Text>
                                    </View>
                                    {isCurrent && (
                                        <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
                                            <Text style={styles.currentBadgeText}>Playing</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar backgroundColor={theme.primary} barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                        {courseTitle}
                    </Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        Lesson {currentIndex + 1} of {allLessons.length}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setShowLessonNav(true)}
                >
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Video Player */}
                {renderVideoPlayer()}

                {/* Navigation Buttons */}
                <View style={styles.navigationContainer}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            { backgroundColor: theme.cardBackground },
                            currentIndex === 0 && styles.navButtonDisabled
                        ]}
                        onPress={handlePreviousLesson}
                        disabled={currentIndex === 0}
                    >
                        <Text style={[styles.navButtonIcon, { color: currentIndex === 0 ? theme.textSecondary : theme.primary }]}>
                            ←
                        </Text>
                        <Text style={[styles.navButtonText, { color: currentIndex === 0 ? theme.textSecondary : theme.text }]}>
                            Previous
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: theme.cardBackground }]}
                        onPress={() => setShowLessonNav(true)}
                    >
                        <Text style={[styles.navButtonIcon, { color: theme.primary }]}>☰</Text>
                        <Text style={[styles.navButtonText, { color: theme.text }]}>Lessons</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            { backgroundColor: theme.cardBackground },
                            currentIndex === allLessons.length - 1 && styles.navButtonDisabled
                        ]}
                        onPress={handleNextLesson}
                        disabled={currentIndex === allLessons.length - 1}
                    >
                        <Text style={[styles.navButtonText, { color: currentIndex === allLessons.length - 1 ? theme.textSecondary : theme.text }]}>
                            Next
                        </Text>
                        <Text style={[styles.navButtonIcon, { color: currentIndex === allLessons.length - 1 ? theme.textSecondary : theme.primary }]}>
                            →
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Lesson Content */}
                <View style={styles.lessonContent}>
                    <Text style={[styles.lessonTitle, { color: theme.text }]}>
                        {currentLesson.title}
                    </Text>

                    {/* Completion Status or Button */}
                    {loadingProgress ? (
                        <View style={[styles.completeButton, { backgroundColor: theme.primary }]}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                    ) : isCurrentLessonCompleted ? (
                        <View style={styles.completedBadge}>
                            <Text style={styles.completedText}>✓ Completed</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.completeButton, { backgroundColor: theme.primary }]}
                            onPress={handleMarkComplete}
                            disabled={markingComplete}
                        >
                            {markingComplete ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.completeButtonText}>Mark as Complete</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Progress Info */}
                    {progressData && (
                        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
                            <Text style={[styles.infoTitle, { color: theme.text }]}>
                                Course Progress
                            </Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                                You've completed {progressData.completed} out of {progressData.totalLessons} lessons ({progressData.percentage}%)
                            </Text>
                            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progressData.percentage}%`, backgroundColor: theme.primary }
                                    ]}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Lesson Navigation Modal */}
            {renderLessonNavModal()}
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
    headerTitleContainer: {
        flex: 1,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 2,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuButton: {
        marginLeft: 15,
        padding: 5,
    },
    menuIcon: {
        color: '#FFFFFF',
        fontSize: 24,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000000',
    },
    webView: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: 16,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    videoUrl: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    navigationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 4,
    },
    navButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    lessonContent: {
        padding: 20,
    },
    lessonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        lineHeight: 32,
    },
    completeButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    completedBadge: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    completedText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    progressFill: {
        height: 8,
        borderRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    lessonNavContainer: {
        height: Dimensions.get('window').height * 0.75,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    lessonNavHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
    },
    lessonNavTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    lessonNavScroll: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    lessonNavItem: {
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
    lessonNavNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    lessonNavNumberText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lessonNavCheckmark: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    lessonNavInfo: {
        flex: 1,
        marginRight: 8,
    },
    lessonNavItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    lessonNavStatus: {
        fontSize: 13,
    },
    currentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    currentBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

export default LessonPlayerScreen;