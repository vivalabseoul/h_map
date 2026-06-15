'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getWorkshops, deleteWorkshop } from '@/lib/database';
import type { Workshop } from '@/types';
import { CATEGORIES } from '@/types';

export default function AdminWorkshopsPage() {
  const { locale, t } = useLanguage();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  useEffect(() => {
    getWorkshops().then(setWorkshops);
  }, []);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (confirm(`스튜디오를 강제로 ${newStatus === 'active' ? '활성화' : '비활성화'} 하시겠습니까?`)) {
      setWorkshops(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteWorkshop(id);
        setWorkshops(prev => prev.filter(w => w.id !== id));
      } catch (err) {
        console.error(err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.workshops')}</h1>
          <p>{workshops.length} workshops total</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Workshop</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workshops.map((w) => {
              const cat = CATEGORIES.find((c) => c.key === w.category);
              return (
                <tr key={w.id}>
                  <td style={{ fontWeight: 500 }}>{w.name[locale]}</td>
                  <td>
                    <span className="badge badge-accent">
                      {cat?.emoji} {t(`filters.${w.category}`)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{w.ownerName || w.ownerId}</td>
                  <td>⭐ {w.rating} ({w.reviewCount})</td>
                  <td>
                    <span className={`badge ${w.status === 'active' ? 'badge-success' : w.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{w.region.replace('_', ' ')}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${w.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(w.id, w.status)}
                    >
                      {w.status === 'active' ? '강제 비활성화' : '다시 활성화'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
