import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");
const BASE_SIZE = 200; // Base size reference for responsiveness
const SIZE = width * 0.5; // Circle scales with screen width
const STROKE_WIDTH = SIZE * 0.06;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StepCircle({ steps = 7000, goal = 10000 }) {
    const progress = steps / goal;
    const strokeDashoffset = CIRCUMFERENCE - CIRCUMFERENCE * progress;

    // Change color when goal is hit
    const progressColor = steps >= goal ? "#00FF7F" : "#00BFFF"; // Green if reached

    return (
        <View style={styles.container}>
            {/* Shadow Effect */}
            <View style={styles.shadowWrapper}>
                <View style={[styles.shadowCircle, { width: SIZE + 25, height: SIZE + 25, borderRadius: (SIZE + 25) / 2 }]} />
            </View>

            {/* Progress Circle */}
            <Svg width={SIZE} height={SIZE}>
                {/* Background circle */}
                <Circle
                    stroke="#1e1e2d"
                    fill="none"
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                />

                {/* Progress circle */}
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

            {/* Center content */}
            <View style={styles.centerContent}>
                <Image
                    source={require("../../assets/stepIcons/footprint.png")}
                    style={[styles.icon, { width: SIZE * 0.25, height: SIZE * 0.25 }]}
                />
                <Text style={[styles.steps, { fontSize: SIZE * 0.14 }]}>{steps}</Text>
                <Text style={[styles.goal, { fontSize: SIZE * 0.07 }]}>Goal: {goal}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginTop: -30,
    },
    shadowWrapper: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    shadowCircle: {
        backgroundColor: "transparent",
        shadowColor: "#00BFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 12, // For Android
    },
    centerContent: {
        position: "absolute",
        alignItems: "center",
    },
    icon: {
        marginTop: -20,
        resizeMode: "contain",
    },
    steps: {
        fontWeight: "bold",
        color: "#fff",
    },
    goal: {
        color: "#bbb",
    },
});
