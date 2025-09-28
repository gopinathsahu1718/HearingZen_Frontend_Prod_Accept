// src/features/weather/components/Shimmer.tsx
import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { useTheme } from "../../../theme";

export default function Shimmer({ height = 18, width = 120, style }: { height?: number | `${number}%`; width?: number | `${number}%`; style?: ViewStyle }) {
  const theme = useTheme();
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [v]);

  const bg = v.interpolate({ inputRange: [0, 1], outputRange: [theme.shimmerA, theme.shimmerB] });

  return <Animated.View style={[{ height, width, borderRadius: 10, backgroundColor: bg }, style]} />;
}
