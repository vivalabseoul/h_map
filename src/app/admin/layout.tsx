'use client';
import React from 'react';
import { LayoutDashboard, Users, Store, BookOpen, MessageSquare, Star, Tent, PlusCircle, Globe, User, Megaphone } from 'lucide-react';
import Sidebar, { SidebarItem } from '@/components/Sidebar';
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
            { type: 'header', label: '📊 통계 및 관리' },
            { href: '/admin', label: t('admin.dashboard'), icon: <LayoutDashboard size={18} /> },
            { href: '/admin/members', label: t('admin.members'), icon: <Users size={18} /> },
            { href: '/admin/role_requests', label: '등급 승인 관리', icon: <Users size={18} /> },
            { href: '/admin/workshops', label: t('admin.workshops') || '스튜디오 관리', icon: <Store size={18} /> },
            { href: '/admin/courses', label: t('admin.courses') || '워크샵 관리', icon: <BookOpen size={18} /> },
            { href: '/admin/flea_markets', label: '플리마켓 관리', icon: <Tent size={18} /> },
            { href: '/admin/reviews', label: '리뷰 관리', icon: <Star size={18} /> },
            { href: '/admin/inquiries', label: '문의 관리', icon: <MessageSquare size={18} /> },
            { href: '/admin/notices', label: '공지사항 관리', icon: <Megaphone size={18} /> },
            
            { type: 'divider' },
            { type: 'header', label: '✍️ 직접 등록' },
            { href: '/admin/collector', label: '구글 맵스 수집기', icon: <Globe size={18} /> },
            { href: '/admin/workshops/new', label: '스튜디오 등록', icon: <PlusCircle size={18} /> },
            { href: '/admin/courses/new', label: '워크샵 개설', icon: <PlusCircle size={18} /> },
            { href: '/admin/flea_markets/new', label: '플리마켓 등록', icon: <PlusCircle size={18} /> },
            { type: 'divider' },
            { href: '/admin/profile', label: '프로필 설정', icon: <User size={18} /> },
          ] as SidebarItem[]}
        />
        <div className="dashboard-content">
          <div className="mobile-warning">
            <span>⚠️</span>
            <span><strong>안내:</strong> 슈퍼어드민(관리자) 기능은 원활한 데이터 관리 및 입력을 위해 <strong>데스크톱이나 노트북</strong> 환경에서의 사용을 권장합니다.</span>
          </div>
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
