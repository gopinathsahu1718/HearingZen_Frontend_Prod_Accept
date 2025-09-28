// src/features/weather/components/metrics/AQICard.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "../../../../theme";

type Props = {
  current: any;
};

export default function AQICard({ current }: Props) {
  const theme = useTheme();
  const aqi = current?.aqi ?? 88;

  // AQI Status
  const status =
    aqi <= 50
      ? "Good"
      : aqi <= 100
      ? "Moderate"
      : aqi <= 150
      ? "Unhealthy"
      : "Poor";

  // Semi-circle arc calculation
  const radius = 45;
  const circumference = Math.PI * radius;
  const progress = Math.min(aqi / 200, 1); // Normalize 0–200
  const strokeDasharray = `${circumference * progress}, ${circumference}`;

  // Pollutants dummy values
  const pollutants = [
    { label: "PM2.5", value: current?.pm25 ?? 60 },
    { label: "PM10", value: current?.pm10 ?? 40 },
    { label: "CO", value: current?.co ?? 1.2 },
    { label: "SO₂", value: current?.so2 ?? 8 },
  ];

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        shadowColor: "#cecdf7ff",
        shadowOpacity: 3,
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      {/* Left: AQI Gauge */}
      <View style={{ width: 120, alignItems: "center" }}>
        <Svg height="100" width="120" viewBox="0 0 120 60">
          {/* Gray track */}
          <Path
            d="M10 60 A50 50 0 0 1 110 60"
            stroke={theme.divider}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          {/* Blue progress */}
          <Path
            d="M10 60 A50 50 0 0 1 110 60"
            stroke="#3b82f6"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
          />
        </Svg>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>
          {aqi}
        </Text>
        <Text style={{ color: theme.subtext, fontSize: 12 }}>AQI</Text>
        <Text
          style={{ color: theme.text, fontSize: 14, fontWeight: "600", marginTop: 4 }}
        >
          {status}
        </Text>
      </View>

      {/* Right: Pollutant Bars */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          paddingLeft: 8,
        }}
      >
        {pollutants.map((p, i) => {
          const pct = Math.min(p.value / 200, 1); // normalize
          return (
            <View
              key={i}
              style={{
                width: "45%",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              {/* Bar + Value */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 6,
                    height: 50,
                    borderRadius: 3,
                    backgroundColor: theme.divider,
                    overflow: "hidden",
                    marginRight: 6,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#3b82f6",
                      borderRadius: 3,
                      transform: [{ scaleY: pct }],
                      transformOrigin: "bottom",
                    }}
                  />
                </View>
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  {p.value}
                </Text>
              </View>
              {/* Label */}
              <Text
                style={{
                  color: theme.subtext,
                  fontSize: 12,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {p.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
