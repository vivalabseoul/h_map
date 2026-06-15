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
        <div className={styles.left}>
          <span className={styles.brandName}>🎨 Art flow map</span>
          <span className={styles.hideMobile}>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className={styles.links}>
          <Link href="/about" className={styles.link}>{t('About') || '회사소개'}</Link>
          <Link href="/faq" className={styles.link}>{t('Faq') || '자주 묻는 질문'}</Link>
          <Link href="/terms" className={styles.link}>{t('Terms') || '이용규정'}</Link>
          <Link href="/privacy" className={styles.link}>{t('Privacy') || '개인정보'}</Link>
          <Link href="/contact" className={styles.link}>{t('Contact') || '문의하기'}</Link>
          <a href="mailto:vivalabseoul@gmail.com" className={`${styles.link} ${styles.hideMobile}`}>Email</a>
        </div>
      </div>
    </footer>
  );
}
