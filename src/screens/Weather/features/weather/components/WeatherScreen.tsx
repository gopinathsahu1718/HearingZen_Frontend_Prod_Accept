// src/features/weather/components/WeatherScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useTheme, useThemeToggle } from "../../../theme";
import useWeather from "../useWeather";
import BackgroundSky from "./BackgroundSky";
import ExpandableSearch from "./ExpandableSearch";
import WeatherHeader from "./WeatherHeader";
import PersonHero from "./PersonHero";
import ForecastChartCard from "./ForecastChartCard";
import SevenDayModal from "./SevenDayModal";
import SuggestionCard from "./SuggestionCard";
import AQICard from "./metrics/AQICard";
import WeatherDetailsCard from "./metrics/WeatherDetailsCard.tsx";
import SunPathCard from "./metrics/SunPathCard.tsx";

export default function WeatherScreen() {
  const theme = useTheme();
  const { toggle, isDark } = useThemeToggle();
  const { data, refreshing, onRefresh } = useWeather();

  const fallback = useMemo(
    () => ({
      place: "Sample City",
      current: {
        sunrise: new Date().toISOString(),
        sunset: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        temperature: 27,
        apparent: 27,
        condition: "Mostly Sunny",
        humidity: 64,
        windKph: 14,
        windDir: "NE",
        pressure: 1012,
        dewPoint: 18,
        visibilityKm: 10,
        uvi: 6,
        aqi: 72,
        pm25: 25,
        pm10: 40,
        co: 0.8,
        so2: 6,
        high: 29,
        low: 22,
      },
      hours: [],
      days: [],
    }),
    []
  );

  const w = data ?? (fallback as any);
  const { current, days, place } = w;

  const [sevenOpen, setSevenOpen] = useState(false);

  function fetchWeather(city: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
      >
        <BackgroundSky isNight={isDark} />

        {/* Search + Theme Toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Pressable
            onPress={toggle}
            style={{
              backgroundColor: theme.card,
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Text>{isDark ? "🌙" : "☀"}</Text>
          </Pressable>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <ExpandableSearch onSearch={(city) => fetchWeather(city)} />

          </View>
        </View>

        {/* Current Weather */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#cecdf7ff",
        shadowOpacity: 3,
        shadowRadius: 10,
        elevation: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <WeatherHeader place={place} c={current} />
          </View>
          <PersonHero
            condition={current?.condition}
            sunrise={current?.sunrise}
            sunset={current?.sunset}
          />
        </View>

        {/* 7-Day Forecast */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 12,
       shadowColor: "#cecdf7ff",
        shadowOpacity: 3,
        shadowRadius: 10,
        elevation: 10,
          }}
        >
          <Text style={{ color: theme.subtext, marginBottom: 8 }}>
            5-Day Forecast
          </Text>
          <ForecastChartCard
            days={days}
            onDayPress={() => {
              setSevenOpen(true);
            }}
          />
        </View>

        {/* Suggestion Card */}
        <SuggestionCard condition={current?.condition} temp={0} />

        {/* ----------- REPLACEMENT SECTION START ----------- */}

        {/* Card 1: Weather Details */}
        <WeatherDetailsCard current={current} />

        {/* Card 2: AQI + pollutants */}
        <AQICard current={current} />

        {/* Card 3: Sunrise-Sunset arc */}
        <SunPathCard
          sunrise={current?.sunrise}
          sunset={current?.sunset}
          
        />

        {/* ----------- REPLACEMENT SECTION END ----------- */}
      </ScrollView>

      {/* Modals */}
      <SevenDayModal
        visible={sevenOpen}
        days={days}
        place={place}
        selectedIndex={0}
        onClose={() => setSevenOpen(false)}
      />
    </>
  );
}
