// src/features/weather/components/ForecastChartCard.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "../../../theme";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ForecastChartCard({
  days = [],
  onDayPress
}: {
  days: any[];
  title?: string;
  onDayPress?: (i: number) => void;
}) {
  const theme = useTheme();

  // take only 5 days for forecast
  const forecastDays = days.slice(0, 5);

  // format labels into "Sept 23"
  const labels = forecastDays.map((d: any) => {
    const dateObj = new Date(d.date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });

  const dataPoints = forecastDays.map((d: any) =>
    Number.isFinite(d.tempMax) ? d.tempMax : 0
  );

  const data = {
    labels: labels.length ? labels : [""],
    datasets: [
      {
        data: dataPoints.length ? dataPoints : [0],
        color: (opacity = 1) => theme.accent, // line color
        strokeWidth: 2,
      },
    ],
  };

  const chartWidth = Math.min(360, SCREEN_W - 48);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.accent,
    labelColor: (opacity = 1) => theme.subtext,
    strokeWidth: 2,
    barPercentage: 0.5,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.accent,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: theme.divider,
      strokeOpacity: 0.3,
    },
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.divider },
      ]}
    >
      <LineChart
        data={data}
        width={chartWidth}
        height={170}
        chartConfig={chartConfig}
        style={{
          borderRadius: 12,
          alignSelf: "center",
        }}
        bezier
        fromZero
        yAxisLabel=""
        yAxisSuffix="°"
        withInnerLines
        withOuterLines
        withVerticalLines
        withHorizontalLines
        withDots
        withShadow={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
});
