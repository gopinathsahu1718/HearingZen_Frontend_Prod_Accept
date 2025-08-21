import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    ListRenderItemInfo,
    GestureResponderEvent,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Svg, {
    Path,
    Circle,
    Defs,
    LinearGradient,
    Stop,
    Text as SvgText,
    Line,
} from 'react-native-svg';

interface Point {
    x: number;
    y: number;
}

interface PeriodData {
    points: Point[];
    labels: string[];
}

const WaveGraph: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'Month' | 'Week' | 'Day'>('Week');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [screenData, setScreenData] = useState(Dimensions.get('window'));

    const periodOptions: Array<'Month' | 'Week' | 'Day'> = ['Month', 'Week', 'Day'];

    useEffect(() => {
        const onChange = ({ window }: { window: { width: number; height: number } }) => {
            setScreenData(window);
        };

        const subscription = Dimensions.addEventListener('change', onChange);
        return () => {
            subscription?.remove();
        };
    }, []);

    const screenWidth = screenData.width;
    const isSmallScreen = screenWidth < 350;
    const isMediumScreen = screenWidth >= 350 && screenWidth < 400;

    const width = Math.min(screenWidth - 32, 400);
    const height = isSmallScreen ? 120 : isMediumScreen ? 130 : 150;

    const getDataForPeriod = (period: 'Month' | 'Week' | 'Day'): PeriodData => {
        const heightMultiplier = isSmallScreen ? 0.6 : 0.7;

        switch (period) {
            case 'Month':
                return {
                    points: [
                        { x: 0, y: 70 * heightMultiplier },
                        { x: width * 0.1, y: 85 * heightMultiplier },
                        { x: width * 0.2, y: 95 * heightMultiplier },
                        { x: width * 0.3, y: 110 * heightMultiplier },
                        { x: width * 0.4, y: 80 * heightMultiplier },
                        { x: width * 0.5, y: 90 * heightMultiplier },
                        { x: width * 0.6, y: 105 * heightMultiplier },
                        { x: width * 0.7, y: 120 * heightMultiplier },
                        { x: width * 0.8, y: 100 * heightMultiplier },
                        { x: width * 0.9, y: 115 * heightMultiplier },
                        { x: width, y: 95 * heightMultiplier },
                    ],
                    labels: isSmallScreen ? ['W1', 'W2', 'W3', 'W4'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                };
            case 'Week':
                return {
                    points: [
                        { x: 0, y: 80 * heightMultiplier },
                        { x: width * 0.15, y: 40 * heightMultiplier },
                        { x: width * 0.3, y: 100 * heightMultiplier },
                        { x: width * 0.45, y: 60 * heightMultiplier },
                        { x: width * 0.6, y: 90 * heightMultiplier },
                        { x: width * 0.75, y: 120 * heightMultiplier },
                        { x: width * 0.9, y: 70 * heightMultiplier },
                        { x: width, y: 30 * heightMultiplier },
                    ],
                    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                };
            case 'Day':
                return {
                    points: [
                        { x: 0, y: 20 * heightMultiplier },
                        { x: width * 0.1, y: 30 * heightMultiplier },
                        { x: width * 0.2, y: 45 * heightMultiplier },
                        { x: width * 0.3, y: 70 * heightMultiplier },
                        { x: width * 0.4, y: 85 * heightMultiplier },
                        { x: width * 0.5, y: 95 * heightMultiplier },
                        { x: width * 0.6, y: 110 * heightMultiplier },
                        { x: width * 0.7, y: 105 * heightMultiplier },
                        { x: width * 0.8, y: 90 * heightMultiplier },
                        { x: width * 0.9, y: 75 * heightMultiplier },
                        { x: width, y: 60 * heightMultiplier },
                    ],
                    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
                };
        }
    };

    const currentData = getDataForPeriod(selectedPeriod);
    const dataPoints = currentData.points;
    const labels = currentData.labels;

    const generateSmoothCurve = (points: Point[], offset = 0): string => {
        if (points.length < 2) return '';
        let path = `M ${points[0].x} ${points[0].y + offset}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const current = points[i];
            const next = points[i + 1];

            const tension = 0.3;
            const cp1x = prev.x + (current.x - (points[i - 2] || prev).x) * tension;
            const cp1y = prev.y + (current.y - (points[i - 2] || prev).y) * tension + offset;
            const cp2x = current.x - (next || current).x * tension + current.x * tension;
            const cp2y = current.y - (next || current).y * tension + current.y * tension + offset;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y + offset}`;
        }

        return path;
    };

    const generateSmoothCurveWithFill = (points: Point[], offset = 0): string => {
        const curve = generateSmoothCurve(points, offset);
        return `${curve} L ${width} ${height} L 0 ${height} Z`;
    };

    const renderDropdownItem = ({ item }: ListRenderItemInfo<'Month' | 'Week' | 'Day'>) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
                setSelectedPeriod(item);
                setIsDropdownVisible(false);
            }}
        >
            <Text style={styles.dropdownItemText}>{item}</Text>
        </TouchableOpacity>
    );

    const responsiveStyles: {
        [key: string]: ViewStyle | TextStyle;
    } = {
        container: {
            ...styles.container,
            paddingHorizontal: isSmallScreen ? 12 : 16,
            paddingVertical: isSmallScreen ? 6 : 8,
        },
        title: {
            ...styles.title,
            fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : 18,
        },
        dropdown: {
            ...styles.dropdown,
            paddingHorizontal: isSmallScreen ? 8 : 12,
            paddingVertical: isSmallScreen ? 4 : 6,
            marginLeft: isSmallScreen ? 8 : 12,
        },
        dropdownText: {
            ...styles.dropdownText,
            fontSize: isSmallScreen ? 12 : 14,
            marginRight: isSmallScreen ? 6 : 8,
        },
        header: {
            ...styles.header,
            marginBottom: isSmallScreen ? 8 : 12,
        },
    };

    const mainCurvePath = generateSmoothCurve(dataPoints);
    const secondaryCurvePath = generateSmoothCurve(dataPoints, isSmallScreen ? 14 : 20 * 0.7);
    const mainFillPath = generateSmoothCurveWithFill(dataPoints);
    const secondaryFillPath = generateSmoothCurveWithFill(dataPoints, isSmallScreen ? 14 : 20 * 0.7);

    const lineYPositions = [height * 0.25, height * 0.5, height * 0.75];

    return (
        <View style={responsiveStyles.container as ViewStyle}>
            <View style={responsiveStyles.header as ViewStyle}>
                <View style={styles.leftSection}>
                    <Text style={responsiveStyles.title as TextStyle}>Report</Text>
                    <TouchableOpacity
                        style={responsiveStyles.dropdown as ViewStyle}
                        onPress={() => setIsDropdownVisible(true)}
                    >
                        <Text style={responsiveStyles.dropdownText as TextStyle}>{selectedPeriod}</Text>
                        <Text style={[styles.dropdownArrow, { fontSize: isSmallScreen ? 8 : 10 }]}>▼</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={isDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDropdownVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdownModal,
                            {
                                maxWidth: isSmallScreen ? 80 : 90,
                                marginTop: 390,
                            },
                        ]}
                    >
                        <FlatList
                            data={periodOptions}
                            renderItem={renderDropdownItem}
                            keyExtractor={item => item}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            <View style={styles.svgContainer}>
                <Svg width={width} height={height + 20} style={styles.svg}>
                    <Defs>
                        <LinearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#00D4AA" />
                            <Stop offset="100%" stopColor="#00B4D8" />
                        </LinearGradient>
                        <LinearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#0077BE" stopOpacity={0.8} />
                            <Stop offset="100%" stopColor="#005577" stopOpacity={0.6} />
                        </LinearGradient>
                        <LinearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#00D4AA" stopOpacity={0.3} />
                            <Stop offset="50%" stopColor="#00B4D8" stopOpacity={0.2} />
                            <Stop offset="100%" stopColor="#00B4D8" stopOpacity={0.05} />
                        </LinearGradient>
                        <LinearGradient id="secondaryFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#0077BE" stopOpacity={0.2} />
                            <Stop offset="50%" stopColor="#005577" stopOpacity={0.15} />
                            <Stop offset="100%" stopColor="#005577" stopOpacity={0.03} />
                        </LinearGradient>
                    </Defs>

                    {lineYPositions.map((y, index) => (
                        <Line
                            key={index}
                            x1={0}
                            y1={y}
                            x2={width}
                            y2={y}
                            stroke="#444"
                            strokeWidth={isSmallScreen ? 0.5 : 1}
                            strokeDasharray="4,4"
                        />
                    ))}

                    <Path d={secondaryFillPath} fill="url(#secondaryFillGradient)" />
                    <Path d={mainFillPath} fill="url(#fillGradient)" />
                    <Path d={secondaryCurvePath} fill="none" stroke="url(#secondaryGradient)" strokeWidth={isSmallScreen ? 2 : 3} />
                    <Path d={mainCurvePath} fill="none" stroke="url(#mainGradient)" strokeWidth={isSmallScreen ? 2 : 3} />

                    {dataPoints.map((point, index) => (
                        <Circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r={isSmallScreen ? 3 : 5}
                            fill="#fff"
                            stroke="url(#mainGradient)"
                            strokeWidth={isSmallScreen ? 1.5 : 2}
                        />
                    ))}

                    {/* Highlighted point */}
                    <Circle
                        cx={dataPoints[1].x}
                        cy={dataPoints[1].y - (isSmallScreen ? 14 : 20 * 0.7)}
                        r={isSmallScreen ? 5 : 7}
                        fill="#00D4AA"
                        stroke="#fff"
                        strokeWidth={isSmallScreen ? 1.5 : 2}
                    />
                    <Circle
                        cx={dataPoints[1].x}
                        cy={dataPoints[1].y - (isSmallScreen ? 14 : 20 * 0.7)}
                        r={isSmallScreen ? 8 : 10}
                        fill="none"
                        stroke="#00D4AA"
                        strokeWidth={isSmallScreen ? 1.5 : 2}
                        opacity={0.5}
                    />

                    {/* Labels */}
                    {labels.map((label, index) => (
                        <SvgText
                            key={index}
                            x={(width / Math.max(labels.length - 1, 1)) * index}
                            y={height + (isSmallScreen ? 15 : 18)}
                            fontSize={isSmallScreen ? 10 : 12}
                            fill="#666"
                            textAnchor="middle"
                            fontFamily="System"
                        >
                            {label}
                        </SvgText>
                    ))}
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0e0e0e',
        borderRadius: 12,
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    dropdownText: {
        color: '#fff',
        fontWeight: '500',
    },
    dropdownArrow: {
        color: '#888',
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 0,
    },
    dropdownModal: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
        minWidth: 80,
        maxHeight: 110,
        height: 110,
    },
    dropdownItem: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dropdownItemText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    svgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    svg: {
        overflow: 'visible',
    },
});

export default WaveGraph;
