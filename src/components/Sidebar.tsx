'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

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
        {items.map((item) => {
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

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Map
        </Link>
      </div>
    </aside>
  );
}
