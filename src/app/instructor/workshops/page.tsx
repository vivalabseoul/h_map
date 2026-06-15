'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopsByOwner, deleteWorkshop } from '@/lib/database';
import { CATEGORIES } from '@/types';
import type { Workshop } from '@/types';

export default function InstructorWorkshopsPage() {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('instructor.my_workshops')}</h1>
          <p>{workshops.length} workshops</p>
        </div>
        <Link href="/instructor/workshops/new" className="btn btn-primary">
          <Plus size={18} />
          {t('instructor.create_workshop')}
        </Link>
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
              {workshops.map((w) => {
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
