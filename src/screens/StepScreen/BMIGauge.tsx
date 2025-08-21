import React from 'react';
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
    Path,
    Line,
    Circle,
    Text as SvgText,
    G,
    Rect,
} from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function BMIGauge({ bmi = 20.1 }) {
    const [animatedBMI, setAnimatedBMI] = useState(15);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedBMI(bmi);
        }, 100);
        return () => clearTimeout(timer);
    }, [bmi]);

    const minBMI = 15;
    const maxBMI = 40;
    const range = maxBMI - minBMI;

    // Map BMI to degrees for semi-circle (180° to 360°)
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, animatedBMI));
    const percentage = (clampedBMI - minBMI) / range;
    const rotation = 180 + (percentage * 180); // 180° to 360°

    // BMI categories with refined colors
    const categories = [
        {
            min: 15,
            max: 18.5,
            label: 'Underweight',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
        },
        {
            min: 18.5,
            max: 25,
            label: 'Normal Weight',
            color: '#10B981',
            lightColor: '#D1FAE5',
        },
        {
            min: 25,
            max: 30,
            label: 'Overweight',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
        },
        {
            min: 30,
            max: 40,
            label: 'Obese',
            color: '#EF4444',
            lightColor: '#FEE2E2',
        },
    ];

    const getCurrentCategory = () => {
        const bmiValue = Number(bmi);
        return (
            categories.find(cat => bmiValue >= cat.min && bmiValue < cat.max) ||
            categories[categories.length - 1]
        );
    };

    const currentCategory = getCurrentCategory();

    // Generate tick marks
    const tickMarks = [16, 18.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40];
    const majorTicks = [18.5, 25, 30];

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>BMI Assessment</Text>
                    <Text style={styles.subtitle}>Body Mass Index Calculator</Text>
                </View>

                {/* Gauge Container */}
                <View style={styles.gaugeContainer}>
                    <Svg width={280} height={200}>
                        {/* Background Semi-Circle 180° to 360° */}

                        {/* Category Arcs - Semi-Circle 180° to 360° */}
                        {categories.map((category, index) => {
                            const startPercentage = (category.min - minBMI) / range;
                            const endPercentage = Math.min(
                                (category.max - minBMI) / range,
                                1,
                            );
                            const startAngle = 180 + (startPercentage * 180); // Start from 180°
                            const endAngle = 180 + (endPercentage * 180); // End at up to 360°

                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;

                            const outerRadius = 100;
                            const innerRadius = 60;

                            // Outer arc points
                            const x1_outer = 140 + outerRadius * Math.cos(startRad);
                            const y1_outer = 140 + outerRadius * Math.sin(startRad);
                            const x2_outer = 140 + outerRadius * Math.cos(endRad);
                            const y2_outer = 140 + outerRadius * Math.sin(endRad);

                            // Inner arc points
                            const x1_inner = 140 + innerRadius * Math.cos(startRad);
                            const y1_inner = 140 + innerRadius * Math.sin(startRad);
                            const x2_inner = 140 + innerRadius * Math.cos(endRad);
                            const y2_inner = 140 + innerRadius * Math.sin(endRad);

                            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                            return (
                                <Path
                                    key={index}
                                    d={`M ${x1_outer} ${y1_outer} 
                      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2_outer} ${y2_outer}
                      L ${x2_inner} ${y2_inner}
                      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1_inner} ${y1_inner}
                      Z`}
                                    fill={category.color}
                                    stroke="white"
                                    strokeWidth={1}
                                />
                            );
                        })}

                        {/* Tick Marks */}
                        {tickMarks.map((tick, index) => {
                            const tickPercentage = (tick - minBMI) / range;
                            const tickAngle = (180 + (tickPercentage * 180)) * Math.PI / 180;
                            const isMajor = majorTicks.includes(tick);

                            const innerRadius = isMajor ? 105 : 108;
                            const outerRadius = 120;

                            const x1 = 140 + innerRadius * Math.cos(tickAngle);
                            const y1 = 140 + innerRadius * Math.sin(tickAngle);
                            const x2 = 140 + outerRadius * Math.cos(tickAngle);
                            const y2 = 140 + outerRadius * Math.sin(tickAngle);

                            return (
                                <G key={index}>
                                    <Line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke="#374151"
                                        strokeWidth={isMajor ? 2 : 1}
                                    />
                                    {isMajor && (
                                        <SvgText
                                            x={140 + 135 * Math.cos(tickAngle)}
                                            y={140 + 135 * Math.sin(tickAngle)}
                                            textAnchor="middle"
                                            fontSize={12}
                                            fill="#6B7280"
                                            fontWeight="500"
                                        >
                                            {tick}
                                        </SvgText>
                                    )}
                                </G>
                            );
                        })}

                        {/* Needle */}
                        <Line
                            x1={140}
                            y1={140}
                            x2={140 + 90 * Math.cos((rotation * Math.PI) / 180)}
                            y2={140 + 90 * Math.sin((rotation * Math.PI) / 180)}
                            stroke={currentCategory.color}
                            strokeWidth={3}
                            strokeLinecap="round"
                        />

                        {/* Center Hub */}
                        <Circle cx={140} cy={140} r={8} fill="#1F2937" />
                        <Circle cx={140} cy={140} r={4} fill="#F3F4F6" />

                        {/* BMI Value Display */}
                        <Rect
                            x={110}
                            y={160}
                            width={60}
                            height={25}
                            rx={12}
                            fill="white"
                            stroke="#030304ff"
                            strokeWidth={1}
                        />
                        <SvgText
                            x={140}
                            y={179}
                            textAnchor="middle"
                            fontSize={18}
                            fill="#1F2937"
                            fontWeight="bold"
                        >
                            {Number(bmi).toFixed(1)}
                        </SvgText>
                    </Svg>
                </View>

                {/* Status Card */}
                <View
                    style={[
                        styles.statusCard,
                        {
                            backgroundColor: currentCategory.lightColor,
                            borderLeftColor: currentCategory.color,
                        },
                    ]}
                >
                    <View style={styles.statusRow}>
                        <View style={styles.statusTextContainer}>
                            <Text
                                style={[styles.statusLabel, { color: currentCategory.color }]}
                            >
                                {currentCategory.label}
                            </Text>
                            <Text style={styles.statusValue}>
                                BMI: {Number(bmi).toFixed(1)} kg/m²
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: currentCategory.color },
                            ]}
                        />
                    </View>
                </View>

                {/* Reference Guide */}
                <View style={styles.referenceGuide}>
                    <Text style={styles.referenceTitle}>BMI Categories</Text>
                    <View style={styles.referenceGrid}>
                        {categories.map((cat, index) => (
                            <View key={index} style={styles.referenceRow}>
                                <View
                                    style={[styles.referenceDot, { backgroundColor: cat.color }]}
                                />
                                <Text style={styles.referenceText}>
                                    {cat.label}: {cat.min}-{cat.max === 40 ? '40+' : cat.max}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.referenceFooter}>
                        <Text style={styles.referenceFooterText}>
                            Healthy BMI range: 18.5 - 25.0 kg/m²
                        </Text>
                    </View>
                </View>

                {/* Disclaimer */}
                <Text style={styles.disclaimer}>
                    This BMI calculation is for informational purposes only. Consult with
                    a healthcare professional for personalized advice.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
        paddingHorizontal: 6,
        marginRight: 0,
        backgroundColor: '#18191aff',
    },
    container: {
        backgroundColor: '#ffffffff',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        width: '100%',
        maxWidth: 340,
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    gaugeContainer: {
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
        maxWidth: 340,
        alignSelf: 'center',
    },
    statusCard: {
        width: '100%',
        maxWidth: 340,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        marginBottom: 24,
        alignSelf: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusTextContainer: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    referenceGuide: {
        width: '100%',
        maxWidth: 340,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
        alignSelf: 'center',
    },
    referenceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
        textAlign: 'center',
    },
    referenceGrid: {
        gap: 8,
    },
    referenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    referenceDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    referenceText: {
        fontSize: 13,
        color: '#374151',
        flex: 1,
    },
    referenceFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        alignItems: 'center',
    },
    referenceFooterText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    disclaimer: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 16,
        maxWidth: 320,
    },
});