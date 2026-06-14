'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopsByOwner } from '@/lib/database';
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
      // In a real app: await deleteWorkshop(id);
      setWorkshops(prev => prev.filter(w => w.id !== id));
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
                <th>Workshop</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map((w) => {
                const cat = CATEGORIES.find((c) => c.key === w.category);
                return (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 500 }}>{w.name[locale]}</td>
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
