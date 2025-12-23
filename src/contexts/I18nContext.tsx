import React, { createContext, useContext, useState } from 'react';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import ruTranslations from '../locales/ru.json';
import deTranslations from '../locales/de.json';

type Translations = typeof enTranslations;

const translations: Record<string, Translations> = {
  en: enTranslations,
  es: esTranslations,
  ru: ruTranslations,
  de: deTranslations,
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize locale from localStorage synchronously to avoid effect warning
  const [locale, setLocaleState] = useState<string>(() => {
    const savedLocale = localStorage.getItem('i18n_locale');
    return (savedLocale && translations[savedLocale]) ? savedLocale : 'en';
  });

  const setLocale = (newLocale: string) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem('i18n_locale', newLocale);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = translations.en as any;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in fallback either
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters like {{count}}, {{packName}}, etc.
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{{${paramKey}}}`;
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
