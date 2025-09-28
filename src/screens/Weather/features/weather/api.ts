// src/features/weather/api.ts
import { WeatherBundle } from "./types";
import { MOCK_WEATHER } from "./mockData";

/** Simulated fetch (mock) — signature matches remote API: (lat, lon). */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  // lat/lon are accepted for API compatibility but not used in mock
  return new Promise<WeatherBundle>((resolve) => {
    setTimeout(() => resolve(MOCK_WEATHER), 300);
  });
}
