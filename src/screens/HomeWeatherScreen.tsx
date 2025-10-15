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
  Animated,
} from 'react-native';
import Svg, { Circle, Line, Path, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
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
  Cloud,
  CloudRain,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  MapPin,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

const { width, height } = Dimensions.get('window');

const CACHE_DURATION = 15 * 60 * 1000;
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
  icon: string;
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
  easScore: number;
  nh3: number;
  no: number;
}

interface CachedData {
  data: ProcessedWeatherData;
  timestamp: number;
}

const HomeWeatherScreen: React.FC = () => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const rotateAnim = new Animated.Value(0);

  const styles = useThemedStyles((theme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
    errorText: {
      fontSize: 16,
      color: theme.deleteText,
      marginBottom: 16,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 20,
      backgroundColor: theme.primary,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    cityName: {
      fontSize: 28,
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    currentDate: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginLeft: 32,
    },
    refreshButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      right: 20,
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
    },
    heroCard: {
      marginHorizontal: 20,
      marginTop: -40,
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    mainTempRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    tempSection: {
      flex: 1,
    },
    mainTemp: {
      fontSize: 72,
      fontWeight: '200',
      color: theme.text,
      lineHeight: 80,
    },
    condition: {
      fontSize: 20,
      fontWeight: '500',
      color: theme.text,
      marginTop: 4,
    },
    weatherIcon: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    minMaxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    minMaxItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    minMaxLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginRight: 8,
    },
    minMaxValue: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    feelsLikeText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 'auto',
    },
    easScoreContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: `${theme.primary}15`,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    easScoreLabel: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    easScoreValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.primary,
    },
    easScoreText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 12,
    },
    forecastCard: {
      marginHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    forecastScroll: {
      marginTop: 8,
    },
    forecastItem: {
      width: 80,
      alignItems: 'center',
      marginRight: 16,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 16,
    },
    forecastDay: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    forecastIcon: {
      marginVertical: 8,
    },
    forecastTemp: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginTop: 8,
    },
    forecastDesc: {
      fontSize: 10,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    detailsCard: {
      marginHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    detailBox: {
      width: '50%',
      padding: 12,
    },
    detailInner: {
      backgroundColor: theme.background,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    detailIconBg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    detailValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    aqiCard: {
      marginHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    aqiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    aqiMainCircle: {
      width: 120,
      height: 120,
      marginRight: 20,
    },
    aqiTextOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aqiValue: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.text,
    },
    aqiSubtext: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    aqiLevelBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 8,
    },
    aqiLevelText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    aqiInfo: {
      flex: 1,
    },
    aqiTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    aqiDescription: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    pollutantsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    pollutantBox: {
      width: '25%',
      alignItems: 'center',
      marginBottom: 16,
    },
    pollutantBar: {
      width: 24,
      height: 80,
      backgroundColor: theme.border,
      borderRadius: 12,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    pollutantFill: {
      width: '100%',
      borderRadius: 12,
    },
    pollutantValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginTop: 8,
    },
    pollutantLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    sunCard: {
      marginHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 24,
    },
    sunContent: {
      alignItems: 'center',
    },
    sunTimesRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 16,
    },
    sunTimeBox: {
      alignItems: 'center',
    },
    sunTimeLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    sunTimeValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    sunIconBg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
  }));

  useEffect(() => {
    initializeWeatherData();
  }, []);

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    rotateAnim.setValue(0);
  };

  const initializeWeatherData = async (): Promise<void> => {
    try {
      const cachedData = await getCachedData();
      if (cachedData) {
        setWeatherData(cachedData);
        setLoading(false);
        return;
      }
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

      if (now - timestamp < CACHE_DURATION) {
        return data;
      }

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
        setLocationError('Location permission denied.');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        setLocationError('Location permission blocked.');
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
          if (error.code === 1) {
            setLocationError('Location access denied.');
          } else if (error.code === 2) {
            setLocationError('Unable to determine location.');
          } else if (error.code === 3) {
            setLocationError('Location request timed out.');
          } else {
            setLocationError('Failed to get location.');
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
      startRotation();
      setLocationError('');

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to view weather data.',
          [{ text: 'OK' }]
        );
        setRefreshing(false);
        stopRotation();
        setLoading(false);
        return;
      }

      let locationData: Location;
      try {
        locationData = await getCurrentLocation();
        setLocation(locationData);
      } catch (error) {
        Alert.alert(
          'Location Error',
          locationError || 'Unable to get your location.',
          [{ text: 'OK' }]
        );
        setRefreshing(false);
        stopRotation();
        setLoading(false);
        return;
      }

      const [currentResponse, forecastResponse, pollutionResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/current?lat=${locationData.latitude}&lon=${locationData.longitude}`),
        fetch(`${API_BASE_URL}/forecast?lat=${locationData.latitude}&lon=${locationData.longitude}&days=5`),
        fetch(`${API_BASE_URL}/air-pollution?lat=${locationData.latitude}&lon=${locationData.longitude}`),
      ]);

      const currentData: CurrentWeatherData = await currentResponse.json();
      const forecastData: ForecastData = await forecastResponse.json();
      const pollutionData: PollutionData = await pollutionResponse.json();

      const processedData = processWeatherData(currentData, forecastData, pollutionData);

      await setCachedData(processedData);
      setWeatherData(processedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Error', 'Failed to fetch weather data.');
    } finally {
      setRefreshing(false);
      stopRotation();
      setLoading(false);
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain')) return <CloudRain size={40} color={theme.primary} />;
    if (desc.includes('cloud')) return <Cloud size={40} color={theme.primary} />;
    return <Sun size={40} color="#F59E0B" />;
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 25) return '#10B981';
    if (aqi <= 50) return '#3B82F6';
    if (aqi <= 75) return '#F59E0B';
    if (aqi <= 100) return '#EF4444';
    return '#991B1B';
  };

  const getAQIDescription = (level: string): string => {
    const descriptions: { [key: string]: string } = {
      'Good': 'Air quality is satisfactory, and air pollution poses little or no risk.',
      'Fair': 'Air quality is acceptable. However, there may be a risk for some people.',
      'Moderate': 'Members of sensitive groups may experience health effects.',
      'Poor': 'Some members of the general public may experience health effects.',
      'Very Poor': 'Health alert: The risk of health effects is increased for everyone.',
    };
    return descriptions[level] || 'Air quality information unavailable.';
  };

  const getPollutantColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage <= 25) return '#10B981';
    if (percentage <= 50) return '#3B82F6';
    if (percentage <= 75) return '#F59E0B';
    return '#EF4444';
  };

  const processWeatherData = (
    current: CurrentWeatherData,
    forecast: ForecastData,
    pollution: PollutionData
  ): ProcessedWeatherData => {
    const currentData = current.data;
    const pollutionData = pollution.pollution;

    const calculateAQI = (components: WeatherComponents): { aqi: number; level: string } => {
      const pm25 = components.pm2_5 || 0;
      if (pm25 <= 12) return { aqi: 25, level: 'Good' };
      if (pm25 <= 35) return { aqi: 50, level: 'Fair' };
      if (pm25 <= 55) return { aqi: 75, level: 'Moderate' };
      if (pm25 <= 150) return { aqi: 100, level: 'Poor' };
      return { aqi: 150, level: 'Very Poor' };
    };

    const aqiInfo = calculateAQI(pollutionData.components);

    const formatTime = (isoString: string): string => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (isoString: string, short: boolean = false): string => {
      const date = new Date(isoString);
      if (short) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getUVLevel = (uvIndex: number): string => {
      if (uvIndex <= 2) return 'Low';
      if (uvIndex <= 5) return 'Moderate';
      if (uvIndex <= 7) return 'High';
      if (uvIndex <= 10) return 'Very High';
      return 'Extreme';
    };

    return {
      city: currentData.city || 'Unknown',
      temp: Math.round(currentData.temperature || 0),
      condition: currentData.description ? currentData.description.charAt(0).toUpperCase() + currentData.description.slice(1) : 'N/A',
      feelsLike: Math.round(currentData.feelsLike || 0),
      wind: {
        speed: Math.round(currentData.windSpeed || 0),
        direction: 'N'
      },
      humidity: currentData.humidity || 0,
      uv: getUVLevel(currentData.uvIndex || 0),
      uvIndex: currentData.uvIndex || 0,
      visibility: 10,
      pressure: currentData.pressure || 0,
      aqi: aqiInfo.aqi,
      aqiLevel: aqiInfo.level,
      pm25: pollutionData.components.pm2_5 || 0,
      pm10: pollutionData.components.pm10 || 0,
      co: pollutionData.components.co || 0,
      no2: pollutionData.components.no2 || 0,
      so2: pollutionData.components.so2 || 0,
      o3: pollutionData.components.o3 || 0,
      nh3: pollutionData.components.nh3 || 0,
      no: pollutionData.components.no || 0,
      sunrise: formatTime(currentData.sunrise),
      sunset: formatTime(currentData.sunset),
      forecast: forecast.forecast.map((day: ForecastDay) => ({
        date: formatDate(day.date, true),
        temp: Math.round(day.temperature || 0),
        description: day.description || 'N/A',
        icon: day.description || 'N/A',
      })),
      high: Math.max(...forecast.forecast.map((d: ForecastDay) => d.temperature || 0)),
      low: Math.min(...forecast.forecast.map((d: ForecastDay) => d.temperature || 0)),
      easScore: currentData.easScore || 0,
    };
  };

  const handleRefresh = async (): Promise<void> => {
    await fetchWeatherData();
  };

  const getCurrentDate = (): string => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <AlertCircle size={48} color={theme.deleteText} />
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <MapPin size={20} color="#FFFFFF" />
          <Text style={styles.cityName}>{weatherData.city}</Text>
        </View>
        <Text style={styles.currentDate}>{getCurrentDate()}</Text>

        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw size={20} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Hero Weather Card */}
      <View style={styles.heroCard}>
        <View style={styles.mainTempRow}>
          <View style={styles.tempSection}>
            <Text style={styles.mainTemp}>{weatherData.temp}°</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
          <View style={styles.weatherIcon}>
            {getWeatherIcon(weatherData.condition)}
          </View>
        </View>

        <View style={styles.minMaxRow}>
          <View style={styles.minMaxItem}>
            <Text style={styles.minMaxLabel}>High</Text>
            <Text style={styles.minMaxValue}>{Math.round(weatherData.high)}°</Text>
          </View>
          <View style={styles.minMaxItem}>
            <Text style={styles.minMaxLabel}>Low</Text>
            <Text style={styles.minMaxValue}>{Math.round(weatherData.low)}°</Text>
          </View>
          <Text style={styles.feelsLikeText}>Feels like {weatherData.feelsLike}°</Text>
        </View>

        {/* EAS Score */}
        <View style={styles.easScoreContainer}>
          <View>
            <Text style={styles.easScoreLabel}>Environmental Air Score</Text>
            <Text style={styles.easScoreText}>Overall air quality rating</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.easScoreValue}>{(weatherData.easScore || 0).toFixed(1)}</Text>
            <TrendingUp size={16} color={theme.primary} />
          </View>
        </View>
      </View>

      {/* 5-Day Forecast */}
      <Text style={styles.sectionTitle}>5-Day Forecast</Text>
      <View style={styles.forecastCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
          {weatherData.forecast.map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{day.date}</Text>
              <View style={styles.forecastIcon}>
                {getWeatherIcon(day.description)}
              </View>
              <Text style={styles.forecastTemp}>{day.temp}°</Text>
              <Text style={styles.forecastDesc} numberOfLines={2}>
                {day.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Weather Details */}
      <Text style={styles.sectionTitle}>Weather Details</Text>
      <View style={styles.detailsCard}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailBox}>
            <View style={styles.detailInner}>
              <View style={styles.detailIconBg}>
                <Wind size={24} color={theme.primary} />
              </View>
              <Text style={styles.detailValue}>{weatherData.wind.speed} km/h</Text>
              <Text style={styles.detailLabel}>Wind Speed</Text>
            </View>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailInner}>
              <View style={styles.detailIconBg}>
                <Droplets size={24} color={theme.primary} />
              </View>
              <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
              <Text style={styles.detailLabel}>Humidity</Text>
            </View>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailInner}>
              <View style={styles.detailIconBg}>
                <Sun size={24} color={theme.primary} />
              </View>
              <Text style={styles.detailValue}>{weatherData.uvIndex}</Text>
              <Text style={styles.detailLabel}>UV Index ({weatherData.uv})</Text>
            </View>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailInner}>
              <View style={styles.detailIconBg}>
                <Gauge size={24} color={theme.primary} />
              </View>
              <Text style={styles.detailValue}>{weatherData.pressure}</Text>
              <Text style={styles.detailLabel}>Pressure (hPa)</Text>
            </View>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailInner}>
              <View style={styles.detailIconBg}>
                <Eye size={24} color={theme.primary} />
              </View>
              <Text style={styles.detailValue}>{weatherData.visibility} km</Text>
              <Text style={styles.detailLabel}>Visibility</Text>
            </View>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailInner}>
              <View style={styles.detailIconBg}>
                <Text style={{ fontSize: 24 }}>🌡️</Text>
              </View>
              <Text style={styles.detailValue}>{weatherData.feelsLike}°</Text>
              <Text style={styles.detailLabel}>Feels Like</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Air Quality Index */}
      <Text style={styles.sectionTitle}>Air Quality Index</Text>
      <View style={styles.aqiCard}>
        <View style={styles.aqiHeader}>
          <View style={styles.aqiMainCircle}>
            <Svg width={120} height={120}>
              <Defs>
                <LinearGradient id="aqiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={getAQIColor(weatherData.aqi)} stopOpacity="0.8" />
                  <Stop offset="100%" stopColor={getAQIColor(weatherData.aqi)} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Circle
                cx="60"
                cy="60"
                r="54"
                stroke={theme.border}
                strokeWidth="8"
                fill="none"
              />
              <Circle
                cx="60"
                cy="60"
                r="54"
                stroke="url(#aqiGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(weatherData.aqi / 150) * 339} 339`}
                strokeLinecap="round"
                rotation="-90"
                origin="60, 60"
              />
            </Svg>
            <View style={styles.aqiTextOverlay}>
              <Text style={styles.aqiValue}>{weatherData.aqi}</Text>
              <Text style={styles.aqiSubtext}>AQI</Text>
              <View style={[styles.aqiLevelBadge, { backgroundColor: getAQIColor(weatherData.aqi) }]}>
                <Text style={styles.aqiLevelText}>{weatherData.aqiLevel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.aqiInfo}>
            <Text style={styles.aqiTitle}>Air Quality</Text>
            <Text style={styles.aqiDescription}>
              {getAQIDescription(weatherData.aqiLevel)}
            </Text>
          </View>
        </View>

        <View style={styles.pollutantsGrid}>
          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.pm25 || 0) / 50) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.pm25 || 0, 50)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.pm25 || 0).toFixed(1)}</Text>
            <Text style={styles.pollutantLabel}>PM2.5</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.pm10 || 0) / 100) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.pm10 || 0, 100)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.pm10 || 0).toFixed(1)}</Text>
            <Text style={styles.pollutantLabel}>PM10</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.co || 0) / 500) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.co || 0, 500)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.co || 0).toFixed(0)}</Text>
            <Text style={styles.pollutantLabel}>CO</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.no2 || 0) / 50) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.no2 || 0, 50)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.no2 || 0).toFixed(1)}</Text>
            <Text style={styles.pollutantLabel}>NO₂</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.so2 || 0) / 50) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.so2 || 0, 50)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.so2 || 0).toFixed(1)}</Text>
            <Text style={styles.pollutantLabel}>SO₂</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.o3 || 0) / 100) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.o3 || 0, 100)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.o3 || 0).toFixed(1)}</Text>
            <Text style={styles.pollutantLabel}>O₃</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.nh3 || 0) / 10) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.nh3 || 0, 10)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.nh3 || 0).toFixed(2)}</Text>
            <Text style={styles.pollutantLabel}>NH₃</Text>
          </View>

          <View style={styles.pollutantBox}>
            <View style={styles.pollutantBar}>
              <View style={[
                styles.pollutantFill,
                {
                  height: `${Math.min(((weatherData.no || 0) / 10) * 100, 100)}%`,
                  backgroundColor: getPollutantColor(weatherData.no || 0, 10)
                }
              ]} />
            </View>
            <Text style={styles.pollutantValue}>{(weatherData.no || 0).toFixed(2)}</Text>
            <Text style={styles.pollutantLabel}>NO</Text>
          </View>
        </View>
      </View>

      {/* Sunrise & Sunset */}
      <Text style={styles.sectionTitle}>Sun Schedule</Text>
      <View style={styles.sunCard}>
        <View style={styles.sunContent}>
          <Svg width={width - 80} height={100}>
            <Defs>
              <LinearGradient id="sunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FCD34D" stopOpacity="1" />
                <Stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d={`M 30 80 Q ${(width - 80) / 2} 20 ${width - 110} 80`}
              stroke="#93C5FD"
              strokeWidth="3"
              strokeDasharray="6,6"
              fill="none"
            />
            <Circle cx={(width - 80) / 2} cy="30" r="16" fill="url(#sunGradient)" />
            <Circle cx="30" cy="80" r="12" fill="#FCD34D" opacity="0.6" />
            <Circle cx={width - 110} cy="80" r="12" fill="#F97316" opacity="0.6" />
          </Svg>

          <View style={styles.sunTimesRow}>
            <View style={styles.sunTimeBox}>
              <View style={[styles.sunIconBg, { backgroundColor: '#FEF3C7' }]}>
                <SunriseIcon size={24} color="#F59E0B" />
              </View>
              <Text style={styles.sunTimeLabel}>Sunrise</Text>
              <Text style={styles.sunTimeValue}>{weatherData.sunrise}</Text>
            </View>

            <View style={styles.sunTimeBox}>
              <View style={[styles.sunIconBg, { backgroundColor: '#FED7AA' }]}>
                <SunsetIcon size={24} color="#F97316" />
              </View>
              <Text style={styles.sunTimeLabel}>Sunset</Text>
              <Text style={styles.sunTimeValue}>{weatherData.sunset}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeWeatherScreen;