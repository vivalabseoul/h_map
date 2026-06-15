'use client';
import React from 'react';
import { LayoutDashboard, Store, BookOpen, User, Calendar } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import RoleGuard from '@/components/RoleGuard';
import { useLanguage } from '@/context/LanguageContext';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <RoleGuard allowedRoles={['instructor', 'super_admin', 'manager']}>
      <div className="dashboard-layout">
        <Sidebar
          title={t('instructor.dashboard')}
          emoji="🎨"
          subtitle="Manage your workshops"
          items={[
            { href: '/instructor', label: t('instructor.dashboard'), icon: <LayoutDashboard size={18} /> },
            { href: '/instructor/profile', label: '프로필 (Profile)', icon: <User size={18} /> },
            { href: '/instructor/workshops', label: '스튜디오 (Studio)', icon: <Store size={18} /> },
            { href: '/instructor/courses', label: t('instructor.my_courses'), icon: <BookOpen size={18} /> },
            { href: '/instructor/bookings', label: '예약 현황 (Bookings)', icon: <Calendar size={18} /> },
          ]}
        />
        <div className="dashboard-content">{children}</div>
      </div>
    </RoleGuard>
  );
}
