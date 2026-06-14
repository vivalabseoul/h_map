'use client';
import React, { useEffect, useState } from 'react';
import { Store, BookOpen, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopsByOwner, getCoursesByInstructor } from '@/lib/firestore';

export default function InstructorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ workshops: 0, courses: 0, applicants: 0 });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [workshops, courses] = await Promise.all([
        getWorkshopsByOwner(user!.uid),
        getCoursesByInstructor(user!.uid),
      ]);
      setStats({
        workshops: workshops.length,
        courses: courses.filter((c) => c.status === 'open').length,
        applicants: courses.reduce((acc, c) => acc + c.currentParticipants, 0),
      });
    }
    load();
  }, [user]);

  const statCards = [
    { label: t('instructor.total_workshops'), value: stats.workshops, icon: <Store size={24} />, color: 'var(--color-accent)' },
    { label: t('instructor.active_courses'), value: stats.courses, icon: <BookOpen size={24} />, color: 'var(--color-sage)' },
    { label: t('instructor.total_applicants'), value: stats.applicants, icon: <Users size={24} />, color: 'var(--color-info)' },
  ];

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
    </div>
  );
}
