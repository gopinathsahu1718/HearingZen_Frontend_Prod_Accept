// screens/StepsScreen.tsx - RESPONSIVE VERSION
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Share,
    ActivityIndicator,
    Linking,
    Alert,
    Modal,
    AppState,
    Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useFitness } from '../contexts/FitnessContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import BMICards from './StepScreen/BMICards';

// Responsive dimension utilities
const getResponsiveDimensions = () => {
    const { width, height } = Dimensions.get('window');
    const isSmallDevice = width < 375;
    const isMediumDevice = width >= 375 && width < 414;
    const isLargeDevice = width >= 414;
    const isTablet = width >= 768;

    return {
        width,
        height,
        isSmallDevice,
        isMediumDevice,
        isLargeDevice,
        isTablet,
        // Responsive sizes
        BOX_SIZE: isTablet ? width * 0.18 : width * 0.22,
        SIZE: isTablet ? width * 0.35 : isSmallDevice ? width * 0.55 : width * 0.5,
        PADDING: isTablet ? 24 : 16,
        ICON_SIZE: isSmallDevice ? 20 : isTablet ? 28 : 24,
        FONT_LARGE: isSmallDevice ? 24 : isTablet ? 32 : 26,
        FONT_MEDIUM: isSmallDevice ? 14 : isTablet ? 20 : 16,
        FONT_SMALL: isSmallDevice ? 11 : isTablet ? 15 : 13,
    };
};

const dims = getResponsiveDimensions();
const { BOX_SIZE, SIZE } = dims;
const STROKE_WIDTH = SIZE * 0.06;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ============ GOOGLE FIT LINKING SCREEN ============
const GoogleFitLinkingScreen: React.FC<{ onLink: () => void }> = ({
    onLink,
}) => {
    const { theme } = useTheme();
    const { linkGoogle } = useFitness();
    const [isLinking, setIsLinking] = useState(false);
    const [isLinkingInProgress, setIsLinkingInProgress] = useState(false);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active' && isLinkingInProgress) {
                setIsLinkingInProgress(false);
                onLink();
            }
        });

        return () => {
            subscription?.remove();
        };
    }, [isLinkingInProgress, onLink]);

    const handleLinkGoogleFit = async () => {
        setIsLinking(true);
        try {
            const linkUrl = await linkGoogle();
            if (linkUrl) {
                const canOpen = await Linking.canOpenURL(linkUrl);
                if (canOpen) {
                    await Linking.openURL(linkUrl);
                    setIsLinkingInProgress(true);
                    Alert.alert(
                        'Link Google Fit',
                        'Please complete the linking process in your browser. The app will automatically refresh when you return.',
                        [
                            {
                                text: 'OK',
                                style: 'default',
                            },
                        ],
                    );
                } else {
                    Alert.alert('Error', 'Cannot open linking URL');
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to link Google Fit');
        } finally {
            setIsLinking(false);
        }
    };

    const iconSize = dims.isTablet ? 120 : dims.isSmallDevice ? 80 : 100;

    if (isLinkingInProgress) {
        return (
            <View
                style={[styles.linkingContainer, { backgroundColor: theme.background }]}
            >
                <Image
                    source={require('../assets/stepIcons/footprint.png')}
                    style={[
                        styles.linkingIcon,
                        { tintColor: theme.primary, width: iconSize, height: iconSize },
                    ]}
                />
                <Text
                    style={[
                        styles.linkingTitle,
                        { color: theme.text, fontSize: dims.FONT_LARGE },
                    ]}
                >
                    Linking in Progress
                </Text>
                <Text
                    style={[
                        styles.linkingDescription,
                        { color: theme.textSecondary, fontSize: dims.FONT_MEDIUM },
                    ]}
                >
                    Complete the process in your browser and return to the app. It will
                    automatically check the connection.
                </Text>
                <ActivityIndicator
                    size="large"
                    color={theme.primary}
                    style={{ marginTop: 20 }}
                />
                <TouchableOpacity
                    style={[
                        styles.linkButton,
                        { backgroundColor: theme.primary, marginTop: 20 },
                    ]}
                    onPress={() => {
                        setIsLinkingInProgress(false);
                        onLink();
                    }}
                >
                    <Text style={[styles.linkButtonText, { fontSize: dims.FONT_MEDIUM }]}>
                        Check Connection Now
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View
            style={[styles.linkingContainer, { backgroundColor: theme.background }]}
        >
            <Image
                source={require('../assets/stepIcons/footprint.png')}
                style={[
                    styles.linkingIcon,
                    { tintColor: theme.primary, width: iconSize, height: iconSize },
                ]}
            />
            <Text
                style={[
                    styles.linkingTitle,
                    { color: theme.text, fontSize: dims.FONT_LARGE },
                ]}
            >
                Connect Google Fit
            </Text>
            <Text
                style={[
                    styles.linkingDescription,
                    { color: theme.textSecondary, fontSize: dims.FONT_MEDIUM },
                ]}
            >
                Link your Google Fit account to track your daily steps, calories, and
                activity data.
            </Text>

            <View
                style={[
                    styles.infoBox,
                    { backgroundColor: theme.cardBackground, borderColor: theme.border },
                ]}
            >
                <Text
                    style={[
                        styles.infoTitle,
                        { color: theme.text, fontSize: dims.FONT_MEDIUM },
                    ]}
                >
                    📱 What You'll Get:
                </Text>
                <Text
                    style={[
                        styles.infoItem,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    • Daily step count
                </Text>
                <Text
                    style={[
                        styles.infoItem,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    • Distance traveled
                </Text>
                <Text
                    style={[
                        styles.infoItem,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    • Calories burned
                </Text>
                <Text
                    style={[
                        styles.infoItem,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    • Active time tracking
                </Text>
                <Text
                    style={[
                        styles.infoItem,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    • Weekly & monthly reports
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: theme.primary }]}
                onPress={handleLinkGoogleFit}
                disabled={isLinking}
            >
                {isLinking ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Image
                            source={require('../assets/icons/google.png')}
                            style={[
                                styles.googleIcon,
                                { width: dims.ICON_SIZE, height: dims.ICON_SIZE },
                            ]}
                        />
                        <Text
                            style={[styles.linkButtonText, { fontSize: dims.FONT_MEDIUM }]}
                        >
                            Link Google Fit
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            <Text
                style={[
                    styles.privacyNote,
                    { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                ]}
            >
                🔒 Your data is secure and private
            </Text>
        </View>
    );
};

// ============ HEADER COMPONENT ============
const Header: React.FC<{
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onSettings?: () => void;
}> = ({ onRefresh, isRefreshing = false, onSettings }) => {
    const { theme } = useTheme();
    const { quickData } = useFitness();

    const handleShare = async () => {
        try {
            const steps = quickData?.steps || 0;
            await Share.share({
                message: `I walked ${steps.toLocaleString()} steps today! 💪 #StepCounter #HearingZen`,
            });
        } catch (error) {
            console.error('Share Error:', error);
        }
    };

    return (
        <View
            style={[
                styles.headerWrapper,
                { backgroundColor: theme.background, paddingHorizontal: dims.PADDING },
            ]}
        >
            <TouchableOpacity
                onPress={onRefresh}
                style={styles.leftButton}
                disabled={isRefreshing}
            >
                {isRefreshing ? (
                    <ActivityIndicator size="small" color={theme.iconTint} />
                ) : (
                    <Image
                        source={require('../assets/images/refresh.png')}
                        style={[
                            styles.headerIcon,
                            {
                                tintColor: theme.iconTint,
                                width: dims.ICON_SIZE,
                                height: dims.ICON_SIZE,
                            },
                        ]}
                        resizeMode="contain"
                    />
                )}
            </TouchableOpacity>

            <View style={styles.headerRight}>
                <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                    <Image
                        source={require('../assets/stepIcons/share.png')}
                        style={[
                            styles.headerIcon,
                            {
                                tintColor: theme.iconTint,
                                width: dims.ICON_SIZE,
                                height: dims.ICON_SIZE,
                            },
                        ]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {onSettings && (
                    <TouchableOpacity onPress={onSettings} style={styles.headerButton}>
                        <Image
                            source={require('../assets/icons/settings.png')}
                            style={[
                                styles.headerIcon,
                                {
                                    tintColor: theme.iconTint,
                                    width: dims.ICON_SIZE,
                                    height: dims.ICON_SIZE,
                                },
                            ]}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// ============ STEP CIRCLE COMPONENT ============
const StepCircle: React.FC = () => {
    const { theme } = useTheme();
    const { quickData, isLoadingQuick } = useFitness();

    if (isLoadingQuick && !quickData) {
        return (
            <View style={styles.circleContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text
                    style={[
                        styles.loadingText,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    Loading steps...
                </Text>
            </View>
        );
    }

    const steps = quickData?.steps || 0;
    const goal = quickData?.goal || 10000;
    const progress = Math.min(steps / goal, 1);
    const strokeDashoffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;
    const progressColor = steps >= goal ? '#00FF7F' : '#00BFFF';

    return (
        <View style={styles.circleContainer}>
            <View style={styles.shadowWrapper}>
                <View
                    style={[
                        styles.shadowCircle,
                        {
                            width: SIZE + 25,
                            height: SIZE + 25,
                            borderRadius: (SIZE + 25) / 2,
                            shadowColor: theme.primary,
                        },
                    ]}
                />
            </View>

            <Svg width={SIZE} height={SIZE}>
                <Circle
                    stroke={theme.border || '#1e1e2d'}
                    fill="none"
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                />
                <Circle
                    stroke={progressColor}
                    fill="none"
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
            </Svg>

            <View style={styles.centerContent}>
                <Image
                    source={require('../assets/stepIcons/footprint.png')}
                    style={[
                        styles.footprintIcon,
                        { width: SIZE * 0.25, height: SIZE * 0.25 },
                    ]}
                />
                <Text
                    style={[styles.steps, { fontSize: SIZE * 0.14, color: theme.text }]}
                >
                    {steps.toLocaleString()}
                </Text>
                <Text
                    style={[
                        styles.goal,
                        { fontSize: SIZE * 0.07, color: theme.textSecondary },
                    ]}
                >
                    Goal: {goal.toLocaleString()}
                </Text>
                {steps >= goal && (
                    <Text
                        style={[
                            styles.goalAchieved,
                            { fontSize: SIZE * 0.06, color: '#00FF7F' },
                        ]}
                    >
                        🎉 Goal Achieved!
                    </Text>
                )}
            </View>
        </View>
    );
};

// ============ STATS PANEL COMPONENT ============
const StatsPanel: React.FC = () => {
    const { theme, isDarkMode } = useTheme();
    const { statsData, quickData, isLoadingStats } = useFitness();

    if (isLoadingStats && !statsData) {
        return (
            <View
                style={[styles.statsContainer, { paddingHorizontal: dims.PADDING }]}
            >
                <ActivityIndicator size="small" color={theme.primary} />
            </View>
        );
    }

    const distance = statsData?.distance.value || 0;
    const calories = statsData?.calories.value || 0;
    const activeMins = statsData?.activeTime.value || 0;
    const percentage = quickData?.percentage || 0;

    const stats = [
        {
            label: 'Distance',
            value: `${distance.toFixed(1)} km`,
            icon: require('../assets/stepIcons/distance.png'),
            bg: theme.cardBackground,
        },
        {
            label: 'Calories',
            value: `${Math.round(calories)}`,
            icon: require('../assets/stepIcons/calories.png'),
            bg: theme.cardBackground,
        },
        {
            label: 'Active',
            value: `${activeMins} min`,
            icon: require('../assets/stepIcons/time.png'),
            bg: theme.cardBackground,
        },
        {
            label: 'Progress',
            value: `${percentage}%`,
            icon: require('../assets/stepIcons/footprint.png'),
            bg: theme.cardBackground,
        },
    ];

    const statIconSize = dims.isTablet ? 28 : dims.isSmallDevice ? 20 : 24;

    return (
        <View style={[styles.statsContainer, { paddingHorizontal: dims.PADDING }]}>
            {stats.map((stat, index) => (
                <View
                    key={index}
                    style={[
                        styles.statBox,
                        { backgroundColor: stat.bg, flexBasis: BOX_SIZE },
                    ]}
                >
                    <View
                        style={[
                            styles.iconWrapper,
                            { backgroundColor: isDarkMode ? '#101012ff' : '#f0f0f0' },
                        ]}
                    >
                        <Image
                            source={stat.icon}
                            style={[
                                styles.statIcon,
                                {
                                    tintColor: '#00BFFF',
                                    width: statIconSize,
                                    height: statIconSize,
                                },
                            ]}
                            resizeMode="contain"
                        />
                    </View>
                    <Text
                        style={[
                            styles.statValue,
                            { color: theme.text, fontSize: dims.FONT_MEDIUM },
                        ]}
                    >
                        {stat.value}
                    </Text>
                    <Text
                        style={[
                            styles.statLabel,
                            { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                        ]}
                    >
                        {stat.label}
                    </Text>
                </View>
            ))}
        </View>
    );
};

// ============ STEPS CHART COMPONENT ============
const StepsChart: React.FC = () => {
    const { theme } = useTheme();
    const { chartData, isLoadingChart, selectedPeriod, setSelectedPeriod } =
        useFitness();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const periodOptions: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];

    const formatPeriodDisplay = (period: string) => {
        return period.charAt(0).toUpperCase() + period.slice(1);
    };

    if (isLoadingChart && !chartData) {
        return (
            <View
                style={[
                    styles.chartCard,
                    {
                        backgroundColor: theme.cardBackground,
                        padding: dims.PADDING,
                        marginHorizontal: dims.PADDING,
                    },
                ]}
            >
                <ActivityIndicator size="large" color={theme.primary} />
                <Text
                    style={[
                        styles.loadingText,
                        { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                    ]}
                >
                    Loading chart...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.chartCard,
                {
                    backgroundColor: theme.cardBackground,
                    marginHorizontal: dims.PADDING,
                    padding: dims.PADDING,
                },
            ]}
        >
            <View style={styles.chartHeaderRow}>
                <Text
                    style={[
                        styles.chartTitle,
                        { color: theme.text, fontSize: dims.isTablet ? 22 : 18 },
                    ]}
                >
                    Activity Report
                </Text>
                <TouchableOpacity
                    style={[
                        styles.periodBtn,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                    <Text
                        style={[
                            styles.periodText,
                            { color: theme.text, fontSize: dims.FONT_SMALL },
                        ]}
                    >
                        {formatPeriodDisplay(selectedPeriod)}
                    </Text>
                    <Text
                        style={[
                            styles.periodArrow,
                            { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                        ]}
                    >
                        ▾
                    </Text>
                </TouchableOpacity>
            </View>

            {dropdownOpen && (
                <Modal
                    transparent
                    visible={dropdownOpen}
                    onRequestClose={() => setDropdownOpen(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setDropdownOpen(false)}
                    >
                        <View
                            style={[
                                styles.dropdownCard,
                                {
                                    backgroundColor: theme.cardBackground,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            {periodOptions.map(option => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.dropdownItem,
                                        selectedPeriod === option && {
                                            backgroundColor: theme.surface,
                                        },
                                    ]}
                                    onPress={() => {
                                        setSelectedPeriod(option);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            { color: theme.text, fontSize: dims.FONT_SMALL },
                                        ]}
                                    >
                                        {formatPeriodDisplay(option)}
                                    </Text>
                                    {selectedPeriod === option && (
                                        <Text style={{ color: theme.primary }}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {!isLoadingChart && chartData && chartData.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chartContent}>
                        {chartData.map((point, index) => {
                            const maxSteps = Math.max(...chartData.map(p => p.steps));
                            const barHeight =
                                maxSteps > 0
                                    ? Math.max(
                                        20,
                                        (point.steps / maxSteps) * (dims.isTablet ? 200 : 150),
                                    )
                                    : 20;
                            const label =
                                point.dayShort ||
                                point.label ||
                                point.date?.substring(5) ||
                                `${index + 1}`;
                            const barWidth = dims.isTablet
                                ? 48
                                : dims.isSmallDevice
                                    ? 30
                                    : 36;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.chartBar,
                                        { minWidth: dims.isTablet ? 60 : 45 },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                width: barWidth,
                                                backgroundColor: point.goalAchieved
                                                    ? '#00FF7F'
                                                    : theme.primary,
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.barLabel,
                                            {
                                                color: theme.textSecondary,
                                                fontSize: dims.isTablet ? 13 : 11,
                                            },
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.barValue,
                                            { color: theme.text, fontSize: dims.isTablet ? 12 : 10 },
                                        ]}
                                    >
                                        {point.steps > 999
                                            ? `${(point.steps / 1000).toFixed(1)}k`
                                            : point.steps}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.noDataContainer}>
                    <Text
                        style={[
                            styles.noDataText,
                            { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                        ]}
                    >
                        No chart data available
                    </Text>
                </View>
            )}
        </View>
    );
};

// ============ MAIN STEPS SCREEN ============
const StepsScreen = () => {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const navigation = useNavigation();
    const {
        isConnected,
        isLoadingConnection,
        checkConnectionStatus,
        fetchQuickData,
        fetchStatsData,
        fetchChartData,
        selectedPeriod,
    } = useFitness();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            checkConnectionStatus();
        }
    }, [isAuthenticated]);

    const handleRefresh = async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            if (isConnected) {
                await Promise.all([
                    fetchQuickData(),
                    fetchStatsData(),
                    fetchChartData(selectedPeriod),
                ]);
                Alert.alert('✅ Success', 'Data refreshed successfully');
            }
        } catch (error: any) {
            Alert.alert('❌ Error', error.message || 'Failed to refresh data');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSettings = () => {
        navigation.navigate('GoogleFitSettings' as never);
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.background }]}
            >
                <View style={styles.centerContainer}>
                    <Image
                        source={require('../assets/stepIcons/footprint.png')}
                        style={[
                            styles.messageIcon,
                            {
                                tintColor: theme.textSecondary,
                                width: dims.isTablet ? 100 : 80,
                                height: dims.isTablet ? 100 : 80,
                            },
                        ]}
                    />
                    <Text
                        style={[
                            styles.messageText,
                            { color: theme.text, fontSize: dims.isTablet ? 22 : 18 },
                        ]}
                    >
                        Please login to view step tracking
                    </Text>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => (navigation as any).navigate('Login')}
                    >
                        <Text
                            style={[styles.actionButtonText, { fontSize: dims.FONT_MEDIUM }]}
                        >
                            Go to Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoadingConnection) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.background }]}
            >
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text
                        style={[
                            styles.loadingText,
                            { color: theme.textSecondary, fontSize: dims.FONT_SMALL },
                        ]}
                    >
                        Checking connection status...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!isConnected) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.background }]}
            >
                <GoogleFitLinkingScreen onLink={checkConnectionStatus} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <Header
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    onSettings={handleSettings}
                />
                <StepCircle />
                <StatsPanel />
                <StepsChart />
                <BMICards />
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ STYLES ============
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: dims.PADDING + 14,
    },
    messageIcon: {
        marginBottom: 20,
    },
    messageText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    actionButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 10,
    },
    linkingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: dims.PADDING + 14,
    },
    linkingIcon: {
        marginBottom: 20,
    },
    linkingTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    linkingDescription: {
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    infoBox: {
        width: '100%',
        padding: dims.PADDING + 4,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 25,
    },
    infoTitle: {
        fontWeight: '600',
        marginBottom: 12,
    },
    infoItem: {
        marginVertical: 4,
        lineHeight: 20,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
        minWidth: 200,
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    googleIcon: {
        marginRight: 10,
    },
    linkButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    privacyNote: {
        marginTop: 15,
        textAlign: 'center',
    },
    headerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: -5,
    },
    leftButton: {
        padding: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
    },
    headerIcon: {},
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: SIZE + 50,
    },
    shadowWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadowCircle: {
        backgroundColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 12,
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
    },
    footprintIcon: {
        marginBottom: 10,
        resizeMode: 'contain',
    },
    steps: {
        fontWeight: 'bold',
        marginVertical: 5,
    },
    goal: {
        marginTop: 5,
    },
    goalAchieved: {
        marginTop: 8,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 0,
    },
    statBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    iconWrapper: {
        borderRadius: 50,
        padding: 10,
        marginBottom: 8,
    },
    statIcon: {},
    statValue: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {},
    chartCard: {
        borderRadius: 14,
        marginTop: 0,
    },
    chartHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    chartTitle: {
        fontWeight: '700',
    },
    periodBtn: {
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    periodText: {
        paddingRight: 6,
        fontWeight: '600',
    },
    periodArrow: {},
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 120,
        paddingRight: dims.PADDING,
    },
    dropdownCard: {
        width: dims.isTablet ? 180 : 160,
        borderRadius: 10,
        paddingVertical: 8,
        borderWidth: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        fontWeight: '600',
    },
    chartContent: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    chartBar: {
        alignItems: 'center',
        marginHorizontal: dims.isSmallDevice ? 4 : 6,
    },
    bar: {
        borderRadius: 8,
        minHeight: 20,
    },
    barLabel: {
        marginTop: 8,
        fontWeight: '500',
    },
    barValue: {
        marginTop: 4,
        fontWeight: '600',
    },
    noDataContainer: {
        padding: 40,
        alignItems: 'center',
    },
    noDataText: {},
});

export default StepsScreen;
