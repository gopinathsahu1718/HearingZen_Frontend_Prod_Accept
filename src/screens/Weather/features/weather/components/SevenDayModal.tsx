import React, { useEffect, useMemo, useRef } from "react";
import { Modal, View, Text, Pressable, FlatList, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../../theme";
import { Day } from "../types";
import { fmtTemp } from "../utils";

export default function SevenDayModal({
  visible,
  days = [],
  onClose,
  place,
  selectedIndex = 0,
}: {
  visible: boolean;
  days: Day[];
  onClose: () => void;
  place?: string;
  selectedIndex?: number;
}) {
  const theme = useTheme();
  const listRef = useRef<FlatList<Day>>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  const daysSafe = useMemo(() => (Array.isArray(days) ? days : []), [days]);

  useEffect(() => {
    if (!visible) return;

    // Scroll to a safe index (avoid out-of-range errors)
    const safeIndex = Math.max(0, Math.min(selectedIndex || 0, Math.max(0, daysSafe.length - 1)));
    setTimeout(() => {
      if (daysSafe.length > 0) {
        try {
          listRef.current?.scrollToIndex({ index: safeIndex, animated: true });
        } catch {
          // ignore scroll errors (RN will warn if item layout isn't ready)
        }
      }
    }, 50);

    // pulse animation for UX (kept minimal)
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    );
    anim.start();

    return () => {
      try {
        anim.stop();
      } catch {}
    };
  }, [visible, selectedIndex, daysSafe, pulse]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{
            padding: 16,
            backgroundColor: theme.card,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>
            {place ?? "7-Day Details"}
          </Text>
          <Pressable onPress={onClose}>
            <Text style={{ color: theme.text }}>Close</Text>
          </Pressable>
        </View>





        <FlatList
          ref={listRef}
          data={daysSafe}
          keyExtractor={(d, i) => d.date ?? String(i)}
          getItemLayout={(_, i) => ({ length: 64, offset: 64 * i, index: i })}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: theme.card }]}>
              <Text style={{ color: theme.text }}>
                {new Date(item.date).toLocaleDateString(undefined, { weekday: "short" })}
              </Text>
              <Text style={{ color: theme.text }}>
                {fmtTemp(item.tempMax)} / {fmtTemp(item.tempMin)}
              </Text>
              <Text style={{ color: theme.subtext }}>{item.pop}%</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#00000011",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 64,
  },
});
