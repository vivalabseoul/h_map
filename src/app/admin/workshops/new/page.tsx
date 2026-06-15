'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createWorkshop } from '@/lib/database';
import type { WorkshopCategory, Region, Locale } from '@/types';
import { CATEGORIES, REGIONS } from '@/types';
import AddressSearch from '@/components/AddressSearch';
import ImageUpload from '@/components/ImageUpload';

export default function CreateStudioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [activeTab, setActiveTab] = useState<Locale>('ko');
  const [name, setName] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  const [description, setDescription] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  const [address, setAddress] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  const [category, setCategory] = useState<WorkshopCategory>('pottery');
  const [region, setRegion] = useState<Region>('korea');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [snsInstagram, setSnsInstagram] = useState('');
  const [snsYoutube, setSnsYoutube] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAddressSelect = (selectedAddress: string, selectedLat: number, selectedLng: number) => {
    // Fill the current active tab with the Korean address or display_name
    setAddress(prev => ({ ...prev, [activeTab]: selectedAddress }));
    setLat(selectedLat);
    setLng(selectedLng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await createWorkshop({
        ownerId: user.id,
        ownerName: user.displayName || 'Instructor',
        name,
        category,
        description,
        address,
        lat: lat ?? (REGIONS.find(r => r.key === region)?.center[0] || 37.576),
        lng: lng ?? (REGIONS.find(r => r.key === region)?.center[1] || 126.988),
        images: imageUrl ? [imageUrl] : [],
        tags: ['Beginner_Friendly'], // Mock default tags
        phone,
        website,
        snsLinks: {
          instagram: snsInstagram,
          youtube: snsYoutube,
        },
        region,
        status: 'active',
      });
      router.push('/admin/workshops');
    } catch (err) {
      console.error(err);
      alert('Failed to create studio');
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (field: 'name' | 'description' | 'address', value: string) => {
    if (field === 'name') setName(prev => ({ ...prev, [activeTab]: value }));
    if (field === 'description') setDescription(prev => ({ ...prev, [activeTab]: value }));
    if (field === 'address') setAddress(prev => ({ ...prev, [activeTab]: value }));
  };

  const tabs: { key: Locale; label: string }[] = [
    { key: 'ko', label: '한국어 (KO)' },
    { key: 'en', label: 'English (EN)' },
    { key: 'ja', label: '日本語 (JA)' },
    { key: 'zh', label: '中文 (ZH)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>스튜디오 등록 (Create Studio)</h1>
          <p>새로운 스튜디오(브랜드) 정보를 다국어로 등록해주세요.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          {/* Language Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">스튜디오 이름 (Studio Name) - {activeTab.toUpperCase()}</label>
            <input
              type="text"
              className="form-input"
              value={name[activeTab]}
              onChange={(e) => handleLangChange('name', e.target.value)}
              placeholder="예: 비바랩 도자기 공방"
              required={activeTab === 'ko'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">스튜디오 소개 (Brand Intro) - {activeTab.toUpperCase()}</label>
            <textarea
              className="form-input form-textarea"
              value={description[activeTab]}
              onChange={(e) => handleLangChange('description', e.target.value)}
              placeholder="스튜디오의 철학, 특징, 전반적인 브랜드를 소개해 주세요."
              required={activeTab === 'ko'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <AddressSearch onSelect={handleAddressSelect} />
            <label className="form-label">주소 상세 (Address) - {activeTab.toUpperCase()}</label>
            <input
              type="text"
              className="form-input"
              value={address[activeTab]}
              onChange={(e) => handleLangChange('address', e.target.value)}
              placeholder="예: 서울시 종로구 북촌로 123"
              required={activeTab === 'ko'}
            />
            {lat && lng && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: 'var(--space-1)' }}>
                📍 위도: {lat.toFixed(4)}, 경도: {lng.toFixed(4)}
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* Image Upload */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <ImageUpload 
              initialUrl={imageUrl} 
              onUpload={setImageUrl} 
              folder="workshops" 
            />
          </div>

          {/* Global Config */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">종목 (Category)</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value as WorkshopCategory)}>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.key.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">지역 (Region)</label>
              <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value as Region)}>
                {REGIONS.map(r => (
                  <option key={r.key} value={r.key}>{r.emoji} {r.label.en}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">전화번호 (Phone)</label>
              <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
            </div>
            <div className="form-group">
              <label className="form-label">홈페이지 (Website)</label>
              <input type="url" className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="form-group">
              <label className="form-label">인스타그램 (Instagram)</label>
              <input type="url" className="form-input" value={snsInstagram} onChange={(e) => setSnsInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="form-group">
              <label className="form-label">유튜브 (YouTube)</label>
              <input type="url" className="form-input" value={snsYoutube} onChange={(e) => setSnsYoutube(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '생성 중...' : '스튜디오 등록 (Create Studio)'}
          </button>
        </form>
      </div>
    </div>
  );
}
