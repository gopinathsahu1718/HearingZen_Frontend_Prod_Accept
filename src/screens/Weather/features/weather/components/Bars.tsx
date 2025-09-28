// src/features/weather/components/Bars.tsx
import React, { memo } from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../../../theme";
import { Day } from "../types";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export const UVBar = memo(({ uvi = 0 }: { uvi: number }) => {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, uvi / 11));
  const width = 160;
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={{ color: theme.subtext, fontSize: 12 }}>UV</Text>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>{uvi}</Text>
      <Svg width={width} height={14}>
        <Defs>
          <LinearGradient id="uvg" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#34d399" />
            <Stop offset="0.5" stopColor="#f59e0b" />
            <Stop offset="1" stopColor="#ef4444" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={5} width={width} height={4} rx={3} fill="#e6eefc" />
        <Rect x={0} y={5} width={Math.max(10, width * pct)} height={4} rx={3} fill="url(#uvg)" />
      </Svg>
    </View>
  );
});

export const PctBar = memo(({ label = "", pct = 0 }: { label?: string; pct: number }) => {
  const theme = useTheme();
  const v = Math.round(Math.min(Math.max(pct, 0), 100));
  const width = 160;
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={{ color: theme.subtext, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>{v}%</Text>
      <Svg width={width} height={12}>
        <Rect x={0} y={4} width={width} height={4} rx={3} fill="#e6eefc" />
        <Rect x={0} y={4} width={(width * v) / 100} height={4} rx={3} fill="#60a5fa" />
      </Svg>
    </View>
  );
});

export const AQIBar = memo(({ aqi }: { aqi?: number }) => {
  const theme = useTheme();
  const width = 160;
  if (aqi == null) {
    return <Text style={{ color: theme.text }}>—</Text>;
  }
  const pct = Math.min(1, aqi / 500);
  return (
    <View style={{ alignItems: "flex-start" }}>
      <Text style={{ color: theme.subtext, fontSize: 12 }}>AQI</Text>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>{aqi}</Text>
      <Svg width={width} height={12}>
        <Defs>
          <LinearGradient id="aqi" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#16a34a" />
            <Stop offset="0.3" stopColor="#a3e635" />
            <Stop offset="0.5" stopColor="#f59e0b" />
            <Stop offset="0.7" stopColor="#f97316" />
            <Stop offset="0.9" stopColor="#ef4444" />
            <Stop offset="1.0" stopColor="#7c1d6f" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={4} width={width} height={4} rx={3} fill="#e6eefc" />
        <Rect x={0} y={4} width={Math.max(10, width * pct)} height={4} rx={3} fill="url(#aqi)" />
      </Svg>
    </View>
  );
});

export const WindMeter = memo(({ kph = 0 }: { kph: number }) => {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, kph / 100));
  const width = 160;
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Text style={{ color: theme.subtext, fontSize: 12 }}>Wind</Text>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>{kph} km/h</Text>
      <Svg width={width} height={12}>
        <Rect x={0} y={5} width={width} height={3} rx={3} fill="#e6eefc" />
        <Rect x={0} y={5} width={Math.max(10, width * pct)} height={3} rx={3} fill="#60a5fa" />
      </Svg>
    </View>
  );
});

/** Seven-day bar chart using react-native-chart-kit */
export const SevenDayChart = memo(
  ({ days = [] }: { days?: Day[] }) => {
    const labels = days.map((d) => {
      try {
        return new Date(d.date).toLocaleDateString(undefined, { weekday: "short" });
      } catch {
        return d.date;
      }
    });

    const dataset = days.map((d) => d.tempMax || 0);

    const data = {
      labels,
      datasets: [{ data: dataset }],
    };

    return (
      <View style={{ marginTop: 8 }}>
        <BarChart
          data={data}
          width={Math.min(340, screenWidth - 48)}
          height={140}
          yAxisLabel={""}
          fromZero
          yAxisSuffix={"°"}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            style: { borderRadius: 8 },
          }}
          style={{ borderRadius: 8 }}
          showValuesOnTopOfBars
        />
      </View>
    );
  }
);
