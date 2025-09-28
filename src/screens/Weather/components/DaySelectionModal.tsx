// src/components/DaySelectionModal.tsx
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
};

export default function DaySelectionModal({
  visible,
  onClose,
  days,
  selectedDay,
  onSelectDay,
}: Props) {
  const flatListRef = useRef<FlatList>(null);
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = days.indexOf(selectedDay);
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }

    // Highlight animation
    Animated.sequence([
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selectedDay]);

  const highlightColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["white", "#ffeaa7"],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            width: "80%",
            maxHeight: "60%",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            Select a Day
          </Text>
          <FlatList
            ref={flatListRef}
            data={days}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = item === selectedDay;
              return (
                <TouchableOpacity
                  onPress={() => onSelectDay(item)}
                  style={{
                    padding: 12,
                    marginVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Animated.View
                    style={{
                      backgroundColor: isSelected ? highlightColor : "white",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 12,
              backgroundColor: "#0984e3",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
