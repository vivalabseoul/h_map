'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Printer, Calendar as CalendarIcon, MousePointerClick, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#F5A623', '#4A90E2', '#7ED321', '#FF4B4B', '#9013FE'];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [analyticsStats, setAnalyticsStats] = useState({ totalVisits: 0, avgCTR: 0 });
  const [visitTrendsData, setVisitTrendsData] = useState<{ name: string; visits: number; clicks: number }[]>([]);
  const [trafficSourcesData, setTrafficSourcesData] = useState<{ name: string; value: number }[]>([]);

  // Initialize dates to last 7 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleSearch = () => {
    if (!startDate || !endDate) return;
    setIsSearching(true);
    
    // Simulate API fetch delay (to be replaced with actual GA API call)
    setTimeout(() => {
      fetchReportData(startDate, endDate);
      setIsSearching(false);
      setHasSearched(true);
    }, 600);
  };

  const fetchReportData = (startStr: string, endStr: string) => {
    // TODO: Fetch real GA4 data here based on the date range
    
    setVisitTrendsData([]);
    setAnalyticsStats({
      totalVisits: 0,
      avgCTR: 0
    });
    setTrafficSourcesData([]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .reports-container { padding: 0 !important; }
          /* Hide sidebar and header specifically */
          nav, header, .sidebar { display: none !important; }
          /* Adjust layout for print */
          body { background: white !important; }
          .dashboard-content { margin: 0 !important; padding: 0 !important; }
          .stat-card { border: 1px solid #eee; box-shadow: none !important; page-break-inside: avoid; }
        }
      `}</style>
      
      <div className="page-header">
        <div>
          <h1>기간별 통계 보고서</h1>
          <p>선택한 기간 동안의 방문자 및 유입 경로 데이터를 조회하고 출력할 수 있습니다.</p>
        </div>
        <button className="btn btn-outline no-print" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={16} /> PDF 저장 / 인쇄
        </button>
      </div>

      <div className="search-bar no-print" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', background: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>시작일</label>
          <input 
            type="date" 
            className="input" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '200px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>종료일</label>
          <input 
            type="date" 
            className="input" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '200px' }}
          />
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSearch}
          disabled={isSearching}
          style={{ height: '42px', padding: '0 24px' }}
        >
          {isSearching ? '조회 중...' : '조회하기'}
        </button>
      </div>

      {hasSearched ? (
        <div className="report-content">
          <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F5A62315', color: '#F5A623' }}>
                <Activity size={24} />
              </div>
              <div>
                <div className="stat-value">{analyticsStats.totalVisits.toLocaleString()}</div>
                <div className="stat-label">조회 기간 내 총 방문수</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#9013FE15', color: '#9013FE' }}>
                <MousePointerClick size={24} />
              </div>
              <div>
                <div className="stat-value">{analyticsStats.avgCTR}%</div>
                <div className="stat-label">평균 클릭률 (CTR)</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#4A90E215', color: '#4A90E2' }}>
                <CalendarIcon size={24} />
              </div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{startDate} ~ {endDate}</div>
                <div className="stat-label">조회 기간</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Visit & Clicks Trend */}
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--color-primary)" /> 기간 내 방문 및 클릭 추이
              </h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={visitTrendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" name="방문수" dataKey="visits" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="공방 클릭수" dataKey="clicks" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic Sources */}
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--color-accent)" /> 방문 유입 방법
              </h2>
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
                      {trafficSourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} itemStyle={{ color: 'var(--color-text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--color-text-secondary)' }}>
          <Activity size={48} style={{ opacity: 0.2, margin: '0 auto var(--space-4)' }} />
          <p>조회할 기간을 설정하고 [조회하기] 버튼을 눌러주세요.</p>
        </div>
      )}
    </div>
  );
}
