// src/features/weather/components/WeatherHeader.tsx
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../../theme";
import { Current } from "../types";

export default function WeatherHeader({ place, c }: { place: string; c: Current }) {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 6 }}>
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>{place}</Text>
      <Text style={{ color: theme.text, fontSize: 46, fontWeight: "200", lineHeight: 46 }}>{Math.round(c.temperature)}°</Text>
      <Text style={{ color: theme.text, fontSize: 16 }}>{c.condition}</Text>
      <Text style={{ color: theme.subtext, marginTop: 6 }}>{`↑${Math.round(c.high)}° · ↓${Math.round(c.low)}° · Feels ${Math.round(c.apparent)}°`}</Text>
    </View>
  );
}
