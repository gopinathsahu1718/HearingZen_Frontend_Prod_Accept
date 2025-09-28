// src/features/weather/mockData.ts
import { WeatherBundle } from "./types";

const now = Date.now();

export const MOCK_WEATHER: WeatherBundle = {
  place: "Kolkata, India",
  current: {
    sunrise: new Date(now - 6 * 3600 * 1000).toISOString(),
    sunset: new Date(now + 6 * 3600 * 1000).toISOString(),
    temperature: 27,
    apparent: 27,
    condition: "Mostly Sunny",
    humidity: 64,
    windKph: 14,
    pressure: 1012,
    dewPoint: 18,
    visibilityKm: 10,
    uvi: 6,
    aqi: 42,
    high: 29,
    low: 22,
  },
  hours: Array.from({ length: 24 }).map((_, i) => ({
    time: new Date(now + i * 3600 * 1000).toISOString(),
    temp: 22 + Math.round(6 * Math.sin((i / 24) * Math.PI * 2)),
    pop: Math.round(Math.random() * 60),
    code: i % 6 === 0 ? 61 : 1,
  })),
  days: Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now + i * 24 * 3600 * 1000).toISOString();
    return {
      date: d,
      tempMax: 26 + i,
      tempMin: 18 + i,
      pop: Math.round(Math.random() * 60),
      code: i % 4 === 0 ? 61 : 1,
    };
  }),
};
