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
import NotificationBell from './NotificationBell';
import RegisterWorkshopModal from './RegisterWorkshopModal';
import Toast from './Toast';
import styles from './Header.module.css';

export default function Header() {
  const { userRole } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
          🎪 {t('nav.market') || 'Flea Market'}
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

      {/* Removed Desktop Navigation Links as per user request to keep only sidebar menu */}

      <div className={styles.headerActions}>
        <div className={styles.headerRight}>
          <LanguageSwitcher />
          <AuthButton />
        </div>
        
        <NotificationBell />
        
        {/* Register Button */}
        <button
          onClick={() => setShowRegisterModal(true)}
          style={{
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.8rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s, background 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          📍 내 공방 등록하기
        </button>

        {/* Mobile Hamburger Button */}
        <button className={styles.menuButton} onClick={toggleMobileMenu} aria-label="Toggle menu">
          <Menu size={24} />
        </button>
      </div>

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

        {/* Bottom Actions */}
        <div className={styles.mobileBottomActions}>
          <LanguageSwitcher />
          <AuthButton />
        </div>
      </div>

      {showRegisterModal && (
        <RegisterWorkshopModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => {
            setShowRegisterModal(false);
            setShowToast(true);
          }}
        />
      )}

      {showToast && (
        <Toast
          type="success"
          message="공방 등록 신청이 접수되었습니다! 🎉"
          onClose={() => setShowToast(false)}
        />
      )}
    </header>
  );
}
