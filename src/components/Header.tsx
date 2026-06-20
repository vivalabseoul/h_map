'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, LayoutDashboard, BookOpen, Shield, Menu, X, LogOut } from 'lucide-react';
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
  const { user, userRole, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Briefly open and close sidebar on mobile to indicate it exists
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsMobileMenuOpen(true);
      const timer = setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = (isMobile: boolean) => (
    <>
      {isMobile && user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 600 }}>{user.displayName?.charAt(0) || user.email?.charAt(0)}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.displayName || user.email}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{user.email}</span>
          </div>
        </div>
      )}
      <Link
        href="/"
        className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname === '/' ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
      >
        <Map size={16} />
        {t('nav.map')}
      </Link>

      {isInstructor(userRole) && (
        <>
          <Link
            href="/instructor"
            className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/instructor') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
            onClick={() => { if (isMobile && pathname === '/instructor') setIsMobileMenuOpen(false); }}
          >
            <BookOpen size={16} />
            {t('nav.instructor')}
          </Link>
          {isMobile && pathname.startsWith('/instructor') && (
            <div className={styles.mobileSubMenuContainer}>
              <Link href="/instructor" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 대시보드</Link>
              <Link href="/instructor/profile" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 프로필 (Profile)</Link>
              <Link href="/instructor/workshops" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 스튜디오 (Studio)</Link>
              <Link href="/instructor/courses" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 워크샵 (Courses)</Link>
              <Link href="/instructor/bookings" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 예약 현황 (Bookings)</Link>
            </div>
          )}
        </>
      )}

      {isAdmin(userRole) && (
        <>
          <Link
            href="/admin"
            className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/admin') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
            onClick={() => { if (isMobile && pathname === '/admin') setIsMobileMenuOpen(false); }}
          >
            <Shield size={16} />
            {t('nav.admin')}
          </Link>
          {isMobile && pathname.startsWith('/admin') && (
            <div className={styles.mobileSubMenuContainer}>
              <Link href="/admin" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 대시보드</Link>
              <Link href="/admin/members" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 회원 관리</Link>
              <Link href="/admin/role_requests" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 등급 승인 관리</Link>
              <Link href="/admin/workshops" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 스튜디오 관리</Link>
              <Link href="/admin/courses" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 워크샵 관리</Link>
              <Link href="/admin/flea_markets" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 플리마켓 관리</Link>
              <Link href="/admin/reviews" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 리뷰 관리</Link>
              <Link href="/admin/inquiries" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 문의 관리</Link>
              <Link href="/admin/notices" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 공지사항 관리</Link>
            </div>
          )}
        </>
      )}

      {isMarketCoordinator(userRole) && (
        <>
          <Link
            href="/market_coordinator"
            className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/market_coordinator') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
            onClick={() => { if (isMobile && pathname === '/market_coordinator') setIsMobileMenuOpen(false); }}
          >
            🎪 {t('nav.market') || 'Flea Market'}
          </Link>
          {isMobile && pathname.startsWith('/market_coordinator') && (
            <div className={styles.mobileSubMenuContainer}>
              <Link href="/market_coordinator" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 대시보드</Link>
              <Link href="/market_coordinator/flea_markets" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 플리마켓 관리</Link>
              <Link href="/market_coordinator/new" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 플리마켓 등록</Link>
            </div>
          )}
        </>
      )}

      {userRole && (
        <>
          <Link
            href="/my"
            className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${pathname.startsWith('/my') ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ''}`}
            onClick={() => { if (isMobile && pathname === '/my') setIsMobileMenuOpen(false); }}
          >
            <LayoutDashboard size={16} />
            {t('nav.my_page')}
          </Link>
          {isMobile && pathname.startsWith('/my') && (
            <div className={styles.mobileSubMenuContainer}>
              <Link href="/my" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 대시보드</Link>
              <Link href="/my/bookings" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ {t('my.bookings')}</Link>
              <Link href="/my/reviews" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ {t('my.reviews')}</Link>
              <Link href="/my/profile" className={styles.mobileSubNavLink} onClick={() => setIsMobileMenuOpen(false)}>└ 프로필 설정</Link>
            </div>
          )}
        </>
      )}

      {isMobile && user && (
        <button onClick={logout} className={styles.mobileNavLink} style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', borderRadius: 0, padding: '16px 20px', color: 'var(--color-danger)' }}>
          <LogOut size={16} />
          {t('nav.logout')}
        </button>
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
        </div>

        <NotificationBell />
        
        <div className={user ? styles.hideOnMobileLoggedIn : ''}>
          <AuthButton />
        </div>

        {/* Register Button */}
        {!user && (
          <button
            className={styles.registerButton}
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
