'use client';
import React, { useEffect, useState } from 'react';
import { Users, Store, BookOpen, Calendar, Activity, MousePointerClick, TrendingUp, ExternalLink, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getAllUsers, getWorkshops, getCourses, getInquiries, getClickTrends, getClicksByType, getTotalClicks, getDailyVisitorStats, getVisitorTrends } from '@/lib/database';
import type { Workshop } from '@/types';
import type { ClickTrendItem, ClicksByTypeItem, VisitorTrendItem } from '@/lib/database';
import Toast from '@/components/Toast';
import { useLanguage } from '@/context/LanguageContext';
const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const { locale, t } = useLanguage();
  const [stats, setStats] = useState({ users: 0, workshops: 0, courses: 0, bookings: 0 });
  const [visitorStats, setVisitorStats] = useState({ todayPV: 0, todayUV: 0 });
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Analytics state - now fetched from workshop_clicks
  const [totalClicks, setTotalClicks] = useState(0);
  const [visitTrendsData, setVisitTrendsData] = useState<ClickTrendItem[]>([]);
  const [trafficSourcesData, setTrafficSourcesData] = useState<ClicksByTypeItem[]>([]);
  const [visitorTrendsData, setVisitorTrendsData] = useState<VisitorTrendItem[]>([]);

  useEffect(() => {
    async function loadStats() {
      const [users, workshops, courses, inquiries, visitors] = await Promise.all([
        getAllUsers(),
        getWorkshops(),
        getCourses(),
        getInquiries(),
        getDailyVisitorStats(),
      ]);
      setStats({
        users: users.length,
        workshops: workshops.length,
        courses: courses.length,
        bookings: courses.reduce((acc, c) => acc + c.currentParticipants, 0),
      });
      setVisitorStats(visitors);
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

      const [trends, byType, total, visitorTrends] = await Promise.all([
        getClickTrends(startStr, endStr),
        getClicksByType(startStr, endStr),
        getTotalClicks(startStr, endStr),
        getVisitorTrends(startStr, endStr),
      ]);
      setVisitTrendsData(trends);
      setTrafficSourcesData(byType);
      setTotalClicks(total);
      setVisitorTrendsData(visitorTrends);
    }

    loadStats();
    loadAnalytics();
  }, []);

  const sortedWorkshops = React.useMemo(() => {
    return allWorkshops
      .map(w => ({ ...w, popularity: (w.mapPinClicks || 0) + (w.listClicks || 0) }))
      .sort((a, b) => {
        if (b.popularity !== a.popularity) return b.popularity - a.popularity;
        return (b.totalClicks || 0) - (a.totalClicks || 0);
      });
  }, [allWorkshops]);

  const totalPages = Math.ceil(sortedWorkshops.length / ITEMS_PER_PAGE) || 1;
  const paginatedWorkshops = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedWorkshops.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedWorkshops, currentPage]);

  const avgCTR = totalClicks > 0 && stats.workshops > 0
    ? ((trafficSourcesData.reduce((s, d) => s + d.value, 0) / Math.max(totalClicks, 1)) * 100).toFixed(1)
    : '0';

  const statCards = [
    { label: t('admin.total_users'), value: stats.users, icon: <Users size={24} />, color: 'var(--color-info)' },
    { label: t('admin.total_workshops'), value: stats.workshops, icon: <Store size={24} />, color: 'var(--color-accent)' },
    { label: '오늘의 방문자 수 (UV/PV)', value: `${visitorStats.todayUV}명 (${visitorStats.todayPV} PV)`, icon: <Eye size={24} />, color: '#0284c7' },
    { label: '최근 7일 총 클릭수', value: totalClicks.toLocaleString(), icon: <Activity size={24} />, color: '#F5A623' },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>{t('admin.dashboard')}</h1>
          <p>플랫폼 현황 및 클릭 분석</p>
        </div>
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: 'var(--radius-md, 8px)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s',
          }}
        >
          <span>📊 Google Analytics 실시간 분석 (GA4)</span>
          <ExternalLink size={16} />
        </a>
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

      {/* Numerical Analytics Tables Section */}
      <div style={{ marginTop: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Daily Click Trend Table */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--color-primary)" /> 최근 7일 일별 클릭 현황
          </h2>
          {visitTrendsData.length > 0 ? (
            <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th style={{ textAlign: 'center' }}>지도 핀</th>
                    <th style={{ textAlign: 'center' }}>리스트</th>
                    <th style={{ textAlign: 'center' }}>외부 링크</th>
                    <th style={{ textAlign: 'right' }}>합계</th>
                  </tr>
                </thead>
                <tbody>
                  {visitTrendsData.map((item) => (
                    <tr key={item.date}>
                      <td style={{ fontWeight: 600 }}>{item.label}</td>
                      <td style={{ textAlign: 'center', color: 'var(--color-primary)', fontWeight: 500 }}>{item.mapPinClicks} 회</td>
                      <td style={{ textAlign: 'center', color: 'var(--color-accent)', fontWeight: 500 }}>{item.listClicks} 회</td>
                      <td style={{ textAlign: 'center', color: '#9013FE', fontWeight: 500 }}>{item.externalClicks} 회</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.totalClicks} 회</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>

        {/* Daily Visitor (PV/UV) Trend Table */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} color="#0284c7" /> 최근 7일 일별 방문자 현황
          </h2>
          {visitorTrendsData.length > 0 ? (
            <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th style={{ textAlign: 'center' }}>방문자수 (UV)</th>
                    <th style={{ textAlign: 'right' }}>페이지뷰 (PV)</th>
                  </tr>
                </thead>
                <tbody>
                  {visitorTrendsData.map((item) => (
                    <tr key={item.date}>
                      <td style={{ fontWeight: 600 }}>{item.label}</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontWeight: 500 }}>{item.uv.toLocaleString()} 명</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.pv.toLocaleString()} 회</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>

        {/* Traffic Sources Numerical Table */}
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--color-accent)" /> 클릭 유형별 수치 및 비율
          </h2>
          {trafficSourcesData.length > 0 ? (
            <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(() => {
                const totalVal = trafficSourcesData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                return (
                  <table className="table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>클릭 유형</th>
                        <th style={{ textAlign: 'center' }}>클릭 수</th>
                        <th style={{ textAlign: 'right' }}>비율 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficSourcesData.map((item) => {
                        const pct = ((item.value / totalVal) * 100).toFixed(1);
                        return (
                          <tr key={item.name}>
                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-primary)' }}>
                              {item.value.toLocaleString()} 회
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{pct}%</span>
                              <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-alt)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)' }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Ranking Section */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', margin: 0 }}>
            🔥 인기 공방 (지도 및 리스트 클릭 랭킹)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
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
        </div>

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
              {paginatedWorkshops.map((w, index) => {
                const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                return (
                  <tr key={w.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: rank <= 3 ? 'var(--color-accent)' : 'inherit' }}>
                      {rank}
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
                );
              })}
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
