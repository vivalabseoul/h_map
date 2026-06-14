'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, LayoutDashboard, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { isAdmin, isInstructor } from '@/lib/permissions';
import AuthButton from './AuthButton';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Header.module.css';

export default function Header() {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <header className={styles.header} id="main-header">
      <Link href="/" className={styles.logo}>
        <span className={styles.logoEmoji}>🧶</span>
        <span>Handmade<span className={styles.logoAccent}> Map</span></span>
      </Link>

      <nav className={styles.navLinks}>
        <Link
          href="/"
          className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
        >
          <Map size={16} />
          {t('nav.map')}
        </Link>

        {isInstructor(userRole) && (
          <Link
            href="/instructor"
            className={`${styles.navLink} ${pathname.startsWith('/instructor') ? styles.navLinkActive : ''}`}
          >
            <BookOpen size={16} />
            {t('nav.instructor')}
          </Link>
        )}

        {isAdmin(userRole) && (
          <Link
            href="/admin"
            className={`${styles.navLink} ${pathname.startsWith('/admin') ? styles.navLinkActive : ''}`}
          >
            <Shield size={16} />
            {t('nav.admin')}
          </Link>
        )}

        {userRole && (
          <Link
            href="/my"
            className={`${styles.navLink} ${pathname.startsWith('/my') ? styles.navLinkActive : ''}`}
          >
            <LayoutDashboard size={16} />
            {t('nav.my_page')}
          </Link>
        )}
      </nav>

      <div className={styles.headerRight}>
        <LanguageSwitcher />
        <AuthButton />
      </div>
    </header>
  );
}
