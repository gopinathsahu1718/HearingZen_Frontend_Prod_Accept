import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Modal,
    ScrollView,
    Animated,
    Platform,
    Dimensions,
    Share,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import Svg, {
    Path,
    Defs,
    LinearGradient,
    Stop,
    Text as SvgText,
    Line,
    Rect,
    Circle,
    G,
} from 'react-native-svg';
import BMICards from './StepScreen/BMICards';

const { width } = Dimensions.get('window');
const BOX_SIZE = width * 0.22;
const BASE_SIZE = 200;
const SIZE = width * 0.5;
const STROKE_WIDTH = SIZE * 0.06;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Period = 'Month' | 'Week' | 'Day';
type Point = { x: number; y: number; value?: number };
type SelectedPoint = {
    index: number;
    x: number;
    y: number;
    label: string;
    value: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ============ HEADER COMPONENT ============
const Header: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
    const { theme } = useTheme();

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'I walked 9,592 steps today! 💪 #StepCounter',
            });
        } catch (error) {
            console.error('Share Error:', error);
        }
    };

    const handleRefresh = () => {
        if (onRefresh) return onRefresh();
        console.log('Refresh requested from Header');
    };

    return (
        <View
            style={[
                styles.headerWrapper,
                { backgroundColor: theme.background, justifyContent: 'space-between' },
            ]}
        >
            <TouchableOpacity onPress={handleRefresh} style={styles.leftButton}>
                <Image
                    source={require('../assets/images/refresh.png')}
                    style={[styles.headerIcon, { tintColor: theme.iconTint }]}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Image
                    source={require('../assets/stepIcons/share.png')}
                    style={[styles.headerIcon, { tintColor: theme.iconTint }]}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

// ============ STEP CIRCLE COMPONENT ============
const StepCircle: React.FC<{ steps?: number; goal?: number }> = ({
    steps = 7000,
    goal = 10000
}) => {
    const { theme } = useTheme();
    const progress = steps / goal;
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
                    {steps}
                </Text>
                <Text style={[styles.goal, { fontSize: SIZE * 0.07, color: theme.textSecondary }]}>
                    Goal: {goal}
                </Text>
            </View>
        </View>
    );
};

// ============ STATS PANEL COMPONENT ============
const StatsPanel: React.FC<{
    distance?: number;
    calories?: number;
    activeMins?: number;
    steps?: number;
}> = ({ distance = 5.2, calories = 320, activeMins = 45, steps = 50 }) => {
    const { theme, isDarkMode } = useTheme();
    const stats = [
        {
            label: 'Distance',
            value: `${distance} km`,
            icon: require('../assets/stepIcons/distance.png'),
            bg: theme.cardBackground,
        },
        {
            label: 'Calories',
            value: `${calories}`,
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
            label: 'Percentage',
            value: `${steps} %`,
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
    const { theme, isDarkMode } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('Week');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

    const animProgress = useRef(new Animated.Value(0)).current;
    const pointScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const listener = ({ window }: { window: { width: number } }) =>
            setScreenWidth(window.width);
        const sub = Dimensions.addEventListener
            ? Dimensions.addEventListener('change', listener)
            : undefined;
        return () => sub?.remove?.();
    }, []);

    useEffect(() => {
        animProgress.setValue(0);
        pointScale.setValue(0);
        Animated.parallel([
            Animated.timing(animProgress, {
                toValue: 1,
                duration: 650,
                useNativeDriver: true,
            }),
            Animated.spring(pointScale, {
                toValue: 1,
                friction: 8,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, [selectedPeriod, animProgress, pointScale]);

    const isSmall = screenWidth < 360;
    const isMedium = screenWidth >= 360 && screenWidth < 420;
    const totalChartWidth = Math.max(screenWidth * 1.2, 540);
    const visibleChartWidth = Math.min(screenWidth - 32, 480);
    const chartHeight = isSmall ? 120 : isMedium ? 140 : 160;
    const labelPadding = isSmall ? 14 : 20;
    const sidePadding = labelPadding;

    const periodOptions: Period[] = ['Month', 'Week', 'Day'];
    const periodBtnRef = useRef<any>(null);
    const DROPDOWN_WIDTH = 140;

    const openDropdown = () => {
        const ref = periodBtnRef.current as any;
        if (ref && typeof ref.measureInWindow === 'function') {
            ref.measureInWindow((x: number, y: number, w: number, h: number) => {
                const left = Math.max(
                    8,
                    Math.min(x + w - DROPDOWN_WIDTH, screenWidth - DROPDOWN_WIDTH - 8),
                );
                const top = y + h + 6;
                setDropdownPos({ left, top });
                setDropdownOpen(true);
            });
        } else {
            setDropdownPos({
                left: Math.max(8, screenWidth - DROPDOWN_WIDTH - 12),
                top: isSmall ? 36 : 44,
            });
            setDropdownOpen(true);
        }
    };

    const yToValue = (y: number) => {
        const clamped = Math.max(0, Math.min(chartHeight, y));
        const v = Math.round(((chartHeight - clamped) / chartHeight) * 100);
        return v;
    };

    const getData = useCallback(
        (period: Period): { points: Point[]; labels: string[] } => {
            const hm = isSmall ? 0.65 : isMedium ? 0.72 : 0.78;
            if (period === 'Month') {
                const w = totalChartWidth;
                return {
                    points: [
                        { x: 0, y: 72 * hm, value: 4200 },
                        { x: w * 0.18, y: 60 * hm, value: 5300 },
                        { x: w * 0.36, y: 88 * hm, value: 6100 },
                        { x: w * 0.62, y: 50 * hm, value: 3600 },
                        { x: w * 0.78, y: 95 * hm, value: 7200 },
                        { x: w * 1.0, y: 70 * hm, value: 4800 },
                    ],
                    labels: isSmall ? ['W1', 'W2', 'W3', 'W4'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                };
            } else if (period === 'Day') {
                const w = totalChartWidth;
                return {
                    points: [
                        { x: 0, y: 28 * hm, value: 300 },
                        { x: w * 0.12, y: 38 * hm, value: 900 },
                        { x: w * 0.24, y: 60 * hm, value: 2200 },
                        { x: w * 0.38, y: 94 * hm, value: 5600 },
                        { x: w * 0.52, y: 75 * hm, value: 4100 },
                        { x: w * 0.66, y: 88 * hm, value: 5200 },
                        { x: w * 0.8, y: 68 * hm, value: 3500 },
                        { x: w * 1.0, y: 52 * hm, value: 2700 },
                    ],
                    labels: isSmall ? ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'] : ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
                };
            } else {
                const w = totalChartWidth;
                return {
                    points: [
                        { x: 0, y: 78 * hm, value: 4200 },
                        { x: w * 0.15, y: 46 * hm, value: 3100 },
                        { x: w * 0.3, y: 98 * hm, value: 7200 },
                        { x: w * 0.48, y: 64 * hm, value: 3800 },
                        { x: w * 0.66, y: 88 * hm, value: 5400 },
                        { x: w * 0.82, y: 120 * hm, value: 9000 },
                        { x: w * 1.0, y: 72 * hm, value: 4600 },
                    ],
                    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                };
            }
        },
        [isSmall, isMedium, totalChartWidth],
    );

    const current = useMemo(() => getData(selectedPeriod), [getData, selectedPeriod]);
    const dataPoints = current.points;
    const labels = current.labels;

    const insetPoints = useMemo(() => {
        if (!dataPoints || dataPoints.length === 0) return dataPoints;
        const scaleWidth = Math.max(0, totalChartWidth - sidePadding * 2);
        return dataPoints.map(pt => ({
            ...pt,
            x: sidePadding + (pt.x / totalChartWidth) * scaleWidth,
        }));
    }, [dataPoints, sidePadding, totalChartWidth]);

    const generateSmoothPath = (pts: Point[]) => {
        if (!pts || pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

        const tension = 0.5;
        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2] || p2;

            const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
            const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
            const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
            const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    const generateFillPath = (pts: Point[]) => {
        const line = generateSmoothPath(pts);
        if (!line) return '';
        const lastX = pts[pts.length - 1].x;
        return `${line} L ${lastX} ${chartHeight} L ${pts[0].x} ${chartHeight} Z`;
    };

    const mainPath = useMemo(() => generateSmoothPath(insetPoints), [insetPoints]);
    const fillPath = useMemo(() => generateFillPath(insetPoints), [insetPoints]);

    const refLines = [chartHeight * 0.25, chartHeight * 0.5, chartHeight * 0.75];

    const labelIndexFor = (i: number) =>
        Math.round((i / Math.max(labels.length - 1, 1)) * (insetPoints.length - 1));

    const tooltipWidth = isSmall ? 76 : 96;
    const tooltipHeight = isSmall ? 36 : 42;
    const tooltipPadding = 8;
    const tooltipYOffset = 12;

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    const calcTooltip = (p: Point) => {
        const minX = sidePadding + tooltipWidth / 2;
        const maxX = totalChartWidth - sidePadding - tooltipWidth / 2;
        const anchoredX = clamp(p.x, minX, maxX);
        const anchoredY = p.y - tooltipYOffset;
        const rectY = Math.max(6, anchoredY - tooltipHeight - 4);
        const rectX = anchoredX - tooltipWidth / 2;
        return { rectX, rectY, pointerX: anchoredX, pointerY: p.y - 4 };
    };

    const onPressPoint = (pt: Point, idx: number) => {
        const approxLabelIdx = Math.round(
            (idx / Math.max(insetPoints.length - 1, 1)) * (labels.length - 1),
        );
        const label = labels[clamp(approxLabelIdx, 0, labels.length - 1)] ?? '';
        const v = typeof pt.value === 'number' ? pt.value : yToValue(pt.y);
        setSelectedPoint({ index: idx, x: pt.x, y: pt.y, label, value: v });
    };

    useEffect(() => setSelectedPoint(null), [selectedPeriod]);

    return (
        <View style={[styles.chartCard, { padding: isSmall ? 10 : 14, backgroundColor: theme.cardBackground }]}>
            <View style={styles.chartHeaderRow}>
                <Text style={[styles.chartTitle, { fontSize: isSmall ? 15 : 17, color: theme.text }]}>
                    Report
                </Text>

                <TouchableOpacity
                    ref={periodBtnRef}
                    activeOpacity={0.85}
                    style={[
                        styles.periodBtn,
                        {
                            paddingHorizontal: isSmall ? 8 : 12,
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                        },
                    ]}
                    onPress={openDropdown}
                >
                    <Text style={[styles.periodText, { color: theme.text }]}>{selectedPeriod}</Text>
                    <Text style={[styles.periodArrow, { color: theme.textSecondary }]}>▾</Text>
                </TouchableOpacity>
            </View>

            {selectedPoint && (
                <View style={styles.dropdownOverlay} pointerEvents="box-none">
                    <TouchableOpacity
                        style={styles.dropdownOverlayBackdrop}
                        activeOpacity={1}
                        onPress={() => setSelectedPoint(null)}
                    />
                </View>
            )}

            {dropdownOpen && (
                <Modal visible transparent animationType="fade" onRequestClose={() => setDropdownOpen(false)}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={styles.dropdownOverlayBackdrop}
                            activeOpacity={1}
                            onPress={() => setDropdownOpen(false)}
                        />

                        <View
                            style={[
                                styles.dropdownCardInline,
                                {
                                    position: 'absolute',
                                    left: dropdownPos?.left ?? Math.max(8, screenWidth - DROPDOWN_WIDTH - 12),
                                    top: dropdownPos?.top ?? (isSmall ? 36 : 44),
                                    width: DROPDOWN_WIDTH,
                                    backgroundColor: theme.cardBackground,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            {periodOptions.map(item => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => {
                                        setSelectedPeriod(item);
                                        setDropdownOpen(false);
                                    }}
                                    style={styles.dropdownItem}
                                >
                                    <Text style={[styles.dropdownItemText, { color: theme.text }]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>
            )}

            <View style={[styles.chartWrap, { width: visibleChartWidth }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0 }}>
                    <Svg width={totalChartWidth} height={chartHeight + 34}>
                        <Defs>
                            <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor={theme.primary} stopOpacity="1" />
                                <Stop offset="100%" stopColor={theme.secondary} stopOpacity="1" />
                            </LinearGradient>
                            <LinearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <Stop offset="0%" stopColor={theme.primary} stopOpacity={0.2} />
                                <Stop offset="60%" stopColor={theme.secondary} stopOpacity={0.1} />
                                <Stop offset="100%" stopColor={theme.secondary} stopOpacity={0.02} />
                            </LinearGradient>
                        </Defs>

                        {refLines.map((y, i) => (
                            <Line
                                key={i}
                                x1={0}
                                x2={totalChartWidth}
                                y1={y}
                                y2={y}
                                stroke={`${theme.text}22`}
                                strokeWidth={1}
                                strokeDasharray="4,6"
                            />
                        ))}

                        <G>
                            <Path d={fillPath} fill="url(#fillGrad)" />
                        </G>

                        <G>
                            <AnimatedPath
                                d={mainPath}
                                fill="none"
                                stroke="url(#lineGrad)"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </G>

                        {insetPoints.map((pt, i) => {
                            const isHighlighted = selectedPoint?.index === i;
                            const cx = pt.x;
                            const cy = pt.y;
                            const hitR = isSmall ? 14 : 18;

                            return (
                                <React.Fragment key={i}>
                                    <Circle
                                        cx={cx}
                                        cy={cy}
                                        r={hitR}
                                        fill="rgba(0,0,0,0.001)"
                                        onPress={() => onPressPoint(pt, i)}
                                        onPressIn={() => onPressPoint(pt, i)}
                                    />
                                    <Circle
                                        cx={cx}
                                        cy={cy}
                                        r={(isHighlighted ? (isSmall ? 5.8 : 7.2) : isSmall ? 3.8 : 5) + 2}
                                        fill="none"
                                        stroke={`${theme.text}22`}
                                        strokeWidth={1}
                                        pointerEvents="none"
                                    />
                                    <Circle
                                        cx={cx}
                                        cy={cy}
                                        r={isHighlighted ? (isSmall ? 5.8 : 7.2) : isSmall ? 3.8 : 5}
                                        fill={theme.text}
                                        stroke="url(#lineGrad)"
                                        strokeWidth={isHighlighted ? 2 : 1.6}
                                        onPress={() => onPressPoint(pt, i)}
                                        onPressIn={() => onPressPoint(pt, i)}
                                    />
                                    {isHighlighted && (
                                        <Circle
                                            cx={cx}
                                            cy={cy}
                                            r={isSmall ? 12 : 14}
                                            fill="none"
                                            stroke={theme.primary}
                                            strokeOpacity={0.22}
                                            strokeWidth={2}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {labels.map((lab, idx) => {
                            let rawX: number;
                            if (selectedPeriod === 'Day') {
                                const steps = Math.max(labels.length - 1, 1);
                                const usableWidth = totalChartWidth - sidePadding * 2;
                                rawX = sidePadding + (idx / steps) * usableWidth;
                            } else {
                                const dataIdx = labelIndexFor(idx);
                                rawX = insetPoints[clamp(dataIdx, 0, insetPoints.length - 1)].x;
                            }
                            const x = clamp(rawX, sidePadding, totalChartWidth - sidePadding);
                            return (
                                <SvgText
                                    key={idx}
                                    x={x}
                                    y={chartHeight + (isSmall ? 16 : 20)}
                                    fontSize={isSmall ? 10 : 12}
                                    fill={theme.textSecondary}
                                    textAnchor="middle"
                                    fontFamily="System"
                                >
                                    {lab}
                                </SvgText>
                            );
                        })}

                        {selectedPoint &&
                            (() => {
                                const p = { x: selectedPoint.x, y: selectedPoint.y };
                                const { rectX, rectY, pointerX, pointerY } = calcTooltip(p);

                                return (
                                    <G key="tooltip">
                                        <Line
                                            x1={pointerX}
                                            y1={pointerY - 2}
                                            x2={pointerX}
                                            y2={rectY + tooltipHeight}
                                            stroke={theme.primary}
                                            strokeWidth={1}
                                            strokeOpacity={0.9}
                                        />
                                        <Rect
                                            x={rectX}
                                            y={rectY}
                                            rx={8}
                                            width={tooltipWidth}
                                            height={tooltipHeight}
                                            fill={theme.surface}
                                            stroke={theme.primary}
                                            strokeWidth={0.8}
                                            opacity={0.98}
                                            onPress={() => setSelectedPoint(null)}
                                        />
                                        <SvgText
                                            x={rectX + tooltipPadding}
                                            y={rectY + (isSmall ? 14 : 16)}
                                            fontSize={isSmall ? 10 : 11}
                                            fill={theme.textSecondary}
                                        >
                                            {selectedPoint.label}
                                        </SvgText>
                                        <SvgText
                                            x={rectX + tooltipPadding}
                                            y={rectY + (isSmall ? 30 : 32)}
                                            fontSize={isSmall ? 12 : 14}
                                            fill={theme.text}
                                            fontWeight="600"
                                        >
                                            {Number(selectedPoint.value).toLocaleString()}
                                        </SvgText>
                                    </G>
                                );
                            })()}
                    </Svg>
                </ScrollView>
            </View>
        </View>
    );
};

// ============ MAIN STEPS SCREEN ============
const StepsScreen = () => {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
    }));

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header />
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
    // Header Styles
    headerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 25,
        marginHorizontal: 10,
    },
    leftButton: {
        padding: 6,
    },
    shareButton: {
        padding: 6,
    },
    headerIcon: {
        width: 22,
        height: 22,
        tintColor: '#fff',
    },

    // Step Circle Styles
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: -30,
    },
    shadowWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadowCircle: {
        backgroundColor: 'transparent',
        shadowColor: '#00BFFF',
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
        marginTop: -20,
        resizeMode: 'contain',
    },
    steps: {
        fontWeight: 'bold',
        color: '#fff',
    },
    goal: {
        color: '#bbb',
    },

    // Stats Panel Styles
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 30,
    },
    statBox: {
        alignItems: 'center',
        justifyContent: 'center',
        flexBasis: BOX_SIZE,
        paddingVertical: width * 0.02,
        borderRadius: 12,
    },
    iconWrapper: {
        backgroundColor: '#101012ff',
        borderRadius: 50,
        padding: width * 0.015,
        marginBottom: 6,
    },
    statIcon: {
        width: width * 0.06,
        height: width * 0.06,
    },
    statValue: {
        fontSize: width * 0.04,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: width * 0.03,
        color: '#bbb',
        marginTop: 2,
    },

    // Chart Styles
    chartCard: {
        backgroundColor: '#0b0f12',
        borderRadius: 14,
        marginTop: 10,

    },
    chartHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    chartTitle: {
        color: '#fff',
        fontWeight: '700',
    },
    periodBtn: {
        backgroundColor: '#0f1720',
        borderRadius: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#19232a',
    },
    periodText: {
        color: '#d7eef0',
        paddingRight: 6,
        fontWeight: '600',
    },
    periodArrow: {
        color: '#98cfcf',
        fontSize: 12,
        paddingRight: 8,
    },
    dropdownOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    dropdownOverlayBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    dropdownCardInline: {
        position: 'absolute',
        alignSelf: 'flex-end',
        width: 140,
        backgroundColor: '#0f1720',
        borderRadius: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#202a2f',
        zIndex: 30,
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    dropdownItemText: {
        color: '#e4f7f8',
        textAlign: 'center',
        fontWeight: '600',
    },
    chartWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: 6,
    },
});

export default StepsScreen;