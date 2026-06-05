import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // No hard-coded `lng` — let LanguageDetector pick from localStorage /
    // navigator / htmlTag (configured below). Pinning `lng: 'en'` here would
    // override the detector entirely, which defeats the persisted-language
    // cache and the supportedLngs config.
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'], //Extend for each supportedLngs
    debug: true,

    ns: ['common'], //Extend for each file in /public/locales/{{lng}}
    defaultNS: 'common',

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
