// src/features/weather/components/DailyChart.tsx
import React, { memo } from "react";
import { View, Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { useTheme } from "../../../theme";
import { Day } from "../types";

export const DailyChart = memo(
  ({ days, height = 160 }: { days: Day[]; height?: number }) => {
    const theme = useTheme();
    const width = Math.min(Dimensions.get("window").width - 32, 360);

    const vals = (days || [])
      .slice(0, 7)
      .map((d) => Number(d?.tempMax))
      .filter((v) => Number.isFinite(v));

    if (!vals.length) return <View style={{ height, width }} />;

    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const range = Math.max(1, max - min);
    const stepX = vals.length > 1 ? width / (vals.length - 1) : 0;

    const pts = vals.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? height : y };
    });

    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

    return (
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.accent} stopOpacity={0.9} />
            <Stop offset="1" stopColor={theme.accent} stopOpacity={0.3} />
          </LinearGradient>
        </Defs>

        {d && <Path d={d} fill="none" stroke="url(#g)" strokeWidth={3} />}

        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={theme.accent} />
        ))}
      </Svg>
    );
  }
);
