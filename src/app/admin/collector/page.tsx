'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Save, Globe } from 'lucide-react';
import { CATEGORIES } from '@/types';
import { createWorkshop } from '@/lib/database';

export default function PlacesCollectorPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [targetCategory, setTargetCategory] = useState('craft');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, languageCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.places || []);
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (place: any) => {
    if (!user) return alert('관리자 로그인이 필요합니다.');
    
    setSavingId(place.id);
    try {
      const nameStr = place.displayName?.text || 'Unknown';
      const addressStr = place.formattedAddress || '';
      
      const workshopData = {
        ownerId: user.id, // Assigning to the super admin
        ownerName: user.displayName || 'Admin',
        name: { ko: nameStr, en: nameStr, ja: nameStr },
        category: targetCategory as any,
        description: { ko: 'Imported from Google Maps', en: 'Imported from Google Maps', ja: 'Imported from Google Maps' },
        address: { ko: addressStr, en: addressStr, ja: addressStr },
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        images: [], // Need separate photo fetching logic if photos are required, or just save place_id for later
        rating: place.rating || 0,
        reviewCount: place.userRatingCount || 0,
        tags: [],
        phone: place.internationalPhoneNumber || '',
        website: place.websiteUri || '',
        snsLinks: {},
        region: 'Global',
        status: 'active' as const,
      };

      await createWorkshop(workshopData);
      
      // Remove from list or mark as saved
      setResults(prev => prev.filter(p => p.id !== place.id));
      alert('성공적으로 저장되었습니다!');
    } catch (err: any) {
      alert('저장 실패: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-brown)', marginBottom: '4px' }}>
            구글 맵스 데이터 수집기
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Google Places API를 활용하여 전 세계 공방 데이터를 검색하고 등록합니다.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)' }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 'var(--space-4)', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">검색 언어 (Language)</label>
            <select className="form-select" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)}>
              <option value="en">English (추천)</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">카테고리 할당 (Category)</label>
            <select className="form-select" value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.emoji} {t(`filters.${cat.key}`)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">검색어 (Query)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Ceramic workshop in Tokyo" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
            <Search size={18} />
            {loading ? '검색 중...' : '검색'}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>공방명 (Name)</th>
                <th>주소 (Address)</th>
                <th>평점 (Rating)</th>
                <th>연락처 (Phone)</th>
                <th>관리 (Action)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((place) => (
                <tr key={place.id}>
                  <td style={{ fontWeight: 600 }}>{place.displayName?.text}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {place.formattedAddress}
                  </td>
                  <td>⭐ {place.rating} ({place.userRatingCount})</td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>
                    {place.internationalPhoneNumber || '-'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-accent" 
                      onClick={() => handleSave(place)}
                      disabled={savingId === place.id}
                    >
                      <Save size={14} />
                      {savingId === place.id ? '저장 중...' : 'DB에 저장'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
