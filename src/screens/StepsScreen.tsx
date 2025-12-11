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
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useAuth } from '../contexts/AuthContext';
import useMotionSteps from '../hooks/useMotionSteps';
import moment from 'moment-timezone';
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
const SIZE = width * 0.5;
const STROKE_WIDTH = SIZE * 0.06;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const API_BASE_URL = 'http://13.200.222.176/api/steps';
const SYNC_INTERVAL = 30000; // 30 seconds

// AsyncStorage keys
const STEPS_DATA_KEY = '@steps_data';
const OFFLINE_QUEUE_KEY = '@steps_offline_queue';
const LAST_SYNC_KEY = '@steps_last_sync';
const BASELINE_KEY = '@steps_baseline';
const MOTION_OFFSET_KEY = '@steps_motion_offset';
const TRACKING_ENABLED_KEY = '@steps_tracking_enabled'; // NEW

type Period = 'Month' | 'Week' | 'Day';
type Point = { x: number; y: number; value?: number };
type SelectedPoint = {
  index: number;
  x: number;
  y: number;
  label: string;
  value: number;
};

interface StepsData {
  currentSteps: number;
  currentDistance: number;
  currentCalories: number;
  currentActiveTime: number;
  dailyGoal: number;
  lastUpdated: number;
  currentDate: string;
}

interface BaselineData {
  steps: number;
  distance: number;
  calories: number;
  activeTime: number;
  date: string;
}

interface OfflineEntry {
  steps: number;
  distance: number;
  calories: number;
  activeTime: number;
  timestamp: string;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Get current IST date in YYYY-MM-DD format
const getISTDate = () => {
  return moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
};

// Convert timestamp to IST
const getISTTimestamp = () => {
  return moment().tz('Asia/Kolkata').toISOString();
};

// ============ HEADER COMPONENT ============
const Header: React.FC<{
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSettings?: () => void;
}> = ({
  onRefresh,
  isRefreshing = false,
  onSettings
}) => {
    const { theme } = useTheme();
    return (
      <View
        style={[
          styles.headerWrapper,
          { backgroundColor: theme.background, justifyContent: 'space-between' },
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
              style={[styles.headerIcon, { tintColor: theme.iconTint }]}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettings} style={styles.shareButton}>
          <Image
            source={require('../assets/images/settings.png')}
            style={[styles.headerIcon, { tintColor: theme.iconTint }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

// ============ STEP CIRCLE COMPONENT ============
const StepCircle: React.FC<{ steps?: number; goal?: number }> = ({
  steps = 0,
  goal = 10000,
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
          style={[
            styles.footprintIcon,
            { width: SIZE * 0.25, height: SIZE * 0.25 },
          ]}
        />
        <Text
          style={[styles.steps, { fontSize: SIZE * 0.14, color: theme.text }]}
        >
          {steps}
        </Text>
        <Text
          style={[
            styles.goal,
            { fontSize: SIZE * 0.07, color: theme.textSecondary },
          ]}
        >
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
  percentage?: number;
}> = ({ distance = 0, calories = 0, activeMins = 0, percentage = 0 }) => {
  const { theme, isDarkMode } = useTheme();
  const stats = [
    {
      label: 'Distance',
      value: `${(Number(distance) / 1000).toFixed(3)} km`,
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
      value: `${(Number(activeMins) / 60).toFixed(2)} min`,
      icon: require('../assets/stepIcons/time.png'),
      bg: theme.cardBackground,
    },
    {
      label: 'Percentage',
      value: `${Number(percentage).toFixed(2)} %`,
      icon: require('../assets/stepIcons/footprint.png'),
      bg: theme.cardBackground,
    },
  ];

  return (
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[styles.statBox, { backgroundColor: stat.bg }]}
        >
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
          <Text style={[styles.statValue, { color: theme.text }]}>
            {stat.value}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ============ STEPS CHART COMPONENT ============
const StepsChart: React.FC<{
  isAuthenticated: boolean;
  token: string | null;
}> = ({ isAuthenticated, token }) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Week');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [chartData, setChartData] = useState<{ points: Point[]; labels: string[] }>({
    points: [],
    labels: [],
  });
  const [isLoading, setIsLoading] = useState(false);

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
  }, [selectedPeriod]);

  const fetchChartData = async (period: Period) => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please turn on your data to view the report chart.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/history?period=${period.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch chart data');
      }

      processChartData(data.data.history || [], period);
    } catch (error: any) {
      console.error('Fetch chart error:', error);
      Alert.alert('Error', error.message || 'Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = (history: any[], period: Period) => {
    const isSmall = screenWidth < 360;
    const isMedium = screenWidth >= 360 && screenWidth < 420;
    const chartHeight = isSmall ? 90 : isMedium ? 110 : 130;

    let points: Point[] = [];
    let labels: string[] = [];

    if (history.length === 0) {
      setChartData({ points: [], labels: [] });
      return;
    }

    const maxSteps = Math.max(...history.map((h: any) => h.totalSteps || 0), 1);

    history.forEach((entry: any, i: number) => {
      if (period === 'Day') {
        labels.push(moment(entry.date || entry.timestamp).format('h A'));
      } else if (period === 'Week') {
        labels.push(moment(entry.date).format('ddd'));
      } else {
        const start = moment(entry.weekStart).format('MMM D');
        const end = moment(entry.weekEnd).format('MMM D');
        labels.push(`${start}-${end}`);
      }

      points.push({
        x: i / Math.max(history.length - 1, 1),
        y: chartHeight - ((entry.totalSteps || 0) / maxSteps) * chartHeight * 0.75,
        value: entry.totalSteps || 0,
      });
    });

    setChartData({ points, labels });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChartData(selectedPeriod);
    }
  }, [selectedPeriod, isAuthenticated, token]);

  const isSmall = screenWidth < 360;
  const isMedium = screenWidth >= 360 && screenWidth < 420;

  const Y_AXIS_WIDTH = 45;
  const CARD_PADDING = 32;
  const SAFE_MARGIN = 20;
  const availableWidth = screenWidth - Y_AXIS_WIDTH - CARD_PADDING - SAFE_MARGIN;
  const chartHeight = isSmall ? 90 : isMedium ? 110 : 130;
  const labelPadding = isSmall ? 10 : 15;
  const sidePadding = labelPadding;

  const periodOptions: Period[] = ['Month', 'Week', 'Day'];
  const periodBtnRef = useRef<any>(null);
  const DROPDOWN_WIDTH = 140;

  const dataPoints = chartData.points;
  const labels = chartData.labels;

  const actualTotalWidth = useMemo(() => {
    const numPoints = dataPoints.length;
    if (numPoints === 0) return Math.max(availableWidth * 0.95, 280);
    const minSpacePerPoint = selectedPeriod === 'Day' ? 35 : selectedPeriod === 'Week' ? 60 : 30;
    const suggestedWidth = numPoints * minSpacePerPoint;
    return Math.max(suggestedWidth, availableWidth * 0.9);
  }, [dataPoints.length, selectedPeriod, availableWidth]);

  const maxSteps = dataPoints.length > 0
    ? Math.max(...dataPoints.map(p => p.value || 0))
    : 10000;
  const yAxisValues = [
    Math.round(maxSteps),
    Math.round(maxSteps * 0.75),
    Math.round(maxSteps * 0.5),
    Math.round(maxSteps * 0.25),
    0
  ];

  const insetPoints = useMemo(() => {
    if (!dataPoints || dataPoints.length === 0) return dataPoints;
    const scaleWidth = Math.max(0, actualTotalWidth - sidePadding * 2);
    return dataPoints.map(pt => ({
      ...pt,
      x: sidePadding + (pt.x * scaleWidth),
    }));
  }, [dataPoints, sidePadding, actualTotalWidth]);

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
    const firstX = pts[0].x;
    return `${line} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;
  };

  const mainPath = useMemo(() => generateSmoothPath(insetPoints), [insetPoints]);
  const fillPath = useMemo(() => generateFillPath(insetPoints), [insetPoints]);

  const refLines = [chartHeight * 0.25, chartHeight * 0.5, chartHeight * 0.75];

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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

  const onPressPoint = (pt: Point, idx: number) => {
    const approxLabelIdx = Math.round(
      (idx / Math.max(insetPoints.length - 1, 1)) * (labels.length - 1),
    );
    const label = labels[clamp(approxLabelIdx, 0, labels.length - 1)] ?? '';
    const v = typeof pt.value === 'number' ? pt.value : 0;
    setSelectedPoint({ index: idx, x: pt.x, y: pt.y, label, value: v });
  };

  useEffect(() => setSelectedPoint(null), [selectedPeriod]);

  const getDisplayDate = (): string => {
    const today = moment().tz('Asia/Kolkata');
    if (selectedPeriod === 'Day') {
      return today.format('dddd, MMM D');
    } else if (selectedPeriod === 'Week') {
      const weekStart = today.clone().startOf('week');
      const weekEnd = weekStart.clone().add(6, 'days');
      return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D')}`;
    } else {
      return today.format('MMMM YYYY');
    }
  };

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.chartCard,
          { padding: isSmall ? 10 : 14, backgroundColor: theme.cardBackground },
        ]}
      >
        <View style={styles.chartHeaderRow}>
          <Text
            style={[
              styles.chartTitle,
              { fontSize: isSmall ? 15 : 17, color: theme.text },
            ]}
          >
            Report
          </Text>
        </View>
        <View style={styles.loginMessageContainer}>
          <Image
            source={require('../assets/stepIcons/footprint.png')}
            style={[styles.loginMessageIcon, { tintColor: theme.textSecondary }]}
          />
          <Text style={[styles.loginMessageTitle, { color: theme.text }]}>
            Please Login
          </Text>
          <Text style={[styles.loginMessageText, { color: theme.textSecondary }]}>
            Login to store your step data and view detailed reports across days, weeks, and months.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.chartCard,
        { padding: isSmall ? 10 : 14, backgroundColor: theme.cardBackground },
      ]}
    >
      <View style={styles.chartHeaderRow}>
        <Text
          style={[
            styles.chartTitle,
            { fontSize: isSmall ? 15 : 17, color: theme.text },
          ]}
        >
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
          <Text style={[styles.periodText, { color: theme.text }]}>
            {selectedPeriod}
          </Text>
          <Text style={[styles.periodArrow, { color: theme.textSecondary }]}>
            ▾
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 6 }}>
        {getDisplayDate()}
      </Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {!isLoading && insetPoints.length === 0 && (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
            No data available for this period
          </Text>
        </View>
      )}

      {!isLoading && insetPoints.length > 0 && (
        <>
          {dropdownOpen && (
            <Modal
              visible
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownOpen(false)}
            >
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
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>
          )}

          <View style={[styles.chartWrap, { width: '100%' }]}>
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.yAxisContainer, { height: chartHeight + 34, width: Y_AXIS_WIDTH, flexShrink: 0 }]}>
                {yAxisValues.map((value, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.yAxisLabel,
                      {
                        color: theme.textSecondary,
                        top: (idx / (yAxisValues.length - 1)) * chartHeight - 6,
                      },
                    ]}
                  >
                    {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                  </Text>
                ))}
              </View>

              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ alignItems: 'flex-start' }}
              >
                <Svg width={actualTotalWidth} height={chartHeight + 34}>
                  <Defs>
                    <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={theme.primary} stopOpacity="1" />
                      <Stop offset="100%" stopColor={theme.secondary} stopOpacity="1" />
                    </LinearGradient>
                    <LinearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
                      <Stop offset="60%" stopColor={theme.secondary} stopOpacity="0.1" />
                      <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.02" />
                    </LinearGradient>
                  </Defs>

                  {refLines.map((y, i) => (
                    <Line
                      key={i}
                      x1={0}
                      x2={actualTotalWidth}
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
                        />
                        <Circle
                          cx={cx}
                          cy={cy}
                          r={(isHighlighted ? (isSmall ? 5.8 : 7.2) : (isSmall ? 3.8 : 5)) + 2}
                          fill="none"
                          stroke={`${theme.text}22`}
                          strokeWidth={1}
                          pointerEvents="none"
                        />
                        <Circle
                          cx={cx}
                          cy={cy}
                          r={isHighlighted ? (isSmall ? 5.8 : 7.2) : (isSmall ? 3.8 : 5)}
                          fill={theme.text}
                          stroke="url(#lineGrad)"
                          strokeWidth={isHighlighted ? 2 : 1.6}
                          onPress={() => onPressPoint(pt, i)}
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
                    const steps = Math.max(labels.length - 1, 1);
                    const usableWidth = actualTotalWidth - sidePadding * 2;
                    const rawX = sidePadding + (idx / steps) * usableWidth;
                    const x = clamp(rawX, sidePadding, actualTotalWidth - sidePadding);
                    const labelY = chartHeight + (isSmall ? 18 : 22);
                    return (
                      <SvgText
                        key={idx}
                        x={x}
                        y={labelY}
                        fontSize={isSmall ? 9 : 10}
                        fill={theme.textSecondary}
                        textAnchor="middle"
                        fontFamily="System"
                      >
                        {lab}
                      </SvgText>
                    );
                  })}

                  {selectedPoint && (() => {
                    const tooltipWidth = isSmall ? 76 : 96;
                    const tooltipHeight = isSmall ? 36 : 42;
                    const tooltipPadding = 8;
                    const minX = sidePadding + tooltipWidth / 2;
                    const maxX = actualTotalWidth - sidePadding - tooltipWidth / 2;
                    const anchoredX = clamp(selectedPoint.x, minX, maxX);
                    const rectY = Math.max(6, selectedPoint.y - tooltipHeight - 16);
                    const rectX = anchoredX - tooltipWidth / 2;
                    return (
                      <G key="tooltip" onPress={() => setSelectedPoint(null)}>
                        <Line
                          x1={anchoredX}
                          y1={selectedPoint.y - 2}
                          x2={anchoredX}
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
                          {Number(selectedPoint.value).toLocaleString()} steps
                        </SvgText>
                      </G>
                    );
                  })()}
                </Svg>
              </ScrollView>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

// ============ MAIN STEPS SCREEN ============
const StepsScreen = () => {
  const { theme } = useTheme();
  const { steps, distance, calories, activeTime } = useMotionSteps();
  const { token, isAuthenticated } = useAuth();

  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);

  const [localStepsData, setLocalStepsData] = useState<StepsData>({
    currentSteps: 0,
    currentDistance: 0,
    currentCalories: 0,
    currentActiveTime: 0,
    dailyGoal: 10000,
    lastUpdated: Date.now(),
    currentDate: getISTDate(),
  });

  const [baseline, setBaseline] = useState<BaselineData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activeTime: 0,
    date: getISTDate(),
  });

  const [motionOffset, setMotionOffset] = useState({
    steps: 0,
    distance: 0,
    calories: 0,
    activeTime: 0,
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [goalInput, setGoalInput] = useState('10000');
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const lastSyncedStepsRef = useRef(0);

  const stylesTheme = useThemedStyles(theme =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
    }),
  );

  // Load tracking enabled state
  const loadTrackingState = async () => {
    try {
      const enabled = await AsyncStorage.getItem(TRACKING_ENABLED_KEY);
      if (enabled !== null) {
        setIsTrackingEnabled(enabled === 'true');
      }
    } catch (error) {
      console.error('Load tracking state error:', error);
    }
  };

  // Save tracking enabled state
  const saveTrackingState = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(TRACKING_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('Save tracking state error:', error);
    }
  };

  // Load baseline and offset from AsyncStorage
  const loadBaseline = async () => {
    try {
      const [baselineStr, offsetStr] = await Promise.all([
        AsyncStorage.getItem(BASELINE_KEY),
        AsyncStorage.getItem(MOTION_OFFSET_KEY),
      ]);

      const currentDate = getISTDate();

      if (baselineStr) {
        const savedBaseline: BaselineData = JSON.parse(baselineStr);

        if (savedBaseline.date !== currentDate) {
          const resetBaseline: BaselineData = {
            steps: 0,
            distance: 0,
            calories: 0,
            activeTime: 0,
            date: currentDate,
          };
          setBaseline(resetBaseline);
          await AsyncStorage.setItem(BASELINE_KEY, JSON.stringify(resetBaseline));

          const resetOffset = { steps: 0, distance: 0, calories: 0, activeTime: 0 };
          setMotionOffset(resetOffset);
          await AsyncStorage.setItem(MOTION_OFFSET_KEY, JSON.stringify(resetOffset));
        } else {
          setBaseline(savedBaseline);
        }
      }

      if (offsetStr) {
        const savedOffset = JSON.parse(offsetStr);
        setMotionOffset(savedOffset);
      }
    } catch (error) {
      console.error('Load baseline error:', error);
    }
  };

  // Save baseline to AsyncStorage
  const saveBaseline = async (newBaseline: BaselineData) => {
    try {
      await AsyncStorage.setItem(BASELINE_KEY, JSON.stringify(newBaseline));
    } catch (error) {
      console.error('Save baseline error:', error);
    }
  };

  // Save motion offset to AsyncStorage
  const saveMotionOffset = async (offset: typeof motionOffset) => {
    try {
      await AsyncStorage.setItem(MOTION_OFFSET_KEY, JSON.stringify(offset));
    } catch (error) {
      console.error('Save motion offset error:', error);
    }
  };

  // Load data from AsyncStorage
  const loadLocalData = async () => {
    try {
      const [stepsDataStr, queueStr] = await Promise.all([
        AsyncStorage.getItem(STEPS_DATA_KEY),
        AsyncStorage.getItem(OFFLINE_QUEUE_KEY),
      ]);

      if (stepsDataStr) {
        const data: StepsData = JSON.parse(stepsDataStr);
        const currentDate = getISTDate();

        if (data.currentDate !== currentDate) {
          const resetData: StepsData = {
            currentSteps: 0,
            currentDistance: 0,
            currentCalories: 0,
            currentActiveTime: 0,
            dailyGoal: data.dailyGoal,
            lastUpdated: Date.now(),
            currentDate,
          };
          setLocalStepsData(resetData);
          await AsyncStorage.setItem(STEPS_DATA_KEY, JSON.stringify(resetData));
        } else {
          setLocalStepsData(data);
        }
      }

      if (queueStr) {
        setOfflineQueue(JSON.parse(queueStr));
      }
    } catch (error) {
      console.error('Load local data error:', error);
    }
  };

  // Save data to AsyncStorage
  const saveLocalData = async (data: StepsData) => {
    try {
      await AsyncStorage.setItem(STEPS_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Save local data error:', error);
    }
  };

  // Fetch current data from backend and set as baseline
  const fetchCurrentDataFromBackend = async (showLoader = false) => {
    if (!token || !isAuthenticated || !isTrackingEnabled) return;

    if (showLoader) setIsRefreshing(true);

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please turn on your data to refresh step data from the server.',
          [{ text: 'OK' }]
        );
        if (showLoader) setIsRefreshing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/current`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const backendData = result.data;
        const currentDate = getISTDate();

        const newBaseline: BaselineData = {
          steps: backendData.currentSteps || 0,
          distance: backendData.currentDistance || 0,
          calories: backendData.currentCalories || 0,
          activeTime: backendData.currentActiveTime || 0,
          date: currentDate,
        };
        setBaseline(newBaseline);
        await saveBaseline(newBaseline);

        const newOffset = {
          steps: steps,
          distance: distance,
          calories: calories,
          activeTime: activeTime,
        };
        setMotionOffset(newOffset);
        await saveMotionOffset(newOffset);

        const newData: StepsData = {
          currentSteps: newBaseline.steps,
          currentDistance: newBaseline.distance,
          currentCalories: newBaseline.calories,
          currentActiveTime: newBaseline.activeTime,
          dailyGoal: backendData.dailyGoal || 10000,
          lastUpdated: Date.now(),
          currentDate,
        };
        setLocalStepsData(newData);
        await saveLocalData(newData);

        lastSyncedStepsRef.current = newBaseline.steps;

        if (showLoader) {
          Alert.alert(
            'Success',
            'Step data refreshed successfully',
            [{ text: 'OK' }]
          );
        }

        console.log('Fetched from backend - Baseline:', newBaseline, 'Offset:', newOffset);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Fetch current data error:', error);
      if (showLoader) {
        Alert.alert(
          'Error',
          error.message || 'Failed to refresh data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (showLoader) setIsRefreshing(false);
    }
  };

  // Sync data to backend
  const syncToBackend = async () => {
    if (!token || !isAuthenticated || isSyncing || !isTrackingEnabled) return;

    if (localStepsData.currentSteps === lastSyncedStepsRef.current) {
      return;
    }

    setIsSyncing(true);

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        const entry: OfflineEntry = {
          steps: localStepsData.currentSteps,
          distance: localStepsData.currentDistance,
          calories: localStepsData.currentCalories,
          activeTime: localStepsData.currentActiveTime,
          timestamp: getISTTimestamp(),
        };
        const newQueue = [...offlineQueue, entry];
        setOfflineQueue(newQueue);
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
        console.log('No internet, added to offline queue');
        return;
      }

      if (offlineQueue.length > 0) {
        await syncOfflineQueue();
      }

      const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps: localStepsData.currentSteps,
          distance: localStepsData.currentDistance,
          calories: localStepsData.currentCalories,
          activeTime: localStepsData.currentActiveTime,
          timestamp: getISTTimestamp(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
        lastSyncedStepsRef.current = localStepsData.currentSteps;
        console.log('Synced to backend:', localStepsData.currentSteps, 'steps');
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync to backend error:', error);
      const entry: OfflineEntry = {
        steps: localStepsData.currentSteps,
        distance: localStepsData.currentDistance,
        calories: localStepsData.currentCalories,
        activeTime: localStepsData.currentActiveTime,
        timestamp: getISTTimestamp(),
      };
      const newQueue = [...offlineQueue, entry];
      setOfflineQueue(newQueue);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync offline queue
  const syncOfflineQueue = async () => {
    if (!token || offlineQueue.length === 0 || !isTrackingEnabled) return;

    try {
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: offlineQueue,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOfflineQueue([]);
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
        console.log('Offline queue synced successfully');
      }
    } catch (error) {
      console.error('Sync offline queue error:', error);
    }
  };

  // Calculate incremental steps from motion sensor
  useEffect(() => {
    if (!isInitializedRef.current || !isTrackingEnabled) return;

    const currentDate = getISTDate();

    if (baseline.date !== currentDate) {
      const resetBaseline: BaselineData = {
        steps: 0,
        distance: 0,
        calories: 0,
        activeTime: 0,
        date: currentDate,
      };
      setBaseline(resetBaseline);
      saveBaseline(resetBaseline);

      const resetOffset = {
        steps: steps,
        distance: distance,
        calories: calories,
        activeTime: activeTime,
      };
      setMotionOffset(resetOffset);
      saveMotionOffset(resetOffset);

      const resetData: StepsData = {
        currentSteps: 0,
        currentDistance: 0,
        currentCalories: 0,
        currentActiveTime: 0,
        dailyGoal: localStepsData.dailyGoal,
        lastUpdated: Date.now(),
        currentDate,
      };
      setLocalStepsData(resetData);
      saveLocalData(resetData);
      lastSyncedStepsRef.current = 0;
      return;
    }

    const stepIncrement = Math.max(0, steps - motionOffset.steps);
    const distanceIncrement = Math.max(0, distance - motionOffset.distance);
    const caloriesIncrement = Math.max(0, calories - motionOffset.calories);
    const activeTimeIncrement = Math.max(0, activeTime - motionOffset.activeTime);

    const newSteps = baseline.steps + stepIncrement;
    const newDistance = baseline.distance + distanceIncrement;
    const newCalories = baseline.calories + caloriesIncrement;
    const newActiveTime = baseline.activeTime + activeTimeIncrement;

    const updatedData: StepsData = {
      currentSteps: newSteps,
      currentDistance: newDistance,
      currentCalories: newCalories,
      currentActiveTime: newActiveTime,
      dailyGoal: localStepsData.dailyGoal,
      lastUpdated: Date.now(),
      currentDate,
    };

    setLocalStepsData(updatedData);
    saveLocalData(updatedData);

    console.log('Motion update - Baseline:', baseline.steps, 'Increment:', stepIncrement, 'Total:', newSteps);
  }, [steps, distance, calories, activeTime, isTrackingEnabled]);

  // Initialize data on mount
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadLocalData(), loadBaseline(), loadTrackingState()]);

      if (isAuthenticated && token) {
        await fetchCurrentDataFromBackend(false);

        const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          if (queue.length > 0) {
            await syncOfflineQueue();
          }
        }
      }

      isInitializedRef.current = true;
    };

    initialize();
  }, []);

  // Auto-sync when steps change
  useEffect(() => {
    if (!isAuthenticated || !token || !isInitializedRef.current || !isTrackingEnabled) return;

    const shouldSync = localStepsData.currentSteps !== lastSyncedStepsRef.current;

    if (shouldSync) {
      console.log('Steps changed, will sync:', localStepsData.currentSteps);
      syncToBackend();
    }
  }, [localStepsData.currentSteps, isAuthenticated, token, isTrackingEnabled]);

  // Setup 30-second sync interval
  useEffect(() => {
    if (isAuthenticated && token && isInitializedRef.current && isTrackingEnabled) {
      console.log('Setting up 30-second sync interval');

      syncIntervalRef.current = setInterval(() => {
        console.log('30-second interval fired, syncing...');
        syncToBackend();
      }, SYNC_INTERVAL);

      return () => {
        if (syncIntervalRef.current) {
          console.log('Clearing sync interval');
          clearInterval(syncIntervalRef.current);
        }
      };
    } else {
      if (syncIntervalRef.current) {
        console.log('Tracking disabled or logged out, clearing interval');
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }
  }, [isAuthenticated, token, isTrackingEnabled]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isAuthenticated && token && isTrackingEnabled) {
      await fetchCurrentDataFromBackend(true);
    } else if (!isTrackingEnabled) {
      Alert.alert(
        'Tracking Disabled',
        'Step tracking is currently disabled. Enable it in settings to refresh data.',
        [{ text: 'OK' }]
      );
    } else {
      setIsRefreshing(true);
      await loadLocalData();
      setIsRefreshing(false);
    }
  };

  // Handle settings modal
  const handleOpenSettings = () => {
    setGoalInput(localStepsData.dailyGoal.toString());
    setSettingsVisible(true);
  };

  // Handle toggle tracking
  const handleToggleTracking = async (value: boolean) => {
    setIsTrackingEnabled(value);
    await saveTrackingState(value);

    if (!value) {
      // Clear sync interval when disabled
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }

      Alert.alert(
        'Tracking Disabled',
        'Step tracking has been disabled. No data will be recorded or synced until you enable it again.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Tracking Enabled',
        'Step tracking has been enabled. Data recording and syncing will resume.',
        [{ text: 'OK' }]
      );

      // Refresh data from backend when re-enabled
      if (isAuthenticated && token) {
        await fetchCurrentDataFromBackend(false);
      }
    }
  };

  // Update daily goal
  const handleUpdateGoal = async () => {
    const newGoal = parseInt(goalInput);

    if (isNaN(newGoal) || newGoal < 1000 || newGoal > 100000) {
      Alert.alert(
        'Invalid Goal',
        'Daily goal must be between 1,000 and 100,000 steps.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsUpdatingGoal(true);

    try {
      if (isAuthenticated && token) {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          Alert.alert(
            'No Internet Connection',
            'Please turn on your data to update your daily goal.',
            [{ text: 'OK' }]
          );
          setIsUpdatingGoal(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/goal`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dailyGoal: newGoal }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update goal');
        }

        Alert.alert(
          'Success',
          `Daily goal updated to ${newGoal.toLocaleString()} steps!`,
          [{ text: 'OK' }]
        );
      }

      const updatedData = {
        ...localStepsData,
        dailyGoal: newGoal,
      };
      setLocalStepsData(updatedData);
      await saveLocalData(updatedData);

      setSettingsVisible(false);
    } catch (error: any) {
      console.error('Update goal error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update goal. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const percentage = (localStepsData.currentSteps / localStepsData.dailyGoal) * 100;

  return (
    <SafeAreaView style={stylesTheme.container}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      >
        <Header
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onSettings={handleOpenSettings}
        />
        <StepCircle
          steps={localStepsData.currentSteps}
          goal={localStepsData.dailyGoal}
        />
        <StatsPanel
          distance={localStepsData.currentDistance}
          calories={localStepsData.currentCalories}
          activeMins={localStepsData.currentActiveTime}
          percentage={percentage}
        />
        <StepsChart isAuthenticated={isAuthenticated} token={token} />
        <BMICards />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Settings
              </Text>
              <TouchableOpacity
                onPress={() => setSettingsVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Tracking Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Enable Step Tracking
                  </Text>
                  <Text style={[styles.settingHint, { color: theme.textSecondary, marginTop: 4 }]}>
                    {isTrackingEnabled
                      ? 'Currently recording and syncing steps'
                      : 'Tracking is paused - no data will be recorded'}
                  </Text>
                </View>
                <Switch
                  value={isTrackingEnabled}
                  onValueChange={handleToggleTracking}
                  trackColor={{ false: '#767577', true: theme.primary + '80' }}
                  thumbColor={isTrackingEnabled ? theme.primary : '#f4f3f4'}
                />
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              {/* Daily Goal */}
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Daily Step Goal
              </Text>
              <TextInput
                style={[
                  styles.goalInput,
                  {
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }
                ]}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="number-pad"
                placeholder="Enter goal (1,000 - 100,000)"
                placeholderTextColor={theme.textSecondary}
                maxLength={6}
              />
              <Text style={[styles.settingHint, { color: theme.textSecondary }]}>
                Set a daily step goal between 1,000 and 100,000 steps
              </Text>

              <TouchableOpacity
                style={[
                  styles.updateButton,
                  { backgroundColor: theme.primary },
                  isUpdatingGoal && { opacity: 0.6 }
                ]}
                onPress={handleUpdateGoal}
                disabled={isUpdatingGoal}
              >
                {isUpdatingGoal ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Goal</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
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
  chartCard: {
    backgroundColor: '#0b0f12',
    borderRadius: 14,
    marginTop: 10,
    marginHorizontal: 16,
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
  yAxisContainer: {
    width: 40,
    position: 'relative',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    position: 'absolute',
    right: 8,
    fontSize: 10,
    fontWeight: '500',
  },
  loginMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loginMessageIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
    opacity: 0.5,
  },
  loginMessageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loginMessageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  settingHint: {
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  updateButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StepsScreen;