// src/features/weather/components/MetricCard.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "../../../theme";

export default function MetricCard({ title, value, subtitle, right, onPress }: { title: string; value: string; subtitle?: string; right?: React.ReactNode; onPress?: ()=>void }) {
  const theme = useTheme();
  const Container:any = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} style={{ backgroundColor: theme.card, borderRadius: 16, padding: 12, flexDirection: "row", alignItems:"center", gap:12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.subtext, fontSize: 12 }}>{title}</Text>
        {subtitle ? <Text style={{ color: theme.subtext, fontSize: 12 }}>{subtitle}</Text> : null}
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>{value}</Text>
      </View>
      {right}
    </Container>
  );
}
