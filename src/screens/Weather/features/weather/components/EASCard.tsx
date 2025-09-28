// src/features/weather/components/metrics/EASCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../theme";

export type Alert = {
  title: string;
  description: string;
  severity: string;
};

type Props = {
  alerts?: Alert[];
};

export default function EASCard({ alerts = [] }: Props) {
  const theme = useTheme();

  const hasAlerts = alerts && alerts.length > 0;

  return (
    <View
      style={[
        
        styles.card,
        { backgroundColor: theme.card },
        
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Emergency Alerts
      </Text>

      {!hasAlerts ? (
        <Text style={{ color: theme.subtext }}>
          No emergency alerts at the moment.
        </Text>
      ) : (
        alerts.map((a, idx) => (
          <View key={idx} style={{ marginBottom: 10 }}>
            <Text style={{ color: theme.accent, fontWeight: "600" }}>
              ⚠️ {a.title}
            </Text>
            <Text style={{ color: theme.subtext }}>{a.description}</Text>
            <Text style={{ color: theme.text, fontSize: 12 }}>
              Severity: {a.severity}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 6,
  },
});
