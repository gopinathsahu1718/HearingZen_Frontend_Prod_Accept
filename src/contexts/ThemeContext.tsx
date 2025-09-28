import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    iconTint: string;
    cardBackground: string;
    shadowColor: string;
    tabBarBackground: string;
    tabBarActiveTint: string;
    tabBarInactiveTint: string;
    modalOverlay: string;
    switchTrackFalse: string;
    switchTrackTrue: string;
    switchThumb: string;
    deleteText: string;
    achievementBackground: string;
    achievementText: string;
    refreshIconTint: string;
}

const darkTheme: Theme = {
    primary: '#1874ed',
    secondary: '#32b4db',
    tertiary: '#e6e6e6',
    background: '#0e0e0e',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#333333',
    iconTint: '#cccccc',
    cardBackground: '#1a1a1a',
    shadowColor: '#000000',
    tabBarBackground: '#1a1a1a',
    tabBarActiveTint: '#1874ed',
    tabBarInactiveTint: '#cccccc',
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    switchTrackFalse: '#666666',
    switchTrackTrue: '#1874ed',
    switchThumb: '#ffffff',
    deleteText: '#ff4444',
    achievementBackground: '#333333',
    achievementText: '#ffd700',
    refreshIconTint: '#1874ed',
};

const lightTheme: Theme = {
    primary: '#1874ed',
    secondary: '#32b4db',
    tertiary: '#e6e6e6',
    background: '#f8f8f8',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#f0f0f0',
    iconTint: '#666666',
    cardBackground: '#ffffff',
    shadowColor: '#000000',
    tabBarBackground: '#ffffff',
    tabBarActiveTint: '#007AFF',
    tabBarInactiveTint: 'gray',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    switchTrackFalse: '#d3d3d3',
    switchTrackTrue: '#007BFF',
    switchThumb: '#f4f3f4',
    deleteText: '#FF4444',
    achievementBackground: '#333333',
    achievementText: '#FFD700',
    refreshIconTint: '#007BFF',
};

interface ThemeContextType {
    theme: Theme;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

    useEffect(() => {
        loadThemeFromStorage();
    }, []);

    const loadThemeFromStorage = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (storedTheme !== null) {
                setIsDarkMode(storedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme from storage:', error);
        }
    };

    const saveThemeToStorage = async (isDark: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme to storage:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        saveThemeToStorage(newMode);
    };

    const setDarkMode = (isDark: boolean) => {
        setIsDarkMode(isDark);
        saveThemeToStorage(isDark);
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};