'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { Locale } from '@/types';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES: { key: Locale; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
  { key: 'zh', label: '中文', flag: '🇨🇳' },
  { key: 'ko', label: '한국어', flag: '🇰🇷' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.key === locale) || LANGUAGES[0];

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        id="language-switcher"
      >
        <Globe size={16} />
        <span className={styles.flag}>{current.flag}</span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.key}
              className={`${styles.option} ${locale === lang.key ? styles.optionActive : ''}`}
              onClick={() => { setLocale(lang.key); setOpen(false); }}
              role="option"
              aria-selected={locale === lang.key}
            >
              <span className={styles.flag}>{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
