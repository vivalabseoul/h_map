'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWorkshops, createWorkshop } from '@/lib/database';
import type { WorkshopCategory, Region, Locale, Workshop } from '@/types';
import { CATEGORIES, REGIONS } from '@/types';
import { getDynamicCategories } from '@/lib/categoryUtils';
import type { AddressComponents } from '@/components/AddressSearch';
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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [region, setRegion] = useState<Region>('korea');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [snsInstagram, setSnsInstagram] = useState('');
  const [snsYoutube, setSnsYoutube] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [addressTags, setAddressTags] = useState<string[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState(CATEGORIES);

  React.useEffect(() => {
    getWorkshops().then(workshops => {
      setDynamicCategories(getDynamicCategories(workshops));
    }).catch(console.error);
  }, []);

  const handleAddressSelect = (selectedAddress: string, selectedLat: number, selectedLng: number, components?: AddressComponents) => {
    setAddress(prev => ({ ...prev, [activeTab]: selectedAddress }));
    setLat(selectedLat);
    setLng(selectedLng);
    if (components) {
      const newTags: string[] = [];
      if (components.city) newTags.push(`city:${components.city}`);
      if (components.district) newTags.push(`district:${components.district}`);
      if (components.suburb) newTags.push(`suburb:${components.suburb}`);
      setAddressTags(newTags);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const finalCategory = isCustomCategory && customCategory.trim() !== '' ? customCategory.trim() : category;
      
      await createWorkshop({
        ownerId: user.id,
        ownerName: user.displayName || 'Instructor',
        name,
        category: finalCategory,
        description,
        address,
        lat: lat ?? (REGIONS.find(r => r.key === region)?.center[0] || 37.576),
        lng: lng ?? (REGIONS.find(r => r.key === region)?.center[1] || 126.988),
        images: imageUrl ? [imageUrl] : [],
        tags: ['Beginner_Friendly', ...addressTags], // Mock default tags
        languages,
        phone,
        email,
        website,
        snsLinks: {
          instagram: snsInstagram,
          youtube: snsYoutube,
        },
        region,
        status: 'active',
      });
      router.push('/instructor/workshops');
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
            <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>대표 사진 (1장만 등록 가능)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>📸 대표 사진 1장만 업로드 가능합니다.</p>
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
              <select 
                className="form-select" 
                value={isCustomCategory ? 'custom' : category} 
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(e.target.value as WorkshopCategory);
                  }
                }}
              >
                {dynamicCategories.map(c => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.key.toUpperCase()}</option>
                ))}
                <option value="custom">✍️ 직접 입력 (Custom)</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 'var(--space-2)' }}
                  placeholder="예: 목공예, 캔들"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required={isCustomCategory}
                />
              )}
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
              <label className="form-label">이메일 (Email)</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@example.com" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">홈페이지 (Website)</label>
            <input type="url" className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">인스타그램 (Instagram)</label>
              <input type="text" className="form-input" value={snsInstagram} onChange={(e) => setSnsInstagram(e.target.value)} placeholder="예: vivalab_official (아이디만 입력)" />
            </div>
            <div className="form-group">
              <label className="form-label">유튜브 (YouTube)</label>
              <input type="text" className="form-input" value={snsYoutube} onChange={(e) => setSnsYoutube(e.target.value)} placeholder="예: vivalab_official (핸들만 입력)" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
            <label className="form-label">가능한 언어 (Available Languages)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              {['English', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'French'].map(lang => (
                <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLanguages(prev => [...prev, lang]);
                      } else {
                        setLanguages(prev => prev.filter(l => l !== lang));
                      }
                    }}
                  />
                  {lang}
                </label>
              ))}
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
