import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import te from './locales/te.json';
import or from './locales/or.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ml from './locales/ml.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import th from './locales/th.json';
import mr from './locales/mr.json';
import bho from './locales/bho.json';
import sa from './locales/sa.json';

i18n
    .use(initReactI18next)
    .init({
        lng: 'en', // Initial language; overridden by LanguageContext
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            es: { translation: es },
            te: { translation: te },
            or: { translation: or },
            hi: { translation: hi },
            zh: { translation: zh },
            ja: { translation: ja },
            ml: { translation: ml },
            ta: { translation: ta },
            kn: { translation: kn },
            ko: { translation: ko },
            ru: { translation: ru },
            th: { translation: th },
            mr: { translation: mr },
            bho: { translation: bho },
            sa: { translation: sa },
        },
        interpolation: {
            escapeValue: false, // React escapes values
        },
        react: {
            useSuspense: false, // Avoid suspense in React Native
        },
    });

export default i18n;