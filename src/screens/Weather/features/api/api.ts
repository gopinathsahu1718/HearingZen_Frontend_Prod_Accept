// src/api/api.ts
const API_KEY = "YOUR_OPENWEATHERMAP_KEY"; // Replace with your real API key

// Fetch weather by coordinates
export async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Failed to fetch weather");

    const data = await res.json();

    return {
      current: data.current, // current weather
      hourly: data.hourly,   // next 48h
      daily: data.daily,     // next 7 days
    };
  } catch (err) {
    console.error("fetchWeather error:", err);
    throw err;
  }
}

// (Optional) Get city name by lat/lon
export async function fetchCityName(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Failed to fetch city name");

    const data = await res.json();
    return data[0]?.name || "Unknown location";
  } catch (err) {
    console.error("fetchCityName error:", err);
    return "Unknown";
  }
}
