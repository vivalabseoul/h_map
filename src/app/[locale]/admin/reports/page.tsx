'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Printer, Calendar as CalendarIcon, MousePointerClick, TrendingUp } from 'lucide-react';
import { getClickTrends, getClicksByType, getTotalClicks } from '@/lib/database';
import type { ClickTrendItem, ClicksByTypeItem } from '@/lib/database';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#F5A623', '#4A90E2', '#7ED321', '#FF4B4B', '#9013FE', '#50E3C2', '#BD10E0'];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [totalClickCount, setTotalClickCount] = useState(0);
  const [visitTrendsData, setVisitTrendsData] = useState<ClickTrendItem[]>([]);
  const [trafficSourcesData, setTrafficSourcesData] = useState<ClicksByTypeItem[]>([]);

  // Initialize dates to last 7 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async () => {
    if (!startDate || !endDate) return;
    setIsSearching(true);
    
    try {
      const [trends, byType, total] = await Promise.all([
        getClickTrends(startDate, endDate),
        getClicksByType(startDate, endDate),
        getTotalClicks(startDate, endDate),
      ]);
      setVisitTrendsData(trends);
      setTrafficSourcesData(byType);
      setTotalClickCount(total);
      setHasSearched(true);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const externalClicks = trafficSourcesData
    .filter(d => d.name !== '지도 핀 클릭' && d.name !== '리스트 클릭')
    .reduce((s, d) => s + d.value, 0);
  const avgCTR = totalClickCount > 0
    ? ((externalClicks / totalClickCount) * 100).toFixed(1)
    : '0';

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
          <h1>기간별 클릭 통계 보고서</h1>
          <p>선택한 기간 동안의 공방 클릭 데이터를 조회하고 출력할 수 있습니다.</p>
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
                <div className="stat-value">{totalClickCount.toLocaleString()}</div>
                <div className="stat-label">조회 기간 내 총 클릭수</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#9013FE15', color: '#9013FE' }}>
                <MousePointerClick size={24} />
              </div>
              <div>
                <div className="stat-value">{avgCTR}%</div>
                <div className="stat-label">외부 링크 클릭률</div>
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
            {/* Click Trend Chart */}
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--color-primary)" /> 기간 내 클릭 추이
              </h2>
              {visitTrendsData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={visitTrendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" name="지도 핀 클릭" dataKey="mapPinClicks" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" name="리스트 클릭" dataKey="listClicks" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" name="외부 링크" dataKey="externalClicks" stroke="#9013FE" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                  해당 기간에 클릭 데이터가 없습니다.
                </div>
              )}
            </div>

            {/* Traffic Sources Pie Chart */}
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', pageBreakInside: 'avoid' }}>
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
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} itemStyle={{ color: 'var(--color-text-primary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                  해당 기간에 클릭 데이터가 없습니다.
                </div>
              )}
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
