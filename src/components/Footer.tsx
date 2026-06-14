'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.brandName}>
              🧶 Handmade Map
            </div>
            <div className={styles.email}>
              <a href="mailto:vivalabseoul@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                vivalabseoul@gmail.com
              </a>
            </div>
          </div>
          <div className={styles.links}>
            <Link href="/about" className={styles.link}>
              {t('About') || '회사소개'}
            </Link>
            <Link href="/terms" className={styles.link}>
              {t('Terms') || '사이트 규정'}
            </Link>
            <Link href="/privacy" className={styles.link}>
              {t('Privacy') || '개인정보처리방침'}
            </Link>
            <Link href="/contact" className={styles.link}>
              {t('Contact') || '문의하기'}
            </Link>
          </div>
        </div>
        <div className={styles.bottom}>
          &copy; {new Date().getFullYear()} VivalabSeoul. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
