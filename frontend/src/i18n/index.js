import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import static JSON resources (Vite supports JSON imports)
import en from '../locales/en/common.json';
import hi from '../locales/hi/common.json';
import ta from '../locales/ta/common.json';
import ar from '../locales/ar/common.json';
import bn from '../locales/bn/common.json';

const resources = {
  en: { common: en },
  hi: { common: hi },
  ta: { common: ta },
  ar: { common: ar },
  bn: { common: bn },
};

if (!i18next.isInitialized) {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: ['en', 'hi', 'ta', 'ar', 'bn'],
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
}

// Set HTML direction and lang attribute based on current language
const rtlLangs = ['ar'];
const applyDir = (lng) => {
  const base = (lng || i18next.language || 'en').split('-')[0];
  if (typeof document !== 'undefined') {
    document.documentElement.dir = rtlLangs.includes(base) ? 'rtl' : 'ltr';
    document.documentElement.lang = base;
  }
};

applyDir(i18next.language);
i18next.on('languageChanged', applyDir);

export default i18next;