'use client';
import React from 'react';
import { LayoutDashboard, PlusCircle, Tent } from 'lucide-react';
import Sidebar, { SidebarItem } from '@/components/Sidebar';
import RoleGuard from '@/components/RoleGuard';

export default function MarketCoordinatorLayout({ children }: { children: React.ReactNode }) {
  const sidebarItems: SidebarItem[] = [
    { type: 'header', label: '📊 코디네이터 메뉴' },
    { href: '/market_coordinator', label: '대시보드 홈', icon: <LayoutDashboard size={18} /> },
    { href: '/market_coordinator/flea_markets', label: '플리마켓 관리', icon: <Tent size={18} /> },
    { type: 'divider' },
    { type: 'header', label: '✍️ 직접 등록' },
    { href: '/market_coordinator/new', label: '플리마켓 등록', icon: <PlusCircle size={18} /> },
  ];

  return (
    <RoleGuard allowedRoles={['market_coordinator', 'super_admin', 'manager']}>
      <div className="dashboard-layout">
        <Sidebar 
          title="플리마켓 관리" 
          subtitle="Coordinator Dashboard" 
          emoji="🎪" 
          items={sidebarItems} 
        />
        <div className="dashboard-content">
          <div className="mobile-warning">
            <span>⚠️</span>
            <span><strong>안내:</strong> 플리마켓 등록 및 데이터 관리는 원활한 사용을 위해 <strong>데스크톱이나 노트북</strong> 환경에서의 사용을 권장합니다.</span>
          </div>
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
