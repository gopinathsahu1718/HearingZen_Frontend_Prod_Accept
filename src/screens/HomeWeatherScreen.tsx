import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Circle, Line, Path, G } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import {
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sun,
  RefreshCw,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const STORAGE_KEY = 'weather_data_cache';
const API_BASE_URL = 'http://13.200.222.176/api/v1/weather';

interface Location {
  latitude: number;
  longitude: number;
}

interface WeatherComponents {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  nh3: number;
  pm2_5: number;
  pm10: number;
}

interface CurrentWeatherData {
  success: boolean;
  type: string;
  data: {
    countryCode: string;
    city: string;
    icon: string;
    description: string;
    temperature: number;
    feelsLike: number;
    windSpeed: number;
    pressure: number;
    humidity: number;
    sunrise: string;
    sunset: string;
    date: string;
    latitude: number;
    longitude: number;
    uvIndex: number;
    easScore: number;
  };
  cachedUntil: string;
}

interface ForecastDay {
  date: string;
  temperature: number;
  description: string;
  latitude: number;
  longitude: number;
}

interface ForecastData {
  success: boolean;
  type: string;
  forecast: ForecastDay[];
  source: string;
  cachedUntil: string;
}

interface PollutionData {
  success: boolean;
  source: string;
  pollution: {
    components: WeatherComponents;
    condition: string;
    latitude: number;
    longitude: number;
    date: string;
  };
}

interface ProcessedForecast {
  date: string;
  temp: number;
  description: string;
}

interface ProcessedWeatherData {
  city: string;
  temp: number;
  condition: string;
  feelsLike: number;
  wind: { speed: number; direction: string };
  humidity: number;
  uv: string;
  uvIndex: number;
  visibility: number;
  pressure: number;
  aqi: number;
  aqiLevel: string;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
  sunrise: string;
  sunset: string;
  forecast: ProcessedForecast[];
  high: number;
  low: number;
}

interface CachedData {
  data: ProcessedWeatherData;
  timestamp: number;
}

const HomeWeatherScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    initializeWeatherData();
  }, []);

  const initializeWeatherData = async (): Promise<void> => {
    try {
      // Check if cached data is available and valid
      const cachedData = await getCachedData();
      if (cachedData) {
        setWeatherData(cachedData);
        setLoading(false);
        return;
      }

      // If no valid cache, fetch fresh data
      await fetchWeatherData();
    } catch (error) {
      console.error('Error initializing weather data:', error);
      Alert.alert('Error', 'Failed to load weather data');
      setLoading(false);
    }
  };

  const getCachedData = async (): Promise<ProcessedWeatherData | null> => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (!cached) return null;

      const { data, timestamp }: CachedData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (within 15 minutes)
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }

      // Cache expired, remove it
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  const setCachedData = async (data: ProcessedWeatherData): Promise<void> => {
    try {
      const cacheObject: CachedData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const result = await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );

      if (result === RESULTS.GRANTED) {
        setLocationError('');
        return true;
      } else if (result === RESULTS.DENIED) {
        setLocationError('Location permission denied. Please enable location access in settings.');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        setLocationError('Location permission blocked. Please enable location access in device settings.');
        return false;
      } else {
        setLocationError('Location permission not granted.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationError('Failed to request location permission.');
      return false;
    }
  };

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // console.error('Location error:', error);

          // Handle different error codes
          if (error.code === 1) {
            // PERMISSION_DENIED
            setLocationError('Location access denied. Please enable location services.');
          } else if (error.code === 2) {
            // POSITION_UNAVAILABLE
            setLocationError('Unable to determine your location. Please check your GPS.');
          } else if (error.code === 3) {
            // TIMEOUT
            setLocationError('Location request timed out. Please try again.');
          } else {
            setLocationError('Failed to get your location. Please ensure location services are enabled.');
          }

          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const fetchWeatherData = async (): Promise<void> => {
    try {
      setRefreshing(true);
      setLocationError('');

      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to view weather data. You can enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings', onPress: () => {
                // You can use Linking.openSettings() here if needed
                console.log('Open settings');
              }
            }
          ]
        );
        setRefreshing(false);
        setLoading(false);
        return;
      }

      // Get current location
      let locationData: Location;
      try {
        locationData = await getCurrentLocation();
        setLocation(locationData);
      } catch (error) {
        Alert.alert(
          'Location Error',
          locationError || 'Unable to get your location. Please ensure location services are enabled and try again.',
          [{ text: 'OK' }]
        );
        setRefreshing(false);
        setLoading(false);
        return;
      }

      // Fetch all three APIs in parallel
      const [currentResponse, forecastResponse, pollutionResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/current?lat=${locationData.latitude}&lon=${locationData.longitude}`),
        fetch(`${API_BASE_URL}/forecast?lat=${locationData.latitude}&lon=${locationData.longitude}&days=5`),
        fetch(`${API_BASE_URL}/air-pollution?lat=${locationData.latitude}&lon=${locationData.longitude}`),
      ]);

      const currentData: CurrentWeatherData = await currentResponse.json();
      const forecastData: ForecastData = await forecastResponse.json();
      const pollutionData: PollutionData = await pollutionResponse.json();

      // Process and combine the data
      const processedData = processWeatherData(currentData, forecastData, pollutionData);

      // Cache the data
      await setCachedData(processedData);

      // Update state
      setWeatherData(processedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Error', 'Failed to fetch weather data. Please check your internet connection and try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const processWeatherData = (
    current: CurrentWeatherData,
    forecast: ForecastData,
    pollution: PollutionData
  ): ProcessedWeatherData => {
    const currentData = current.data;
    const pollutionData = pollution.pollution;

    // Calculate AQI from components (simplified calculation)
    const calculateAQI = (components: WeatherComponents): { aqi: number; level: string } => {
      const pm25 = components.pm2_5 || 0;
      // Simplified AQI calculation based on PM2.5
      if (pm25 <= 12) return { aqi: 25, level: 'Good' };
      if (pm25 <= 35) return { aqi: 50, level: 'Fair' };
      if (pm25 <= 55) return { aqi: 75, level: 'Moderate' };
      if (pm25 <= 150) return { aqi: 100, level: 'Poor' };
      return { aqi: 150, level: 'Very Poor' };
    };

    const aqiInfo = calculateAQI(pollutionData.components);

    // Format sunrise and sunset times
    const formatTime = (isoString: string): string => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Format forecast dates
    const formatDate = (isoString: string): string => {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get UV index level
    const getUVLevel = (uvIndex: number): string => {
      if (uvIndex <= 2) return 'Low';
      if (uvIndex <= 5) return 'Moderate';
      if (uvIndex <= 7) return 'High';
      if (uvIndex <= 10) return 'Very High';
      return 'Extreme';
    };

    return {
      city: currentData.city,
      temp: Math.round(currentData.temperature),
      condition: currentData.description.charAt(0).toUpperCase() + currentData.description.slice(1),
      feelsLike: Math.round(currentData.feelsLike),
      wind: {
        speed: Math.round(currentData.windSpeed),
        direction: 'N' // You can calculate this from wind data if available
      },
      humidity: currentData.humidity,
      uv: getUVLevel(currentData.uvIndex),
      uvIndex: currentData.uvIndex,
      visibility: 10, // Not provided in API, using default
      pressure: currentData.pressure,
      aqi: aqiInfo.aqi,
      aqiLevel: aqiInfo.level,
      pm25: pollutionData.components.pm2_5,
      pm10: pollutionData.components.pm10,
      co: pollutionData.components.co,
      no2: pollutionData.components.no2,
      so2: pollutionData.components.so2,
      o3: pollutionData.components.o3,
      sunrise: formatTime(currentData.sunrise),
      sunset: formatTime(currentData.sunset),
      forecast: forecast.forecast.map((day: ForecastDay) => ({
        date: formatDate(day.date),
        temp: Math.round(day.temperature),
        description: day.description,
      })),
      high: Math.max(...forecast.forecast.map((d: ForecastDay) => d.temperature)),
      low: Math.min(...forecast.forecast.map((d: ForecastDay) => d.temperature)),
    };
  };

  const handleRefresh = async (): Promise<void> => {
    await fetchWeatherData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          {locationError || 'Unable to load weather data'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with City and Refresh */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cityName}>{weatherData.city}</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw
            size={24}
            color="#3B82F6"
            style={refreshing ? styles.rotating : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Main Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.tempRow}>
          <Text style={styles.temperature}>{weatherData.temp}°</Text>
          <View style={styles.sunIcon} />
        </View>
        <Text style={styles.condition}>{weatherData.condition}</Text>
        <Text style={styles.tempDetails}>
          ↑{Math.round(weatherData.high)}° · ↓{Math.round(weatherData.low)}° · Feels {weatherData.feelsLike}°
        </Text>
      </View>

      {/* 5-Day Forecast */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>5-Day Forecast</Text>
        <View style={styles.forecastChart}>
          <Svg width={width - 80} height={100}>
            {weatherData.forecast.map((day, i) => {
              const x = 30 + i * ((width - 140) / 4);
              const y = 80 - (day.temp - 20) * 2.5;
              const nextDay = weatherData.forecast[i + 1];
              return (
                <G key={i}>
                  {nextDay && (
                    <Line
                      x1={x}
                      y1={y}
                      x2={30 + (i + 1) * ((width - 140) / 4)}
                      y2={80 - (nextDay.temp - 20) * 2.5}
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  )}
                  <Circle cx={x} cy={y} r="5" fill="#3B82F6" />
                </G>
              );
            })}
          </Svg>
          <View style={styles.forecastDates}>
            {weatherData.forecast.map((day, i) => (
              <Text key={i} style={styles.forecastDate}>
                {day.date}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Weather Details Grid */}
      <View style={styles.card}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Text style={styles.detailIcon}>🌡️</Text>
            </View>
            <Text style={styles.detailValue}>{weatherData.feelsLike}°C</Text>
            <Text style={styles.detailLabel}>Feels like</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Wind size={20} color="#3B82F6" />
            </View>
            <Text style={styles.detailValue}>{weatherData.wind.speed} km/h</Text>
            <Text style={styles.detailLabel}>Wind {weatherData.wind.direction}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Droplets size={20} color="#3B82F6" />
            </View>
            <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Sun size={20} color="#3B82F6" />
            </View>
            <Text style={styles.detailValue}>{weatherData.uv}</Text>
            <Text style={styles.detailLabel}>UV Index</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Eye size={20} color="#3B82F6" />
            </View>
            <Text style={styles.detailValue}>{weatherData.visibility} km</Text>
            <Text style={styles.detailLabel}>Visibility</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Gauge size={20} color="#3B82F6" />
            </View>
            <Text style={styles.detailValue}>{weatherData.pressure} hPa</Text>
            <Text style={styles.detailLabel}>Air pressure</Text>
          </View>
        </View>
      </View>

      {/* Air Quality Index */}
      <View style={styles.card}>
        <View style={styles.aqiContainer}>
          <View style={styles.aqiCircle}>
            <Svg width={120} height={120}>
              <Circle
                cx="60"
                cy="60"
                r="52"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <Circle
                cx="60"
                cy="60"
                r="52"
                stroke="#3B82F6"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(weatherData.aqi / 100) * 326} 326`}
                strokeLinecap="round"
                rotation="-90"
                origin="60, 60"
              />
            </Svg>
            <View style={styles.aqiTextContainer}>
              <Text style={styles.aqiValue}>{weatherData.aqi}</Text>
              <Text style={styles.aqiLabel}>AQI</Text>
              <Text style={styles.aqiLevel}>{weatherData.aqiLevel}</Text>
            </View>
          </View>

          <View style={styles.pollutantsGrid}>
            <View style={styles.pollutantItem}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: `${Math.min(weatherData.pm25, 100)}%` }]} />
              </View>
              <Text style={styles.pollutantValue}>{weatherData.pm25.toFixed(1)}</Text>
              <Text style={styles.pollutantLabel}>PM2.5</Text>
            </View>

            <View style={styles.pollutantItem}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: `${Math.min(weatherData.pm10, 100)}%` }]} />
              </View>
              <Text style={styles.pollutantValue}>{weatherData.pm10.toFixed(1)}</Text>
              <Text style={styles.pollutantLabel}>PM10</Text>
            </View>

            <View style={styles.pollutantItem}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: `${Math.min(weatherData.co / 10, 100)}%` }]} />
              </View>
              <Text style={styles.pollutantValue}>{weatherData.co.toFixed(1)}</Text>
              <Text style={styles.pollutantLabel}>CO</Text>
            </View>

            <View style={styles.pollutantItem}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: `${Math.min(weatherData.so2 * 2, 100)}%` }]} />
              </View>
              <Text style={styles.pollutantValue}>{weatherData.so2.toFixed(1)}</Text>
              <Text style={styles.pollutantLabel}>SO₂</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sunrise & Sunset */}
      <View style={styles.card}>
        <Text style={styles.cardTitleCenter}>Sunrise & Sunset</Text>
        <View style={styles.sunriseSunsetContainer}>
          <Svg width={width - 80} height={140}>
            <Path
              d={`M 40 110 Q ${(width - 80) / 2} 30 ${width - 120} 110`}
              stroke="#93C5FD"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
            <Circle cx={(width - 80) / 2} cy="40" r="12" fill="#FBBF24" />
            <Circle cx="40" cy="110" r="10" fill="#FBBF24" />
            <Circle cx={width - 120} cy="110" r="10" fill="#F87171" />
          </Svg>
          <View style={styles.sunriseSunsetLabels}>
            <View style={styles.sunriseLabel}>
              <Sun size={18} color="#EAB308" />
              <Text style={styles.sunTime}>{weatherData.sunrise}</Text>
            </View>
            <View style={styles.sunsetLabel}>
              <Sun size={18} color="#F97316" />
              <Text style={styles.sunTime}>{weatherData.sunset}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cityName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '300',
    color: '#1F2937',
  },
  sunIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#F97316',
    borderRadius: 30,
    marginBottom: 8,
  },
  condition: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  tempDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  cardTitleCenter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  forecastChart: {
    alignItems: 'center',
  },
  forecastDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 80,
    marginTop: 8,
  },
  forecastDate: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aqiCircle: {
    width: 120,
    height: 120,
    position: 'relative',
    marginRight: 20,
  },
  aqiTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  aqiLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  aqiLevel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  pollutantsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pollutantItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  barContainer: {
    width: 20,
    height: 70,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    backgroundColor: '#60A5FA',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  pollutantValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pollutantLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  sunriseSunsetContainer: {
    alignItems: 'center',
  },
  sunriseSunsetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 120,
    marginTop: -20,
  },
  sunriseLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sunsetLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sunTime: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
});

export default HomeWeatherScreen;