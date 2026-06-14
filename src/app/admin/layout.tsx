'use client';
import React from 'react';
import { LayoutDashboard, Users, Store, BookOpen, MessageSquare } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import RoleGuard from '@/components/RoleGuard';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <RoleGuard allowedRoles={['super_admin', 'manager']}>
      <div className="dashboard-layout">
        <Sidebar
          title={t('admin.dashboard')}
          emoji="🛡️"
          subtitle="Manage your platform"
          items={[
            { href: '/admin', label: t('admin.dashboard'), icon: <LayoutDashboard size={18} /> },
            { href: '/admin/members', label: t('admin.members'), icon: <Users size={18} /> },
            { href: '/admin/workshops', label: t('admin.workshops') || '스튜디오 관리', icon: <Store size={18} /> },
            { href: '/admin/courses', label: t('admin.courses') || '워크샵 관리', icon: <BookOpen size={18} /> },
            { href: '/admin/inquiries', label: '문의 관리 (Inquiries)', icon: <MessageSquare size={18} /> },
          ]}
        />
        <div className="dashboard-content">{children}</div>
      </div>
    </RoleGuard>
  );
}
