'use client';
import React, { useEffect, useState } from 'react';
import { Users, Store, BookOpen, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getAllUsers, getWorkshops, getCourses } from '@/lib/database';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ users: 0, workshops: 0, courses: 0, bookings: 0 });

  useEffect(() => {
    async function loadStats() {
      const [users, workshops, courses] = await Promise.all([
        getAllUsers(),
        getWorkshops(),
        getCourses(),
      ]);
      setStats({
        users: users.length,
        workshops: workshops.length,
        courses: courses.length,
        bookings: courses.reduce((acc, c) => acc + c.currentParticipants, 0),
      });
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
    </div>
  );
}
