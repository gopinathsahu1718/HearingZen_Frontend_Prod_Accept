// LessonPlayerScreen.tsx - Fixed with react-native-youtube-iframe and WebView fallback
// Install: npm install react-native-webview (if not already)

import React, { useState, useEffect, useCallback } from 'react';
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
    Linking,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview'; // Added for fallback
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';
import { useTranslation } from 'react-i18next';

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
const BASE_URL = 'http://13.200.222.176';

const LessonPlayerScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { token } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<LessonPlayerRouteProp>();
    const { lesson, courseId, courseTitle, allLessons, currentIndex } = route.params;

    const [markingComplete, setMarkingComplete] = useState(false);
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [showLessonNav, setShowLessonNav] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [playing, setPlaying] = useState(true); // Auto-start
    const [currentLesson, setCurrentLesson] = useState<LessonWithProgress>(lesson);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [useWebViewFallback, setUseWebViewFallback] = useState(false); // New state for fallback

    useEffect(() => {
        setCurrentLesson(lesson);
        setVideoError(null);
        setUseWebViewFallback(false);
        setPlaying(true); // Auto-play on load
        fetchLessonDetails();
        fetchProgress();
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
            Alert.alert(t('lessonPlayer.alreadyCompletedTitle'), t('lessonPlayer.alreadyCompletedMessage'));
            return;
        }

        if (!token) {
            Alert.alert(t('lessonPlayer.authRequiredTitle'), t('lessonPlayer.authRequiredMessage'));
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
                Alert.alert(t('common.success'), t('lessonPlayer.successMessage'));
                fetchLessonDetails();
                fetchProgress();
            } else {
                throw new Error(data.message || 'Failed to mark lesson as complete');
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('lessonPlayer.errorMessage'));
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

    const getYouTubeVideoId = (url: string): string | null => {
        if (!url) return null;

        console.log('Extracting video ID from:', url);

        // Method 1: youtu.be format
        const youtubeShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (youtubeShortMatch) {
            console.log('Extracted from youtu.be:', youtubeShortMatch[1]);
            return youtubeShortMatch[1];
        }

        // Method 2: youtube.com/watch?v= format
        const youtubeWatchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (youtubeWatchMatch) {
            console.log('Extracted from watch?v=:', youtubeWatchMatch[1]);
            return youtubeWatchMatch[1];
        }

        // Method 3: youtube.com/embed/ format
        const youtubeEmbedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
        if (youtubeEmbedMatch) {
            console.log('Extracted from embed:', youtubeEmbedMatch[1]);
            return youtubeEmbedMatch[1];
        }

        // Method 4: Just the video ID (11 characters)
        const directMatch = url.match(/^([a-zA-Z0-9_-]{11})$/);
        if (directMatch) {
            console.log('Direct video ID:', directMatch[1]);
            return directMatch[1];
        }

        console.log('Could not extract video ID');
        return null;
    };

    const videoId = getYouTubeVideoId(currentLesson.video_url);

    const onStateChange = useCallback((state: string) => {
        console.log('YouTube player state:', state);
        if (state === 'ended') {
            setPlaying(false);
        }
    }, []);

    const onError = useCallback((error: string) => {
        console.error('YouTube player error:', error);
        if (error === 'embed_not_allowed') {
            setVideoError(t('lessonPlayer.videoEmbeddingRestricted'));
            setUseWebViewFallback(true); // Switch to WebView fallback
        } else {
            setVideoError(t('lessonPlayer.videoPlaybackError', { error }));
        }
    }, []);

    const handleOpenInYouTube = () => {
        Linking.openURL(currentLesson.video_url).catch((err) =>
            console.error('Error opening URL:', err)
        );
    };

    const renderVideoPlayer = () => {
        if (!videoId) {
            return (
                <View style={[styles.videoContainer, styles.errorContainer]}>
                    <Text style={styles.errorText}>❌ {t('lessonPlayer.invalidVideoUrl')}</Text>
                    <Text style={styles.errorSubtext}>{t('lessonPlayer.url')}: {currentLesson.video_url}</Text>
                    <Text style={styles.errorHelp}>
                        {t('lessonPlayer.expectedFormat')}
                    </Text>
                    <TouchableOpacity
                        style={styles.openButton}
                        onPress={handleOpenInYouTube}
                    >
                        <Text style={styles.openButtonText}>{t('lessonPlayer.openInYouTube')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (videoError && !useWebViewFallback) {
            return (
                <View style={[styles.videoContainer, styles.errorContainer]}>
                    <Text style={styles.errorText}>❌ {videoError}</Text>
                    <TouchableOpacity
                        style={styles.openButton}
                        onPress={handleOpenInYouTube}
                    >
                        <Text style={styles.openButtonText}>{t('lessonPlayer.openInYouTube')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Fallback to full YouTube page in WebView if embed blocked
        if (useWebViewFallback || videoError) {
            return (
                <View style={styles.videoContainer}>
                    <WebView
                        source={{ uri: currentLesson.video_url }}
                        style={styles.fullVideoWebView}
                        allowsFullscreenVideo={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color={theme.primary} />
                            </View>
                        )}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('WebView error:', nativeEvent);
                        }}
                        // Auto-play script for WebView
                        injectedJavaScript={`
                            (function() {
                                setTimeout(() => {
                                    var video = document.querySelector('video');
                                    if (video) {
                                        video.play();
                                    }
                                }, 2000);
                            })();
                            true;
                        `}
                    />
                </View>
            );
        }

        // Normal YouTube Iframe
        return (
            <View style={styles.videoContainer}>
                <YoutubePlayer
                    height={width * (9 / 16)} // 16:9 aspect ratio
                    play={playing}
                    videoId={videoId}
                    onChangeState={onStateChange}
                    onError={onError}
                    webViewStyle={styles.youtubeWebView}
                    webViewProps={{
                        androidLayerType: 'hardware',
                        javaScriptEnabled: true,
                        domStorageEnabled: true,
                        userAgent: 'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36',
                    }}
                    initialPlayerParams={{
                        controls: true,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        fs: 1,
                        disablekb: 0,
                        origin: 'https://www.youtube.com',
                        enablejsapi: 1,
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
                            {t('lessonPlayer.courseLessons')}
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
                                            {completed ? t('lessonPlayer.completed') : t('lessonPlayer.notStarted')}
                                        </Text>
                                    </View>
                                    {isCurrent && (
                                        <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
                                            <Text style={styles.currentBadgeText}>{t('lessonPlayer.playing')}</Text>
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
                        {t('lessonPlayer.lessonNumber', { current: currentIndex + 1, total: allLessons.length })}
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
                            {t('lessonPlayer.previous')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: theme.cardBackground }]}
                        onPress={() => setShowLessonNav(true)}
                    >
                        <Text style={[styles.navButtonIcon, { color: theme.primary }]}>☰</Text>
                        <Text style={[styles.navButtonText, { color: theme.text }]}>{t('lessonPlayer.lessons')}</Text>
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
                            {t('lessonPlayer.next')}
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
                            <Text style={styles.completedText}>✓ {t('lessonPlayer.completed')}</Text>
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
                                <Text style={styles.completeButtonText}>{t('lessonPlayer.markAsComplete')}</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Progress Info */}
                    {progressData && (
                        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
                            <Text style={[styles.infoTitle, { color: theme.text }]}>
                                {t('lessonPlayer.courseProgressTitle')}
                            </Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                                {t('lessonPlayer.progressText', { completed: progressData.completed, total: progressData.totalLessons, percentage: progressData.percentage })}
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
    youtubeWebView: {
        backgroundColor: '#000000',
    },
    fullVideoWebView: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorHelp: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
    openButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    openButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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