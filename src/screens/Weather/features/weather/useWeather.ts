// src/features/weather/useWeather.ts
import { useCallback, useEffect, useState } from "react";
import { WeatherBundle, LatLng } from "./types";

// top-level remote API (expects fetchWeather(lat, lon))
import { fetchWeather as fetchRemoteWeather } from "../weather/api";
// local mock fallback (now matches same signature)
import { fetchWeather as fetchMockWeather } from "./api";
import { Platform, PermissionsAndroid } from "react-native";

/** Try to get device location; fallback to configured static coords. */
async function getLatLng(): Promise<LatLng> {
  const fallback = { latitude: 22.5726, longitude: 88.3639 };

  try {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location permission",
          message: "Allow the app to access your location to show local weather",
          buttonPositive: "OK",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return fallback;
      }
    }

    const pos: any = await new Promise((resolve, reject) => {
      // @ts-ignore navigator may be present
      if (typeof navigator !== "undefined" && (navigator as any).geolocation) {
        // @ts-ignore
        (navigator as any).geolocation.getCurrentPosition(
          (p: any) => resolve(p),
          (err: any) => reject(err),
          { timeout: 8000, maximumAge: 60_000 }
        );
      } else {
        reject(new Error("Geolocation not available"));
      }
    });

    const latitude = pos.coords?.latitude;
    const longitude = pos.coords?.longitude;
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Convert remote API shape -> our WeatherBundle safely */
function mapRemoteToBundle(remote: any): WeatherBundle | null {
  try {
    if (!remote || !remote.current) return null;

    const cur = remote.current;
    const temperature = cur.temp ?? cur.temperature ?? 0;
    const apparent = cur.feels_like ?? cur.apparent ?? temperature;
    const condition = (cur.weather && cur.weather[0] && cur.weather[0].description) || cur.condition || "N/A";
    const sunrise = cur.sunrise ? new Date(cur.sunrise * 1000).toISOString() : new Date().toISOString();
    const sunset = cur.sunset ? new Date(cur.sunset * 1000).toISOString() : new Date().toISOString();

    const current = {
      sunrise,
      sunset,
      temperature,
      apparent,
      condition,
      humidity: cur.humidity ?? 0,
      windKph: cur.wind_speed ? Math.round(cur.wind_speed * 3.6) : cur.windKph ?? 0,
      pressure: cur.pressure ?? 0,
      dewPoint: cur.dew_point ?? cur.dewPoint ?? 0,
      visibilityKm: cur.visibility != null ? Math.round((cur.visibility / 1000)) : (cur.visibilityKm ?? 0),
      uvi: cur.uvi ?? cur.uv ?? 0,
      aqi: cur.aqi ?? null,
      high: remote.daily && remote.daily[0] ? Math.round(remote.daily[0].temp.max ?? 0) : 0,
      low: remote.daily && remote.daily[0] ? Math.round(remote.daily[0].temp.min ?? 0) : 0,
    };

    const hours = (remote.hourly || []).slice(0, 24).map((h: any) => ({
      time: h.dt ? new Date(h.dt * 1000).toISOString() : (h.time ?? new Date().toISOString()),
      temp: h.temp ?? 0,
      pop: h.pop != null ? Math.round(h.pop * 100) : (h.pop ?? 0),
      code: (h.weather && h.weather[0] && h.weather[0].id) || 0,
    }));

    const days = (remote.daily || []).slice(0, 7).map((d: any) => ({
      date: d.dt ? new Date(d.dt * 1000).toISOString() : (d.date ?? new Date().toISOString()),
      tempMax: d.temp?.max ?? d.tempMax ?? 0,
      tempMin: d.temp?.min ?? d.tempMin ?? 0,
      pop: d.pop != null ? Math.round(d.pop * 100) : (d.pop ?? 0),
      code: (d.weather && d.weather[0] && d.weather[0].id) || 0,
    }));

    const bundle: WeatherBundle = {
      place: remote.timezone || "Current Location",
      current,
      hours,
      days,
    };

    return bundle;
  } catch {
    return null;
  }
}

export default function useWeather() {
  const [data, setData] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const coords = await getLatLng();

      // Prefer remote API; fallback to local mock if remote fails or mapping fails
      try {
        const remote = await fetchRemoteWeather(coords.latitude, coords.longitude);
        const mapped = mapRemoteToBundle(remote);
        if (mapped) {
          setData(mapped);
          return;
        }
        // otherwise continue to fallback
      } catch (err) {
        // remote fetch failed -> proceed to fallback
      }

      // fallback to local mock — call with same (lat, lon) signature
      const mock = await fetchMockWeather(coords.latitude, coords.longitude);
      setData(mock);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch weather");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refreshing, onRefresh: load };
}
