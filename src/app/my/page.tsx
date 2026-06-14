'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getBookingsByUser, getReviewsByUser } from '@/lib/firestore';

export default function MyDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, reviews: 0 });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [bookings, reviews] = await Promise.all([
        getBookingsByUser(user!.uid),
        getReviewsByUser(user!.uid),
      ]);
      setStats({
        bookings: bookings.filter((b) => b.status === 'confirmed').length,
        reviews: reviews.length,
      });
    }
    load();
  }, [user]);

  const statCards = [
    { label: t('my.upcoming'), value: stats.bookings, icon: <CalendarCheck size={24} />, color: 'var(--color-sage)', href: '/my/bookings' },
    { label: t('my.reviews'), value: stats.reviews, icon: <Star size={24} />, color: 'var(--color-warning)', href: '/my/reviews' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('my.dashboard')}</h1>
          <p>Welcome back, {user?.displayName || 'Traveler'}!</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => (
          <Link href={stat.href} className="stat-card" key={stat.label} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
