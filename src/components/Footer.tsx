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
          <span className={styles.brandName} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            Art flow map
          </span>
          <span className={styles.hideMobile}>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className={styles.hideMobile}>
          <div className={styles.links}>
            <Link href="/about" className={styles.link}>{t('About') || 'About'}</Link>
            <Link href="/faq" className={styles.link}>{t('Faq') || 'FAQ'}</Link>
            <Link href="/terms" className={styles.link}>{t('Terms') || 'Terms'}</Link>
            <Link href="/privacy" className={styles.link}>{t('Privacy') || 'Privacy'}</Link>
            <Link href="/contact" className={styles.link}>{t('Contact') || 'Contact Us'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
