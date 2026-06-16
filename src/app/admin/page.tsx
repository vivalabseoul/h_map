'use client';
import React, { useEffect, useState } from 'react';
import { Users, Store, BookOpen, Calendar } from 'lucide-react';
import { getAllUsers, getWorkshops, getCourses, getInquiries } from '@/lib/database';
import Toast from '@/components/Toast';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ users: 0, workshops: 0, courses: 0, bookings: 0 });
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
    </div>
  );
}
