// src/features/weather/components/metrics/WeatherDetailsCard.tsx
import React from "react";
import { View, Text, Image } from "react-native";
import { useTheme } from "../../../../theme";

type Props = {
  current?: {
    apparent?: number;
    windKph?: number;
    windDir?: string;
    humidity?: number;
    uvi?: number;
    visibilityKm?: number;
    pressure?: number;
  };
};

export default function WeatherDetailsCard({ current }: Props) {
  const theme = useTheme();

  const apparent = current?.apparent ?? 34;
  const windKph = current?.windKph ?? 14;
  const windDir = current?.windDir ?? "N";
  const humidity = current?.humidity ?? 91;
  const uvi = current?.uvi ?? 3;
  const visibilityKm = current?.visibilityKm ?? 9;
  const pressure = current?.pressure ?? 1004;

  const items = [
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1684/1684375.png", // thermometer
      value: `${Math.round(apparent)}°C`,
      label: "Feels like",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/1116/1116453.png", // wind lines (wind speed)
      value: `${Math.round(windKph)} km/h`,
      label: `Wind ${windDir}`,
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/728/728093.png", // droplet
      value: `${Math.round(humidity)}%`,
      label: "Humidity",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png", // UV / Sun
      value: uvi < 5 ? "Weaker" : "Stronger",
      label: "UV",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/709/709612.png", // eye / visibility
      value: `${Math.round(visibilityKm)} km`,
      label: "Visibility",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/4005/4005817.png", // barometer / air pressure
      value: `${Math.round(pressure)} kPa`,
      label: "Air pressure",
    },
  ];

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        shadowColor: "#cecdf7ff",
        shadowOpacity: 3,
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {items.map((item, i) => (
          <View
            key={i}
            style={{
              width: "33%",
              marginBottom: 24,
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: item.icon }}
              style={{
                width: 28,
                height: 28,
                marginBottom: 8,
                tintColor: "#3b82f6", // blue icons as requested
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: theme.text,
                fontSize: 15,
                fontWeight: "700",
                marginBottom: 2,
              }}
            >
              {item.value}
            </Text>
            <Text
              style={{
                color: theme.subtext,
                fontSize: 12,
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
