'use client';
import React from 'react';
import Link from '@/components/LocalizedLink';
import { usePathname } from 'next/navigation';
import { MapPin, BookOpen, Calendar } from 'lucide-react';
import styles from './Sidebar.module.css';

export type SidebarItem = 
  | { type?: 'link'; href: string; label: string; icon: React.ReactNode }
  | { type: 'header'; label: string }
  | { type: 'divider' };

export const instructorMenuItems = [
    { href: '/instructor/workshops', label: 'nav.my_workshops', icon: <MapPin size={20} /> },
    { href: '/instructor/courses', label: 'nav.my_courses', icon: <BookOpen size={20} /> },
    { href: '/instructor/bookings', label: 'nav.my_bookings', icon: <Calendar size={20} /> },
];

interface SidebarProps {
  title: string;
  subtitle?: string;
  emoji?: React.ReactNode;
  items: SidebarItem[];
}

export default function Sidebar({ title, subtitle, emoji, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          {emoji ? (
            <span>{emoji}</span>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          )}
          {title}
        </div>
        {subtitle && <div className={styles.sidebarSubtitle}>{subtitle}</div>}
      </div>

      <nav className={styles.nav}>
        {items.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div key={`header-${index}`} className={styles.navHeader} style={{ padding: 'var(--space-4) var(--space-4) var(--space-2)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </div>
            );
          }
          if (item.type === 'divider') {
            return <div key={`divider-${index}`} className={styles.navDivider} style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 'var(--space-2) var(--space-4)' }} />;
          }

          // Default is 'link'
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
