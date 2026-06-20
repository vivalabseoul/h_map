'use client';
import React, { useEffect, useState } from 'react';
import { Users, Store, BookOpen, Calendar } from 'lucide-react';
import { getAllUsers, getWorkshops, getCourses, getInquiries } from '@/lib/database';
import type { Workshop } from '@/types';
import Toast from '@/components/Toast';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboard() {
  const { locale, t } = useLanguage();
  const [stats, setStats] = useState({ users: 0, workshops: 0, courses: 0, bookings: 0 });
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const [users, workshops, courses, inquiries] = await Promise.all([
        getAllUsers(),
        getWorkshops(),
        getCourses(),
        getInquiries(),
      ]);
      setStats({
        users: users.length,
        workshops: workshops.length,
        courses: courses.length,
        bookings: courses.reduce((acc, c) => acc + c.currentParticipants, 0),
      });
      setAllWorkshops(workshops);

      const pendingReg = inquiries.filter(i => i.status === 'pending' && i.category === 'registration').length;
      if (pendingReg > 0) {
        setPendingRegistrations(pendingReg);
        setShowToast(true);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: t('admin.total_users'), value: stats.users, icon: <Users size={24} />, color: 'var(--color-info)' },
    { label: t('admin.total_workshops'), value: stats.workshops, icon: <Store size={24} />, color: 'var(--color-accent)' },
    { label: t('admin.total_courses'), value: stats.courses, icon: <BookOpen size={24} />, color: 'var(--color-sage)' },
    { label: t('admin.active_bookings'), value: stats.bookings, icon: <Calendar size={24} />, color: 'var(--color-clay)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.dashboard')}</h1>
          <p>Platform overview and management</p>
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

      {showToast && (
        <Toast
          type="warning"
          message={`현재 ${pendingRegistrations}건의 새로운 공방 등록 신청이 대기 중입니다! (문의하기 메뉴 확인)`}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Ranking Section */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
          🔥 인기 공방 (외부 링크 클릭 수 랭킹)
        </h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>순위</th>
                <th>공방명</th>
                <th>지역</th>
                <th style={{ textAlign: 'right' }}>조회 수(클릭)</th>
              </tr>
            </thead>
            <tbody>
              {allWorkshops
                .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))
                .slice(0, 10)
                .map((w, index) => (
                  <tr key={w.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: index < 3 ? 'var(--color-accent)' : 'inherit' }}>
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: 500 }}>{w.name[locale] || w.name.ko || w.name.en}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{w.region.replace('_', ' ')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {(w.totalClicks || 0).toLocaleString()} 회
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                        <span>길찾기:{w.navClicks || 0}</span>
                        <span>인스타:{w.instagramClicks || 0}</span>
                        <span>웹:{w.websiteClicks || 0}</span>
                        <span>유튜브:{w.youtubeClicks || 0}</span>
                        <span>공유:{w.shareClicks || 0}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              {allWorkshops.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-4)' }}>데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
