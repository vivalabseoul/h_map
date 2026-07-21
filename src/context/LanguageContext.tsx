'use client';
// ==========================================
// Language Context — i18n Provider
// ==========================================
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
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
  setLocale: (newLocale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentLocale = (params?.locale as Locale) || 'en';

  // Auto-detect browser/OS language on first visit if no explicit saved locale preference
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLocale = localStorage.getItem('artflow_user_locale');
    if (!savedLocale && navigator.language) {
      const navLang = navigator.language.toLowerCase();
      let detected: Locale = 'en';
      if (navLang.startsWith('ko')) detected = 'ko';
      else if (navLang.startsWith('ja')) detected = 'ja';
      else if (navLang.startsWith('zh')) detected = 'zh';

      if (detected !== currentLocale && (pathname === '/' || pathname === `/${currentLocale}`)) {
        localStorage.setItem('artflow_user_locale', detected);
        const segments = (pathname || '/').split('/');
        if (segments.length > 1 && ['en', 'ko', 'ja', 'zh'].includes(segments[1])) {
          segments[1] = detected;
        } else {
          segments.unshift(detected);
        }
        const newPath = segments.join('/') || `/${detected}`;
        router.replace(newPath);
      }
    }
  }, [currentLocale, pathname, router]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!pathname) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('artflow_user_locale', newLocale);
    }
    
    // Replace current locale in pathname with new locale
    const segments = pathname.split('/');
    if (segments.length > 1 && ['en', 'ko', 'ja', 'zh'].includes(segments[1])) {
      segments[1] = newLocale; // Assumes structure is /[locale]/...
    }
    
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
  }, [pathname, router]);

  const t = useCallback(
    (key: string): string => {
      return translations[currentLocale]?.[key] ?? translations['en']?.[key] ?? key;
    },
    [currentLocale]
  );

  const value = useMemo(() => ({ 
    locale: currentLocale, 
    setLocale, 
    t 
  }), [currentLocale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useLocalizedRouter() {
  const router = useRouter();
  const { locale } = useLanguage();

  return useMemo(() => ({
    ...router,
    push: (href: string, options?: any) => {
      let localizedHref = href;
      if (typeof href === 'string' && href.startsWith('/')) {
        const segments = href.split('/');
        const locales = ['ko', 'en', 'ja', 'zh'];
        if (!locales.includes(segments[1])) {
          localizedHref = `/${locale}${href === '/' ? '' : href}`;
        }
      }
      return router.push(localizedHref, options);
    },
    replace: (href: string, options?: any) => {
      let localizedHref = href;
      if (typeof href === 'string' && href.startsWith('/')) {
        const segments = href.split('/');
        const locales = ['ko', 'en', 'ja', 'zh'];
        if (!locales.includes(segments[1])) {
          localizedHref = `/${locale}${href === '/' ? '' : href}`;
        }
      }
      return router.replace(localizedHref, options);
    }
  }), [router, locale]);
}
