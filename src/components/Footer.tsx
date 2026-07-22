'use client';
import React from 'react';
import Link from '@/components/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.links}>
            <Link href="/about" className={styles.link}>{t('About') || 'About'}</Link>
            <Link href="/faq" className={styles.link}>{t('Faq') || 'FAQ'}</Link>
            <Link href="/terms" className={styles.link}>{t('Terms') || 'Terms'}</Link>
            <Link href="/privacy" className={styles.link}>{t('Privacy') || 'Privacy'}</Link>
            <Link href="/contact" className={styles.link}>{t('Contact') || 'Contact Us'}</Link>
          </div>
        </div>

        <div className={styles.right}>
          <span>&copy; {new Date().getFullYear()} Moonga Corp.</span>
          <span style={{ fontWeight: 600 }}>Powered by TourAPI</span>
        </div>
      </div>
    </footer>
  );
}
