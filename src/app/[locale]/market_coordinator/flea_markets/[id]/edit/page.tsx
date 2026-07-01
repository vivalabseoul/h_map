'use client';
import { useLocalizedRouter } from '@/context/LanguageContext';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFleaMarketById, updateFleaMarket } from '@/lib/database';
import type { Locale, FleaMarket } from '@/types';
import AddressSearch from '@/components/AddressSearch';
import ImageUpload from '@/components/ImageUpload';

export default function EditFleaMarketPage() {
  const router = useLocalizedRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [activeTab, setActiveTab] = useState<Locale>('ko');
  const [name, setName] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  const [description, setDescription] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  const [address, setAddress] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lat, setLat] = useState('37.5665');
  const [lng, setLng] = useState('126.9780');
  const [admissionFee, setAdmissionFee] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [vendorApplicationLink, setVendorApplicationLink] = useState('');

  useEffect(() => {
    if (!params?.id) return;
    getFleaMarketById(params.id as string).then(data => {
      if (data) {
        setName(data.name || { en: '', ja: '', zh: '', ko: '' });
        setDescription(data.description || { en: '', ja: '', zh: '', ko: '' });
        setAddress(data.address || { en: '', ja: '', zh: '', ko: '' });
        
        if (data.date) {
          const parts = data.date.split('~').map(s => s.trim());
          if (parts.length === 2) {
            setStartDate(parts[0]);
            setEndDate(parts[1]);
          } else {
            setStartDate(data.date);
            setEndDate(data.date);
          }
        }

        setLat(data.lat.toString());
        setLng(data.lng.toString());
        setAdmissionFee(data.admissionFee || '');
        setPosterUrl(data.posterUrl || '');
        setPhone(data.phone || '');
        setWebsite(data.website || '');
        setInstagram(data.instagram || '');
        setYoutube(data.youtube || '');
        setVendorApplicationLink(data.vendorApplicationLink || '');
      }
      setFetching(false);
    });
  }, [params?.id]);

  const handleAddressSelect = (selectedAddress: string, selectedLat: number, selectedLng: number) => {
    setAddress(prev => ({ ...prev, [activeTab]: selectedAddress }));
    setLat(selectedLat.toString());
    setLng(selectedLng.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !params?.id) return;
    setLoading(true);

    try {
      await updateFleaMarket(params.id as string, {
        name,
        date: startDate === endDate ? startDate : `${startDate} ~ ${endDate}`,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        admissionFee,
        posterUrl,
        images: posterUrl ? [posterUrl] : [],
        description,
        phone,
        website,
        instagram,
        youtube,
        vendorApplicationLink
      });
      router.push('/market_coordinator/flea_markets');
    } catch (err) {
      console.error(err);
      alert('플리마켓 수정에 실패했습니다.');
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

  if (fetching) return <div>데이터 불러오는 중...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🎪 플리마켓 수정 (Edit Flea Market)</h1>
          <p>등록된 플리마켓 행사 정보를 수정합니다.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
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
            <label className="form-label">플리마켓명 (Name) - {activeTab.toUpperCase()}</label>
            <input
              type="text"
              className="form-input"
              value={name[activeTab]}
              onChange={(e) => handleLangChange('name', e.target.value)}
              placeholder="예: 2024 서울 핸드메이드 페어"
              required={activeTab === 'ko'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label">행사 소개 (Description) - {activeTab.toUpperCase()}</label>
            <textarea
              className="form-input form-textarea"
              value={description[activeTab]}
              onChange={(e) => handleLangChange('description', e.target.value)}
              placeholder="플리마켓의 특징, 참여 셀러 수, 주요 품목 등을 적어주세요."
              required={activeTab === 'ko'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <AddressSearch onSelect={handleAddressSelect} buttonText="주소 재검색" />
            <label className="form-label">주소 상세 (Address) - {activeTab.toUpperCase()}</label>
            <input
              type="text"
              className="form-input"
              value={address[activeTab]}
              onChange={(e) => handleLangChange('address', e.target.value)}
              placeholder="예: 서울 강남구 테헤란로 123"
              required={activeTab === 'ko'}
            />
          </div>

          <hr className="divider" />

          {/* Hidden lat/lng fields since they are auto-filled */}
          <div style={{ display: 'none' }}>
            <div className="form-group">
              <label className="form-label">위도 (Latitude)</label>
              <input type="text" className="form-input" value={lat} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">경도 (Longitude)</label>
              <input type="text" className="form-input" value={lng} readOnly />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">행사 일자/기간 (Date)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <span>~</span>
                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">입장권 (Admission Fee)</label>
              <input type="text" className="form-input" value={admissionFee} onChange={(e) => setAdmissionFee(e.target.value)} placeholder="예: 무료, 5,000원 등" required />
            </div>
          </div>

          <ImageUpload onUpload={setPosterUrl} initialUrl={posterUrl} folder="flea_markets" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">전화번호 (Phone)</label>
              <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-1234-5678" />
            </div>
            <div className="form-group">
              <label className="form-label">홈페이지 (Website)</label>
              <input type="url" className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="form-group">
              <label className="form-label">인스타그램 (Instagram)</label>
              <input type="text" className="form-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="form-group">
              <label className="form-label">유튜브 (YouTube)</label>
              <input type="text" className="form-input" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </div>

          <hr className="divider" style={{ margin: 'var(--space-6) 0' }} />

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label">벤더 참여 신청 링크 (Vendor Application Link)</label>
            <input type="url" className="form-input" value={vendorApplicationLink} onChange={(e) => setVendorApplicationLink(e.target.value)} placeholder="구글 폼, 네이버 폼 등 신청 링크 주소" />
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              셀러(벤더) 참여를 받으시려면 외부 신청 폼(구글 폼 등) 주소를 입력해주세요. 행사 상세페이지에 신청 버튼이 노출됩니다.
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '수정 중...' : '🎪 플리마켓 수정하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
