'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from '@/components/LocalizedLink';
import { LogIn, LogOut, User, LayoutDashboard, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { isAdmin, isInstructor } from '@/lib/permissions';
import styles from './AuthButton.module.css';

export default function AuthButton() {
  const { user, userRole, logout } = useAuth();
  const { t } = useLanguage();
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

  if (!user) {
    return (
      <Link href="/login" className={`btn ${styles.signInBtn}`} id="sign-in-button">
        {t('nav.login')}
      </Link>
    );
  }

  const initials = (user.displayName || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleColors: Record<string, string> = {
    super_admin: 'var(--color-danger)',
    manager: 'var(--color-warning)',
    instructor: 'var(--color-sage)',
    member: 'var(--color-info)',
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.profileBtn}
        onClick={() => setOpen(!open)}
        id="profile-button"
      >
        <div className={styles.avatar}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            initials
          )}
        </div>
        <span className={styles.userName}>{user.displayName || user.email}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownName}>{user.displayName}</div>
            <div className={styles.dropdownEmail}>{user.email}</div>
            {userRole && (
              <span
                className={styles.roleBadge}
                style={{
                  background: `${roleColors[userRole]}20`,
                  color: roleColors[userRole],
                }}
              >
                {t(`admin.${userRole === 'instructor' ? 'instructor_role' : userRole === 'member' ? 'member_role' : userRole}`)}
              </span>
            )}
          </div>

          <Link
            href="/my"
            className={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={16} />
            {t('nav.my_page')}
          </Link>

          {isInstructor(userRole) && (
            <Link
              href="/instructor"
              className={styles.dropdownItem}
              onClick={() => setOpen(false)}
            >
              <BookOpen size={16} />
              {t('nav.instructor')}
            </Link>
          )}

          {isAdmin(userRole) && (
            <Link
              href="/admin"
              className={styles.dropdownItem}
              onClick={() => setOpen(false)}
            >
              <Shield size={16} />
              {t('nav.admin')}
            </Link>
          )}

          <button
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            onClick={() => { logout(); setOpen(false); }}
          >
            <LogOut size={16} />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
