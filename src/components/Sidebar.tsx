'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import styles from './Sidebar.module.css';

export type SidebarItem = 
  | { type?: 'link'; href: string; label: string; icon: React.ReactNode }
  | { type: 'header'; label: string }
  | { type: 'divider' };

interface SidebarProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  items: SidebarItem[];
}

export default function Sidebar({ title, subtitle, emoji = '🧶', items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          <span>{emoji}</span>
          {title}
        </div>
        {subtitle && <div className={styles.sidebarSubtitle}>{subtitle}</div>}
      </div>

      <nav className={styles.nav}>
        {items.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div key={`header-${index}`} style={{ padding: 'var(--space-4) var(--space-4) var(--space-2)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </div>
            );
          }
          if (item.type === 'divider') {
            return <div key={`divider-${index}`} style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 'var(--space-2) var(--space-4)' }} />;
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
