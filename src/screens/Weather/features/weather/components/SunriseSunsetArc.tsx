import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "../../../theme";

export default function SunriseSunsetArc({
  sunrise,
  sunset,
}: {
  sunrise: string;
  sunset: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
      }}
    >
      <Text style={{ color: theme.text, marginBottom: 8 }}>
        Sunrise → Sunset
      </Text>
      <Svg width={220} height={120}>
        <Path
          d="M 20 100 A 90 90 0 0 1 200 100"
          stroke={theme.accent}
          strokeWidth={3}
          fill="none"
        />
        <Circle cx="20" cy="100" r="6" fill="orange" />
        <Circle cx="200" cy="100" r="6" fill="red" />
      </Svg>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 6,
        }}
      >
        <Text style={{ color: theme.subtext }}>🌅 {sunrise}</Text>
        <Text style={{ color: theme.subtext }}>🌇 {sunset}</Text>
      </View>
    </View>
  );
}
