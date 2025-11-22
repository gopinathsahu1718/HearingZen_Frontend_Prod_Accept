// screens/StepsScreen.tsx - COMPLETE VERSION
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
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useFitness } from '../contexts/FitnessContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import BMICards from './StepScreen/BMICards';

const { width } = Dimensions.get('window');
const BOX_SIZE = width * 0.22;
const SIZE = width * 0.5;
const STROKE_WIDTH = SIZE * 0.06;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ============ GOOGLE FIT LINKING SCREEN ============
const GoogleFitLinkingScreen: React.FC<{ onLink: () => void }> = ({ onLink }) => {
    const { theme } = useTheme();
    const { linkGoogle } = useFitness();
    const [isLinking, setIsLinking] = useState(false);
    const [isLinkingInProgress, setIsLinkingInProgress] = useState(false);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
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
                        ]
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

    if (isLinkingInProgress) {
        return (
            <View style={[styles.linkingContainer, { backgroundColor: theme.background }]}>
                <Image
                    source={require('../assets/stepIcons/footprint.png')}
                    style={[styles.linkingIcon, { tintColor: theme.primary }]}
                />
                <Text style={[styles.linkingTitle, { color: theme.text }]}>
                    Linking in Progress
                </Text>
                <Text style={[styles.linkingDescription, { color: theme.textSecondary }]}>
                    Complete the process in your browser and return to the app. It will automatically check the connection.
                </Text>
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
                <TouchableOpacity
                    style={[styles.linkButton, { backgroundColor: theme.primary, marginTop: 20 }]}
                    onPress={() => {
                        setIsLinkingInProgress(false);
                        onLink();
                    }}
                >
                    <Text style={styles.linkButtonText}>Check Connection Now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.linkingContainer, { backgroundColor: theme.background }]}>
            <Image
                source={require('../assets/stepIcons/footprint.png')}
                style={[styles.linkingIcon, { tintColor: theme.primary }]}
            />
            <Text style={[styles.linkingTitle, { color: theme.text }]}>
                Connect Google Fit
            </Text>
            <Text style={[styles.linkingDescription, { color: theme.textSecondary }]}>
                Link your Google Fit account to track your daily steps, calories, and activity data.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>📱 What You'll Get:</Text>
                <Text style={[styles.infoItem, { color: theme.textSecondary }]}>• Daily step count</Text>
                <Text style={[styles.infoItem, { color: theme.textSecondary }]}>• Distance traveled</Text>
                <Text style={[styles.infoItem, { color: theme.textSecondary }]}>• Calories burned</Text>
                <Text style={[styles.infoItem, { color: theme.textSecondary }]}>• Active time tracking</Text>
                <Text style={[styles.infoItem, { color: theme.textSecondary }]}>• Weekly & monthly reports</Text>
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
                            style={styles.googleIcon}
                        />
                        <Text style={styles.linkButtonText}>Link Google Fit</Text>
                    </>
                )}
            </TouchableOpacity>

            <Text style={[styles.privacyNote, { color: theme.textSecondary }]}>
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
        <View style={[styles.headerWrapper, { backgroundColor: theme.background }]}>
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
                        style={[styles.headerIcon, { tintColor: theme.iconTint }]}
                        resizeMode="contain"
                    />
                )}
            </TouchableOpacity>

            <View style={styles.headerRight}>
                <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                    <Image
                        source={require('../assets/stepIcons/share.png')}
                        style={[styles.headerIcon, { tintColor: theme.iconTint }]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {onSettings && (
                    <TouchableOpacity onPress={onSettings} style={styles.headerButton}>
                        <Image
                            source={require('../assets/icons/settings.png')}
                            style={[styles.headerIcon, { tintColor: theme.iconTint }]}
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
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
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
                    rotation="-90"
                    originX={SIZE / 2}
                    originY={SIZE / 2}
                />
            </Svg>

            <View style={styles.centerContent}>
                <Image
                    source={require('../assets/stepIcons/footprint.png')}
                    style={[styles.footprintIcon, { width: SIZE * 0.25, height: SIZE * 0.25 }]}
                />
                <Text style={[styles.steps, { fontSize: SIZE * 0.14, color: theme.text }]}>
                    {steps.toLocaleString()}
                </Text>
                <Text style={[styles.goal, { fontSize: SIZE * 0.07, color: theme.textSecondary }]}>
                    Goal: {goal.toLocaleString()}
                </Text>
                {steps >= goal && (
                    <Text style={[styles.goalAchieved, { fontSize: SIZE * 0.06, color: '#00FF7F' }]}>
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
            <View style={styles.statsContainer}>
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

    return (
        <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
                <View key={index} style={[styles.statBox, { backgroundColor: stat.bg }]}>
                    <View
                        style={[
                            styles.iconWrapper,
                            { backgroundColor: isDarkMode ? '#101012ff' : '#f0f0f0' },
                        ]}
                    >
                        <Image
                            source={stat.icon}
                            style={[styles.statIcon, { tintColor: '#00BFFF' }]}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
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
    const { chartData, isLoadingChart, selectedPeriod, setSelectedPeriod } = useFitness();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const periodOptions: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];

    const formatPeriodDisplay = (period: string) => {
        return period.charAt(0).toUpperCase() + period.slice(1);
    };

    if (isLoadingChart && !chartData) {
        return (
            <View style={[styles.chartCard, { backgroundColor: theme.cardBackground, padding: 20 }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Loading chart...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.chartHeaderRow}>
                <Text style={[styles.chartTitle, { color: theme.text }]}>Activity Report</Text>
                <TouchableOpacity
                    style={[styles.periodBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                    <Text style={[styles.periodText, { color: theme.text }]}>
                        {formatPeriodDisplay(selectedPeriod)}
                    </Text>
                    <Text style={[styles.periodArrow, { color: theme.textSecondary }]}>▾</Text>
                </TouchableOpacity>
            </View>

            {dropdownOpen && (
                <Modal transparent visible={dropdownOpen} onRequestClose={() => setDropdownOpen(false)}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setDropdownOpen(false)}
                    >
                        <View style={[styles.dropdownCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            {periodOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.dropdownItem,
                                        selectedPeriod === option && { backgroundColor: theme.surface }
                                    ]}
                                    onPress={() => {
                                        setSelectedPeriod(option);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownItemText, { color: theme.text }]}>
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
                            const barHeight = maxSteps > 0 ? Math.max(20, (point.steps / maxSteps) * 150) : 20;
                            const label = point.dayShort || point.label || point.date?.substring(5) || `${index + 1}`;

                            return (
                                <View key={index} style={styles.chartBar}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: point.goalAchieved ? '#00FF7F' : theme.primary,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                                        {label}
                                    </Text>
                                    <Text style={[styles.barValue, { color: theme.text }]}>
                                        {point.steps > 999 ? `${(point.steps / 1000).toFixed(1)}k` : point.steps}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.noDataContainer}>
                    <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
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
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centerContainer}>
                    <Image
                        source={require('../assets/stepIcons/footprint.png')}
                        style={[styles.messageIcon, { tintColor: theme.textSecondary }]}
                    />
                    <Text style={[styles.messageText, { color: theme.text }]}>
                        Please login to view step tracking
                    </Text>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => (navigation as any).navigate('Login')}
                    >
                        <Text style={styles.actionButtonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoadingConnection) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Checking connection status...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!isConnected) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <GoogleFitLinkingScreen onLink={checkConnectionStatus} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
        padding: 30,
    },
    messageIcon: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    messageText: {
        fontSize: 18,
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
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
    },
    linkingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    linkingIcon: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    linkingTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    linkingDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    infoBox: {
        width: '100%',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 25,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    infoItem: {
        fontSize: 14,
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
        width: 24,
        height: 24,
        marginRight: 10,
    },
    linkButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    privacyNote: {
        marginTop: 15,
        fontSize: 13,
        textAlign: 'center',
    },
    headerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginHorizontal: 16,
        marginBottom: 10,
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
    headerIcon: {
        width: 24,
        height: 24,
    },
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginVertical: 20,
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
        paddingHorizontal: 16,
        marginTop: 10,
    },
    statBox: {
        alignItems: 'center',
        justifyContent: 'center',
        flexBasis: BOX_SIZE,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    iconWrapper: {
        borderRadius: 50,
        padding: 10,
        marginBottom: 8,
    },
    statIcon: {
        width: 24,
        height: 24,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    chartCard: {
        borderRadius: 14,
        marginTop: 20,
        marginHorizontal: 16,
        padding: 16,
    },
    chartHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    chartTitle: {
        fontSize: 18,
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
        fontSize: 14,
    },
    periodArrow: {
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 120,
        paddingRight: 16,
    },
    dropdownCard: {
        width: 160,
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
        fontSize: 14,
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
        marginHorizontal: 6,
        minWidth: 45,
    },
    bar: {
        width: 36,
        borderRadius: 8,
        minHeight: 20,
    },
    barLabel: {
        marginTop: 8,
        fontSize: 11,
        fontWeight: '500',
    },
    barValue: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: '600',
    },
    noDataContainer: {
        padding: 40,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 14,
    },
});

export default StepsScreen;