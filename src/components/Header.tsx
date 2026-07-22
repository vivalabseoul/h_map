'use client';
import { useLocalizedRouter } from '@/context/LanguageContext';
import React, { useState, useEffect, useCallback } from 'react';
import Link from '@/components/LocalizedLink';
import { useModalHistory } from '@/hooks/useModalHistory';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ArrowLeft, Map, LayoutDashboard, BookOpen, Shield, X, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFilter } from '@/context/FilterContext';
import { isAdmin, isInstructor, isMarketCoordinator } from '@/lib/permissions';
import AuthButton from './AuthButton';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import RegisterWorkshopModal from './RegisterWorkshopModal';
import Toast from './Toast';
import styles from './Header.module.css';

export default function Header() {
  const { user, userRole, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useLocalizedRouter();
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useFilter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleAccordion = useCallback((key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Close mobile menu on route change & auto expand active menu
  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (pathname.startsWith('/instructor')) setExpandedMenus(prev => ({ ...prev, instructor: true }));
    else if (pathname.startsWith('/admin')) setExpandedMenus(prev => ({ ...prev, admin: true }));
    else if (pathname.startsWith('/market_coordinator')) setExpandedMenus(prev => ({ ...prev, market_coordinator: true }));
    else if (pathname.startsWith('/my')) setExpandedMenus(prev => ({ ...prev, my: true }));
  }, [pathname]);

  // Track mobile screen size for responsive rendering
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const closeRegisterModal = useCallback(() => setShowRegisterModal(false), []);

  useModalHistory(isMobileMenuOpen, closeMobileMenu);
  useModalHistory(showRegisterModal, closeRegisterModal);

  const navLinks = (isMobile: boolean) => (
    <>
      {isMobile && user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 600 }}>{user.displayName?.charAt(0) || user.email?.charAt(0)}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.displayName || user.email}</span>
          </div>
        </div>
      )}
      <Link
        href="/"
        className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname === '/' ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
        onClick={() => isMobile && setTimeout(() => setIsMobileMenuOpen(false), 150)}
      >
        <Map size={16} />
        {t('nav.map')}
      </Link>

      {isInstructor(userRole) && (
        <Link
          href="/instructor"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/instructor') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
          onClick={() => isMobile && setTimeout(() => setIsMobileMenuOpen(false), 150)}
        >
          <BookOpen size={16} />
          {t('nav.instructor')}
        </Link>
      )}

      {isAdmin(userRole) && (
        <Link
          href="/admin"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/admin') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
          onClick={() => isMobile && setTimeout(() => setIsMobileMenuOpen(false), 150)}
        >
          <Shield size={16} />
          {t('nav.admin')}
        </Link>
      )}

      {isMarketCoordinator(userRole) && (
        <Link
          href="/market_coordinator"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/market_coordinator') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
          onClick={() => isMobile && setTimeout(() => setIsMobileMenuOpen(false), 150)}
        >
          {t('nav.market') || 'Flea Market'}
        </Link>
      )}

      {userRole && (
        <Link
          href="/my"
          className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/my') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
          onClick={() => isMobile && setTimeout(() => setIsMobileMenuOpen(false), 150)}
        >
          <LayoutDashboard size={16} />
          {t('nav.my_page')}
        </Link>
      )}

      {isMobile && (
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 8px' }}>
            <Link href="/about" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }} onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}>About</Link>
            <Link href="/faq" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }} onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}>FAQ</Link>
            <Link href="/notices" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }} onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}>Notice</Link>
            <Link href="/terms" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }} onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}>Terms</Link>
            <Link href="/privacy" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }} onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}>Privacy</Link>
            <Link href="/contact" style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }} onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}>Contact</Link>
          </div>
        </div>
      )}

      {isMobile && user && (
        <button onClick={logout} className={styles.mobileNavLink} style={{ marginTop: '8px', color: 'var(--color-danger)', border: '1px solid var(--color-border)' }}>
          <LogOut size={16} />
          {t('nav.logout')}
        </button>
      )}

      {isMobile && (
        <div style={{ paddingTop: '12px', paddingBottom: '8px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>&copy; {new Date().getFullYear()} Moonga Corp.</span>
          <span style={{ fontWeight: 600 }}>Powered by TourAPI</span>
        </div>
      )}
    </>
  );

  return (
    <header className={styles.header} id="main-header">
      {pathname === '/' ? (
        <div className={styles.headerSearchContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Art Flow Map Logo" className={styles.headerSearchIcon} style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
          <input 
            type="text"
            className={styles.headerSearchInput}
            placeholder={isMobileScreen ? (t('search.placeholder_short') || "Art Flow Map") : (t('search.placeholder_long') || "Art Flow Map - Find a craft studio")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      ) : (
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Art flow map
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>| Local Craft & Festival</span>
          </span>
        </Link>
      )}

      {/* Removed Desktop Navigation Links as per user request to keep only sidebar menu */}

      <div className={styles.headerActions}>
        <div className={styles.headerRight}>
          <LanguageSwitcher />
        </div>

        <div className={styles.hideOnMobile}>
          <NotificationBell />
        </div>
        
        <div className={user ? styles.hideOnMobileLoggedIn : ''}>
          <AuthButton />
        </div>

        {/* Register Button */}
        {!user && (
          <button
            className={`btn ${styles.registerButton}`}
            onClick={() => setShowRegisterModal(true)}
          >
            내 공방 등록
          </button>
        )}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSwitcher />
            <NotificationBell />
          </div>
          <button className={styles.closeButton} onClick={toggleMobileMenu} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>
        <nav className={styles.mobileNavLinks}>
          {navLinks(true)}
        </nav>
      </div>

      {showRegisterModal && (
        <RegisterWorkshopModal
          onClose={closeRegisterModal}
          onSuccess={() => {
            closeRegisterModal();
            setShowToast(true);
          }}
        />
      )}

      {showToast && (
        <Toast
          type="success"
          message="공방 등록 신청이 접수되었습니다!"
          onClose={() => setShowToast(false)}
        />
      )}
    </header>
  );
}
