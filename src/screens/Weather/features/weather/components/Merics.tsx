// src/features/weather/components/Metrics.tsx
import React from "react";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useTheme } from "../../../theme";

export function SmallBar({ value }: { value: number }) {
  const theme = useTheme();
  const cfg = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.accent,
    labelColor: () => theme.subtext,
  };
  return (
    <BarChart
      data={{ labels: [""], datasets: [{ data: [Math.max(0, Math.round(value || 0))] }] }}
      width={140}
      height={60}
      yAxisLabel={""}
      yAxisSuffix={""}
      chartConfig={cfg}
      fromZero
      withHorizontalLabels={false}
      style={{ borderRadius: 8 }}
    />
  );
}

export function SmallLine({ points }: { points: number[] }) {
  const theme = useTheme();
  const cfg = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.accent,
    labelColor: () => theme.subtext,
  };
  return (
    <LineChart
      data={{ labels: points.map(()=>""), datasets: [{ data: points }] }}
      width={140}
      height={60}
      yAxisLabel={""}
      yAxisSuffix={""}
      chartConfig={cfg}
      withHorizontalLabels={false}
      withVerticalLabels={false}
      fromZero
      style={{ borderRadius: 8 }}
    />
  );
}
