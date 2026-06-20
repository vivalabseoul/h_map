'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopsByOwner, deleteWorkshop } from '@/lib/database';
import { CATEGORIES } from '@/types';
import type { Workshop } from '@/types';

export default function InstructorWorkshopsPage() {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) getWorkshopsByOwner(user.id).then(setWorkshops);
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm(t('instructor.confirm_delete') || '정말 삭제하시겠습니까?')) {
      try {
        await deleteWorkshop(id);
        setWorkshops(prev => prev.filter(w => w.id !== id));
      } catch (err) {
        console.error(err);
        alert('스튜디오 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const filteredWorkshops = workshops.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = Object.values(w.name).some(n => n?.toLowerCase().includes(q));
    const descMatch = Object.values(w.description || {}).some(d => d?.toLowerCase().includes(q));
    const catMatch = w.category.toLowerCase().includes(q) || t(`filters.${w.category}`).toLowerCase().includes(q);
    return nameMatch || descMatch || catMatch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('instructor.my_workshops')}</h1>
          <p>{filteredWorkshops.length} workshops found</p>
        </div>
        <Link href="/instructor/workshops/new" className="btn btn-primary">
          <Plus size={18} />
          {t('instructor.create_workshop')}
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="Search by name, description, category..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {workshops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <h3>{t('instructor.no_workshops')}</h3>
          <p>Create your first workshop to start teaching!</p>
          <Link href="/instructor/workshops/new" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            <Plus size={18} />
            {t('instructor.create_workshop')}
          </Link>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="empty-state">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>스튜디오명 (Studio)</th>
                <th>카테고리 (Category)</th>
                <th>평점 (Rating)</th>
                <th>상태 (Status)</th>
                <th>관리 (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkshops.map((w) => {
                const cat = CATEGORIES.find((c) => c.key === w.category);
                return (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {w.name[locale] || w.name.ko || w.name.en || '이름 없음'}
                    </td>
                    <td><span className="badge badge-accent">{cat?.emoji} {t(`filters.${w.category}`)}</span></td>
                    <td>⭐ {w.rating}</td>
                    <td><span className={`badge ${w.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{w.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link href={`/instructor/workshops/${w.id}/edit`} className="btn btn-sm btn-secondary">
                          {t('common.edit')}
                        </Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(w.id)}>
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
