import React, { useMemo, useState } from "react";
import { View, Image, Text } from "react-native";
import { useTheme } from "../../../theme";

/**
 * PersonHero now shows a weather-specific image (icon) based on the current condition.
 * - props.condition: condition string from your `current.condition` (e.g. "Mostly Sunny", "Light rain")
 * - props.sunrise / props.sunset (ISO strings) are used to detect day/night; if missing, defaults to day.
 *
 * This uses OpenWeatherMap icon codes (static PNGs) so the visual reflects weather type.
 * If the image fails to load, it falls back to the previous person emoji so nothing breaks.
 */
export default function PersonHero({
  condition,
  sunrise,
  sunset,
}: {
  condition?: string;
  sunrise?: string;
  sunset?: string;
}) {
  const theme = useTheme();
  const [imgFailed, setImgFailed] = useState(false);

  const isNight = useMemo(() => {
    try {
      if (!sunrise || !sunset) return false;
      const now = Date.now();
      const sr = new Date(sunrise).getTime();
      const ss = new Date(sunset).getTime();
      return now < sr || now > ss;
    } catch {
      return false;
    }
  }, [sunrise, sunset]);

  const iconCode = useMemo(() => {
    const s = (condition || "").toLowerCase();

    if (s.includes("thunder") || s.includes("storm")) return isNight ? "11n" : "11d";
    if (s.includes("snow") || s.includes("sleet")) return isNight ? "13n" : "13d";
    if (s.includes("rain") || s.includes("shower") || s.includes("drizzle")) return isNight ? "10n" : "10d";
    if (s.includes("cloud")) return isNight ? "03n" : "03d";
    if (s.includes("mist") || s.includes("fog") || s.includes("haze")) return isNight ? "50n" : "50d";
    // default to clear/sunny
    return isNight ? "01n" : "01d";
  }, [condition, isNight]);

  const uri = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  return (
    <View style={{ width: 90, height: 120, alignItems: "center", justifyContent: "center" }}>
      {!imgFailed ? (
        <Image
          source={{ uri }}
          style={{ width: 72, height: 72 }}
          resizeMode="contain"
          onError={() => setImgFailed(true)}
          accessibilityLabel={`weather-${iconCode}`}
        />
      ) : (
        // fallback: previous person emoji (safe fallback so UI never looks empty)
        <Text style={{ fontSize: 56 }}>🧍‍♂️</Text>
      )}
    </View>
  );
}
