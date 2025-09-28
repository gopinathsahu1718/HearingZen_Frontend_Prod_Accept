// src/features/weather/components/SuggestionCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../../../theme";

const { width: SCREEN_W } = Dimensions.get("window");

const suggestionsByCondition = (condition: string, temp: number) => {
  if (condition?.toLowerCase().includes("rain")) {
    return ["Carry an umbrella ☔", "Drive safely on wet roads 🚗", "Wear waterproof shoes 👟"];
  }
  if (condition?.toLowerCase().includes("sun") || temp > 30) {
    return ["Stay hydrated 💧", "Wear sunscreen 🧴", "Avoid sun exposure 🌞"];
  }
  if (condition?.toLowerCase().includes("cloud")) {
    return ["Mild weather today ☁️", "Good day for outdoor walks 🚶", "Keep a light jacket handy 🧥"];
  }
  return ["Weather looks normal 🙂", "Have a productive day!", "Check forecast updates 🔄"];
};

export default function SuggestionCard({ condition, temp }: { condition: string; temp: number }) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const suggestions = suggestionsByCondition(condition, temp);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % suggestions.length;
      setIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_W, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [index, suggestions.length]);

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {suggestions.map((s, i) => (
          <View key={i} style={{ width: SCREEN_W - 64, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: theme.text, fontSize: 14, textAlign: "center" }}>{s}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Indicator dots */}
      <View style={styles.dots}>
        {suggestions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? theme.accent : theme.divider },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 10,
    height: 70, // ⬅️ Reduced height for minimalistic look
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
