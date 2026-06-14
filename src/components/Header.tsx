'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, LayoutDashboard, BookOpen, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { isAdmin, isInstructor, isMarketCoordinator } from '@/lib/permissions';
import AuthButton from './AuthButton';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Header.module.css';

export default function Header() {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = (isMobile: boolean) => (
    <>
      <Link
        href="/"
        className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname === '/' ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
      >
        <Map size={16} />
        {t('nav.map')}
      </Link>

      {isInstructor(userRole) && (
        <Link
          href="/instructor"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/instructor') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
        >
          <BookOpen size={16} />
          {t('nav.instructor')}
        </Link>
      )}

      {isAdmin(userRole) && (
        <Link
          href="/admin"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/admin') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
        >
          <Shield size={16} />
          {t('nav.admin')}
        </Link>
      )}

      {isMarketCoordinator(userRole) && (
        <Link
          href="/market_coordinator"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/market_coordinator') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
        >
          🎪 {t('nav.market') || '플리마켓'}
        </Link>
      )}

      {userRole && (
        <Link
          href="/my"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/my') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
        >
          <LayoutDashboard size={16} />
          {t('nav.my_page')}
        </Link>
      )}
    </>
  );

  return (
    <header className={styles.header} id="main-header">
      <Link href="/" className={styles.logo}>
        <span>Art flow<span className={styles.logoAccent}> map</span></span>
      </Link>

      {/* Desktop Navigation */}
      <nav className={styles.navLinks}>
        {navLinks(false)}
      </nav>

      <div className={styles.headerRight}>
        <LanguageSwitcher />
        <AuthButton />
      </div>

      {/* Mobile Hamburger Button */}
      <button className={styles.menuButton} onClick={toggleMobileMenu} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      {/* Mobile Slide Menu */}
      <div 
        className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.open : ''}`}
        onClick={toggleMobileMenu}
      />
      <div className={`${styles.mobileMenuContent} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <button className={styles.closeButton} onClick={toggleMobileMenu} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className={styles.mobileNavLinks}>
          {navLinks(true)}
        </nav>
        <div className={styles.mobileBottomActions}>
          <LanguageSwitcher />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
