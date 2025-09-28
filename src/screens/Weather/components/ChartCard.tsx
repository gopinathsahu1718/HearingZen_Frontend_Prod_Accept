// src/components/ChartCard.tsx
import React, { ReactNode } from "react";
import { View, Text } from "react-native";
import { Card } from "react-native-paper";

type Props = {
  title: string;
  icon: string;
  children: ReactNode;
};

export default function ChartCard({ title, icon, children }: Props) {
  return (
    <Card style={{ marginVertical: 10, borderRadius: 12, padding: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
        {icon} {title}
      </Text>
      <View style={{ alignItems: "center" }}>{children}</View>
    </Card>
  );
}
