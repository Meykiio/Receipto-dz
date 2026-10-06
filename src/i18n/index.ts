import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ar } from './locales/ar';
import { fr } from './locales/fr';
import { en } from './locales/en';

export const supportedLocales = ['ar', 'fr', 'en'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'ar';

const STORAGE_KEY = 'receipto.locale';

export const isSupportedLocale = (value: string): value is SupportedLocale =>
  (supportedLocales as readonly string[]).includes(value);

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Last-chance locale for visitors with no saved preference. Arabic is the
 * default audience, so it wins over the browser's Accept-Language header.
 */
const detectInitialLocale = (): SupportedLocale => {
  if (isBrowser()) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isSupportedLocale(stored)) return stored;
    } catch {
      // private mode / blocked storage: fall through to the default
    }
  }
  return DEFAULT_LOCALE;
};

export const getStoredLocale = (): SupportedLocale | null => {
  if (!isBrowser()) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && isSupportedLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

const persistLocale = (locale: SupportedLocale) => {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // preference simply will not survive a reload
  }
};

const applyDocumentLocale = (locale: SupportedLocale) => {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
};

const initialLocale = detectInitialLocale();

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Set the document direction before the first paint, so a returning visitor who
// picked English does not get an Arabic flash.
if (typeof document !== 'undefined') applyDocumentLocale(initialLocale);

export const setAppLocale = (locale: SupportedLocale): void => {
  persistLocale(locale);
  if (i18n.language !== locale) void i18n.changeLanguage(locale);
  applyDocumentLocale(locale);
};

export default i18n;
