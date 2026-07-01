'use client';
import React, { useEffect, useState } from 'react';
import { Users, Store, BookOpen, Calendar, Activity, MousePointerClick, TrendingUp } from 'lucide-react';
import { getAllUsers, getWorkshops, getCourses, getInquiries, getClickTrends, getClicksByType, getTotalClicks } from '@/lib/database';
import type { Workshop } from '@/types';
import type { ClickTrendItem, ClicksByTypeItem } from '@/lib/database';
import Toast from '@/components/Toast';
import { useLanguage } from '@/context/LanguageContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#F5A623', '#4A90E2', '#7ED321', '#FF4B4B', '#9013FE', '#50E3C2', '#BD10E0'];

export default function AdminDashboard() {
  const { locale, t } = useLanguage();
  const [stats, setStats] = useState({ users: 0, workshops: 0, courses: 0, bookings: 0 });
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Analytics state - now fetched from workshop_clicks
  const [totalClicks, setTotalClicks] = useState(0);
  const [visitTrendsData, setVisitTrendsData] = useState<ClickTrendItem[]>([]);
  const [trafficSourcesData, setTrafficSourcesData] = useState<ClicksByTypeItem[]>([]);

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

    async function loadAnalytics() {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const [trends, byType, total] = await Promise.all([
        getClickTrends(startStr, endStr),
        getClicksByType(startStr, endStr),
        getTotalClicks(startStr, endStr),
      ]);
      setVisitTrendsData(trends);
      setTrafficSourcesData(byType);
      setTotalClicks(total);
    }

    loadStats();
    loadAnalytics();
  }, []);

  const avgCTR = totalClicks > 0 && stats.workshops > 0
    ? ((trafficSourcesData.reduce((s, d) => s + d.value, 0) / Math.max(totalClicks, 1)) * 100).toFixed(1)
    : '0';

  const statCards = [
    { label: t('admin.total_users'), value: stats.users, icon: <Users size={24} />, color: 'var(--color-info)' },
    { label: t('admin.total_workshops'), value: stats.workshops, icon: <Store size={24} />, color: 'var(--color-accent)' },
    { label: '최근 7일 총 클릭수', value: totalClicks.toLocaleString(), icon: <Activity size={24} />, color: '#F5A623' },
    { label: '외부 링크 클릭률', value: `${avgCTR}%`, icon: <MousePointerClick size={24} />, color: '#9013FE' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.dashboard')}</h1>
          <p>플랫폼 현황 및 클릭 분석</p>
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

      {/* Analytics Charts Section */}
      <div style={{ marginTop: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Click Trend Chart */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--color-primary)" /> 최근 7일 클릭 추이
          </h2>
          {visitTrendsData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={visitTrendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" name="지도 핀 클릭" dataKey="mapPinClicks" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="리스트 클릭" dataKey="listClicks" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="외부 링크" dataKey="externalClicks" stroke="#9013FE" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>

        {/* Traffic Sources Pie Chart */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--color-accent)" /> 클릭 유형별 비율
          </h2>
          {trafficSourcesData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={trafficSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {trafficSourcesData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} 
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Ranking Section */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
          🔥 인기 공방 (지도 및 리스트 클릭 랭킹)
        </h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>순위</th>
                <th>공방명</th>
                <th style={{ textAlign: 'center' }}>내부 클릭 (맵/리스트)</th>
                <th style={{ textAlign: 'right' }}>외부 링크/기타</th>
              </tr>
            </thead>
            <tbody>
              {allWorkshops
                .map(w => ({ ...w, popularity: (w.mapPinClicks || 0) + (w.listClicks || 0) }))
                .sort((a, b) => {
                   if (b.popularity !== a.popularity) return b.popularity - a.popularity;
                   return (b.totalClicks || 0) - (a.totalClicks || 0);
                })
                .slice(0, 10)
                .map((w, index) => (
                  <tr key={w.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: index < 3 ? 'var(--color-accent)' : 'inherit' }}>
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {w.name[locale] || w.name.ko || w.name.en}
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{w.region.replace('_', ' ')}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {w.popularity.toLocaleString()} 회
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <span>맵 핀: {w.mapPinClicks || 0}</span>
                        <span>리스트: {w.listClicks || 0}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {(w.totalClicks || 0).toLocaleString()} 회
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                        <span>길찾기:{w.navClicks || 0}</span>
                        <span>인스타:{w.instagramClicks || 0}</span>
                        <span>웹:{w.websiteClicks || 0}</span>
                        <span>유튜브:{w.youtubeClicks || 0}</span>
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
