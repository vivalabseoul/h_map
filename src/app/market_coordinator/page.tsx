'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getFleaMarketsByCreator } from '@/lib/database';
import type { FleaMarket } from '@/types';

export default function MarketCoordinatorDashboard() {
  const { user, userRole } = useAuth();
  const [markets, setMarkets] = useState<FleaMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // If super_admin, we might want to fetch all. For now, fetch by creator to match instructor behavior.
      // Super admins can still delete from DB or we can update later to fetch all if role === super_admin.
      getFleaMarketsByCreator(user.id).then(data => {
        setMarkets(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>플리마켓 관리 대시보드</h1>
          <p>등록하신 플리마켓 정보를 관리합니다.</p>
        </div>
        <Link href="/market_coordinator/new" className="btn btn-primary">
          🎪 새 플리마켓 등록
        </Link>
      </div>

      <div className="card">
        {markets.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            등록된 플리마켓이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {markets.map(market => (
              <div key={market.id} style={{ 
                border: '1px solid var(--color-border)', 
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 var(--space-2) 0' }}>🎪 {market.name.ko}</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    일자: {market.date} | 주소: {market.address.ko}
                  </p>
                </div>
                <div>
                  <span className="badge" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    등록완료
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
