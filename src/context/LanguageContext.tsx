'use client';
// ==========================================
// Language Context — i18n Provider
// ==========================================
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Locale, Translations } from '@/types';
import en from '@/i18n/en.json';
import ja from '@/i18n/ja.json';
import zh from '@/i18n/zh.json';
import ko from '@/i18n/ko.json';

const translations: Record<Locale, Translations> = {
  en: flattenObject(en),
  ja: flattenObject(ja),
  zh: flattenObject(zh),
  ko: flattenObject(ko),
};

// Flatten nested JSON into dot-notation keys
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  React.useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language.split('-')[0].toLowerCase();
      const supported: Locale[] = ['ko', 'en', 'ja', 'zh'];
      const defaultLocale = supported.includes(lang as Locale) ? (lang as Locale) : 'en';
      setLocaleState(defaultLocale);
      document.documentElement.lang = defaultLocale;
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] ?? translations['en']?.[key] ?? key;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
