'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFleaMarkets, deleteFleaMarket } from '@/lib/database';
import type { FleaMarket } from '@/types';
import { Trash2, Pencil } from 'lucide-react';

export default function AdminFleaMarketsPage() {
  const [markets, setMarkets] = useState<FleaMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = () => {
    setLoading(true);
    getFleaMarkets().then(data => {
      setMarkets(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 플리마켓을 삭제하시겠습니까?')) {
      try {
        await deleteFleaMarket(id);
        fetchMarkets();
      } catch (e) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>플리마켓 관리</h1>
          <p>등록된 전체 플리마켓을 확인하고 관리합니다.</p>
        </div>
        <Link href="/admin/flea_markets/new" className="btn btn-primary">
          🎪 새 플리마켓 등록
        </Link>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-3)' }}>플리마켓명</th>
              <th style={{ padding: 'var(--space-3)' }}>일자</th>
              <th style={{ padding: 'var(--space-3)' }}>등록자</th>
              <th style={{ padding: 'var(--space-3)' }}>신청 클릭수</th>
              <th style={{ padding: 'var(--space-3)' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-3)', fontWeight: 'bold' }}>🎪 {m.name.ko || m.name.en}</td>
                <td style={{ padding: 'var(--space-3)' }}>{m.date}</td>
                <td style={{ padding: 'var(--space-3)' }}>{m.creatorName}</td>
                <td style={{ padding: 'var(--space-3)' }}>
                  {m.vendorApplicationLink ? (
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{m.applicationClicks || 0}회</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
                  )}
                </td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Link href={`/admin/flea_markets/${m.id}/edit`} style={{ color: 'var(--color-primary)', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Pencil size={18} />
                    </Link>
                    <button onClick={() => handleDelete(m.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {markets.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  등록된 플리마켓이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
