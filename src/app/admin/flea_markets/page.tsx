'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFleaMarkets, deleteFleaMarket, updateFleaMarket } from '@/lib/database';
import type { FleaMarket } from '@/types';
import { Trash2, Pencil, RefreshCw } from 'lucide-react';

export default function AdminFleaMarketsPage() {
  const [markets, setMarkets] = useState<FleaMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive'>('inactive');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = () => {
    setLoading(true);
    getFleaMarkets().then(data => {
      setMarkets(data);
      setLoading(false);
      setSelectedMarkets(new Set());
    });
  };

  const toggleSelectAll = () => {
    if (selectedMarkets.size === markets.length && markets.length > 0) {
      setSelectedMarkets(new Set());
    } else {
      setSelectedMarkets(new Set(markets.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedMarkets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMarkets(newSelected);
  };

  const handleBulkStatusChange = async () => {
    if (selectedMarkets.size === 0) {
      alert('상태를 변경할 플리마켓을 선택해주세요.');
      return;
    }
    if (!confirm(`선택한 ${selectedMarkets.size}개의 플리마켓 상태를 '${bulkStatus === 'active' ? '활성' : '비활성'}'으로 변경하시겠습니까?`)) return;

    setUpdating(true);
    try {
      await Promise.all(
        Array.from(selectedMarkets).map(id => updateFleaMarket(id, { status: bulkStatus }))
      );
      alert('상태가 성공적으로 변경되었습니다.');
      fetchMarkets();
    } catch (e) {
      alert('상태 변경에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncFestivals = async () => {
    if (!confirm('공공 데이터 포털에서 최신 축제 정보를 가져오시겠습니까? 이 작업은 몇 초 정도 걸릴 수 있습니다.')) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-festivals');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync');
      alert(`동기화 성공! ${data.message}`);
      fetchMarkets();
    } catch (err: any) {
      alert('동기화 실패: ' + err.message + '\n\n(.env.local 파일에 FESTIVAL_API_KEY가 있는지 확인해주세요)');
    } finally {
      setSyncing(false);
    }
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
          <h1>플리마켓 관리 (Admin)</h1>
          <p>전체 플리마켓 현황 및 공공 축제 데이터 동기화</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button onClick={handleSyncFestivals} disabled={syncing} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
            {syncing ? '동기화 중...' : '공공 축제 동기화'}
          </button>
          <Link href="/admin/flea_markets/new" className="btn btn-primary">
            + 새 플리마켓 등록
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <select 
            value={bulkStatus} 
            onChange={(e) => setBulkStatus(e.target.value as 'active' | 'inactive')}
            className="form-input"
            style={{ width: '120px', padding: 'var(--space-2)' }}
          >
            <option value="active">활성 (Active)</option>
            <option value="inactive">비활성 (Inactive)</option>
          </select>
          <button 
            onClick={handleBulkStatusChange} 
            disabled={updating || selectedMarkets.size === 0}
            className="btn btn-secondary"
          >
            {updating ? '처리 중...' : '일괄 상태 변경'}
          </button>
        </div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {selectedMarkets.size}개 선택됨
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-3)', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={markets.length > 0 && selectedMarkets.size === markets.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={{ padding: 'var(--space-3)' }}>플리마켓명</th>
              <th style={{ padding: 'var(--space-3)' }}>일자</th>
              <th style={{ padding: 'var(--space-3)' }}>등록자</th>
              <th style={{ padding: 'var(--space-3)' }}>상태</th>
              <th style={{ padding: 'var(--space-3)' }}>신청 클릭수</th>
              <th style={{ padding: 'var(--space-3)' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)', background: selectedMarkets.has(m.id) ? 'var(--color-surface-hover)' : 'transparent' }}>
                <td style={{ padding: 'var(--space-3)' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedMarkets.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                  />
                </td>
                <td style={{ padding: 'var(--space-3)', fontWeight: 'bold' }}>
                  {m.status === 'inactive' ? '🚫 ' : '🎪 '} 
                  {m.name.ko || m.name.en}
                </td>
                <td style={{ padding: 'var(--space-3)' }}>{m.date}</td>
                <td style={{ padding: 'var(--space-3)' }}>{m.creatorName}</td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.85em',
                    background: m.status === 'inactive' ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                    color: m.status === 'inactive' ? 'var(--color-danger)' : 'var(--color-success)'
                  }}>
                    {m.status === 'inactive' ? '비활성' : '활성'}
                  </span>
                </td>
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
                <td colSpan={7} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
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
