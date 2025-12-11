import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from './ThemeContext';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState('en');
    const [isReady, setIsReady] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem('hearing_language');
                const supportedLanguages = ['en', 'es', 'te', 'or', 'hi', 'zh', 'ja', 'ml', 'ta', 'kn', 'ko', 'ru', 'th', 'mr', 'bho', 'sa'];
                if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
                    await i18n.changeLanguage(storedLanguage);
                    setLanguageState(storedLanguage);
                } else {
                    await i18n.changeLanguage('en');
                    setLanguageState('en');
                }
            } catch (error) {
                console.error('Error loading language:', error);
                await i18n.changeLanguage('en');
                setLanguageState('en');
            } finally {
                setIsReady(true);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: string) => {
        try {
            await i18n.changeLanguage(lang);
            await AsyncStorage.setItem('hearing_language', lang);
            setLanguageState(lang);
        } catch (error) {
            console.error('Error setting language:', error);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {isReady ? children : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            )}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};