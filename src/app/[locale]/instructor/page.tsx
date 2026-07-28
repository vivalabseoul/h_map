'use client';
import React, { useEffect, useState } from 'react';
import { Store, BookOpen, Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopsByOwner, getCoursesByInstructor, getWorkshopVisitorStats } from '@/lib/database';
import type { Workshop } from '@/types';

const ITEMS_PER_PAGE = 10;

export default function InstructorDashboard() {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ workshops: 0, courses: 0, applicants: 0 });
  const [myWorkshops, setMyWorkshops] = useState<Workshop[]>([]);
  const [visitorStats, setVisitorStats] = useState<Record<string, { pv: number; uv: number }>>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [workshops, courses] = await Promise.all([
        getWorkshopsByOwner(user!.id),
        getCoursesByInstructor(user!.id),
      ]);
      setStats({
        workshops: workshops.length,
        courses: courses.filter((c) => c.status === 'open').length,
        applicants: courses.reduce((acc, c) => acc + c.currentParticipants, 0),
      });
      setMyWorkshops(workshops);

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      const visitorData = await getWorkshopVisitorStats(
        workshops.map((w) => w.id),
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      setVisitorStats(visitorData);
    }
    load();
  }, [user]);

  const statCards = [
    { label: t('instructor.total_workshops'), value: stats.workshops, icon: <Store size={24} />, color: 'var(--color-accent)' },
    { label: t('instructor.active_courses'), value: stats.courses, icon: <BookOpen size={24} />, color: 'var(--color-sage)' },
    { label: t('instructor.total_applicants'), value: stats.applicants, icon: <Users size={24} />, color: 'var(--color-info)' },
  ];

  const totalPages = Math.ceil(myWorkshops.length / ITEMS_PER_PAGE) || 1;
  const paginatedWorkshops = myWorkshops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('instructor.dashboard')}</h1>
          <p>Welcome back, {user?.displayName || 'Instructor'}!</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-8)', background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={20} color="#0284c7" /> 내 스튜디오 클릭수 및 방문자수 (최근 7일)
        </h2>
        {myWorkshops.length > 0 ? (
          <div className="table-wrapper">
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>공방명</th>
                  <th style={{ textAlign: 'center' }}>방문자수 (UV)</th>
                  <th style={{ textAlign: 'center' }}>페이지뷰 (PV)</th>
                  <th style={{ textAlign: 'right' }}>클릭수 (맵/리스트)</th>
                  <th style={{ textAlign: 'right' }}>외부 링크 클릭수</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorkshops.map((w) => {
                  const v = visitorStats[w.id] || { pv: 0, uv: 0 };
                  return (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 600 }}>{w.name[locale] || w.name.ko || w.name.en}</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: 500 }}>{v.uv.toLocaleString()} 명</td>
                      <td style={{ textAlign: 'center' }}>{v.pv.toLocaleString()} 회</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {((w.mapPinClicks || 0) + (w.listClicks || 0)).toLocaleString()} 회
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{(w.totalClicks || 0).toLocaleString()} 회</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {myWorkshops.length > ITEMS_PER_PAGE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'var(--space-4)', fontSize: '0.85rem' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-surface)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{currentPage} / {totalPages} 페이지</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-surface)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
            등록된 공방이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
