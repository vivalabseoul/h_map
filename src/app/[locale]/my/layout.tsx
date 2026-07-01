'use client';
import React from 'react';
import { LayoutDashboard, CalendarCheck, Star, User } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import RoleGuard from '@/components/RoleGuard';
import { useLanguage } from '@/context/LanguageContext';

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <RoleGuard allowedRoles={['member', 'instructor', 'manager', 'super_admin']}>
      <div className="dashboard-layout">
        <Sidebar
          title={t('my.dashboard')}
          emoji="👋"
          subtitle="Manage your activities"
          items={[
            { href: '/my', label: t('my.dashboard'), icon: <LayoutDashboard size={18} /> },
            { href: '/my/bookings', label: t('my.bookings'), icon: <CalendarCheck size={18} /> },
            { href: '/my/reviews', label: t('my.reviews'), icon: <Star size={18} /> },
            { type: 'divider' },
            { href: '/my/profile', label: '프로필 설정', icon: <User size={18} /> },
          ]}
        />
        <div className="dashboard-content">{children}</div>
      </div>
    </RoleGuard>
  );
}
