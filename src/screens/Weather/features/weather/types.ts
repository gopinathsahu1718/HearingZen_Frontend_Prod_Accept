// src/features/weather/types.ts
export type LatLng = { latitude: number; longitude: number };

export type Current = {
  sunrise: string; // ISO
  sunset: string; // ISO
  temperature: number;
  apparent: number;
  condition: string;
  humidity: number;
  windKph: number;
  pressure: number;
  dewPoint: number;
  visibilityKm: number;
  uvi: number;
  aqi?: number | null;
  high: number;
  low: number;
};

export type Hour = {
  time: string; // ISO
  temp: number;
  pop: number;
  code: number;
};

export type Day = {
  hours: any;
  condition: any;
  date: string; // ISO
  tempMax: number;
  tempMin: number;
  pop: number;
  code: number;
};

export type WeatherBundle = {
  place: string;
  current: Current;
  hours: Hour[];
  days: Day[];
};
