// src/features/weather/components/ExpandableSearch.tsx
import React, { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../theme";

export default function ExpandableSearch({ onSearch }: { onSearch?: (s: string) => void }) {
  const theme = useTheme();
  const [q, setQ] = useState("");

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.mode === "dark" ? "#3b82f6" : "#e5e7eb",
        },
      ]}
    >
      {/* Input field for city search */}
      <TextInput
        placeholder="Search city..."
        placeholderTextColor={theme.subtext}
        value={q}
        onChangeText={setQ}
        style={{
          flex: 1,
          color: theme.text,
          height: 44,
        }}
      />

      {/* Search button */}
      <Pressable
        onPress={() => {
          if (q.trim()) {
            onSearch?.(q.trim());
          }
        }}
        style={{ padding: 8 }}
      >
        <Text>🔍</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
