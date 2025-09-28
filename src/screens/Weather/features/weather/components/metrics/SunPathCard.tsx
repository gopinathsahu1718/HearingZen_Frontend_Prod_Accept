// src/features/weather/components/metrics/SunPathCard.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, Image } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "../../../../theme";

// Replace with your FlatIcon assets
const sunIcon = require("../../../../../../assets/weather/sun.png");
const sunriseIcon = require("../../../../../../assets/weather/sun.png");
const sunsetIcon = require("../../../../../../assets/weather/sunset.png");

export default function SunPathCard({
  sunrise,
  sunset,
}: {
  sunrise: string;
  sunset: string;
}) {
  const theme = useTheme();

  const riseDate = new Date(sunrise);
  const setDate = new Date(sunset);
  const now = new Date();

  const rise = riseDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const set = setDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Progress (0 sunrise → 1 sunset)
  const progress = Math.min(
    1,
    Math.max(
      0,
      (now.getTime() - riseDate.getTime()) /
        (setDate.getTime() - riseDate.getTime())
    )
  );

  const animProgress = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: progress,
      duration: 1200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Arc geometry
  const arcStartX = 20;
  const arcEndX = 230;
  const arcY = 100;
  const radius = 100;
  const centerX = 125;
  const centerY = arcY;

  // Angle (π → 0)
  const angle = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.PI, 0],
  });

  // Instead of Animated.sin/cos → map progress directly
  const sunX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [arcStartX, arcEndX],
  });

  const sunY = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [arcY, arcY - radius, arcY], // semi-circle path
  });

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        shadowColor: "#cecdf7ff",
        shadowOpacity: 3,
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      {/* Title */}
      <Text style={{ color: theme.text, fontWeight: "600", marginBottom: 12 }}>
        Sunrise & Sunset
      </Text>

      {/* Arc with moving sun */}
      <View style={{ alignItems: "center" }}>
        <Svg height="120" width="250" viewBox="0 0 250 120">
          {/* Arc path */}
          <Path
            d="M20 100 A100 100 0 0 1 230 100"
            stroke="#3b82f6"
            strokeDasharray="4 6"
            strokeWidth="2"
            fill="none"
          />

          {/* Sunrise & Sunset markers */}
          <Circle cx="20" cy="100" r="6" fill="#fbbf24" />
          <Circle cx="230" cy="100" r="6" fill="#f87171" />
        </Svg>

        {/* Sun icon */}
        <Animated.View
          style={{
            position: "absolute",
            left: Animated.subtract(sunX, 12),
            top: Animated.subtract(sunY, 12),
          }}
        >
          <Image source={sunIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Animated.View>
      </View>

      {/* Labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          paddingHorizontal: 12,
          marginTop: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={sunriseIcon} style={{ width: 18, height: 18, marginRight: 4 }} />
          <Text style={{ color: theme.subtext }}>{rise}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={sunsetIcon} style={{ width: 18, height: 18, marginRight: 4 }} />
          <Text style={{ color: theme.subtext }}>{set}</Text>
        </View>
      </View>
    </View>
  );
}
