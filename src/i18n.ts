import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

i18n
    .use(initReactI18next)
    .init({
        lng: 'en', // Initial language; overridden by LanguageContext
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            es: { translation: es },
            // Add more: fr: { translation: fr }
        },
        interpolation: {
            escapeValue: false, // React escapes values
        },
        react: {
            useSuspense: false, // Avoid suspense in React Native
        },
    });

export default i18n;