'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createCourse, getWorkshopsByOwner } from '@/lib/database';
import type { Workshop, Locale, CourseDescription } from '@/types';
import ImageUpload from '@/components/ImageUpload';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  // Form states
  const [activeTab, setActiveTab] = useState<Locale>('ko');
  const [title, setTitle] = useState<Record<Locale, string>>({ en: '', ja: '', zh: '', ko: '' });
  const [description, setDescription] = useState<Record<Locale, CourseDescription>>({ 
    en: { intro: '', curriculum: '', included: '', precautions: '' }, 
    ja: { intro: '', curriculum: '', included: '', precautions: '' }, 
    zh: { intro: '', curriculum: '', included: '', precautions: '' }, 
    ko: { intro: '', curriculum: '', included: '', precautions: '' } 
  });
  const [workshopId, setWorkshopId] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('1 Hour');
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);

  const toggleDay = (day: number) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const addTime = () => {
    if (newTime && !availableTimes.includes(newTime)) {
      setAvailableTimes(prev => [...prev, newTime].sort());
      setNewTime('');
    }
  };

  const removeTime = (time: string) => {
    setAvailableTimes(prev => prev.filter(t => t !== time));
  };

  useEffect(() => {
    if (user) {
      getWorkshopsByOwner(user.id).then((data) => {
        setWorkshops(data);
        if (data.length > 0) {
          setWorkshopId(data[0].id);
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !workshopId) return;
    setLoading(true);

    try {
      const selectedWorkshop = workshops.find(w => w.id === workshopId);
      
      await createCourse({
        workshopId,
        workshopName: selectedWorkshop?.name,
        instructorId: user.id,
        instructorName: user.displayName || 'Instructor',
        title,
        description,
        price,
        duration,
        maxParticipants,
        status: 'open',
        imageUrl: imageUrl,
        startDate: startDate,
        endDate: endDate,
        availableDays: availableDays,
        availableTimes: availableTimes,
        externalLink: externalLink,
        autoApprove: autoApprove,
      });
      router.push('/instructor/courses');
    } catch (err) {
      console.error(err);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (field: 'title' | 'intro' | 'curriculum' | 'included' | 'precautions', value: string) => {
    if (field === 'title') {
      setTitle(prev => ({ ...prev, [activeTab]: value }));
    } else {
      setDescription(prev => ({ 
        ...prev, 
        [activeTab]: { ...prev[activeTab], [field]: value } 
      }));
    }
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
          <h1>워크샵 개설 (Create Workshop)</h1>
          <p>스튜디오에서 진행할 새로운 워크샵을 다국어로 등록해주세요.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {workshops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <p style={{ color: 'var(--color-warning)' }}>
              워크샵을 개설하려면 먼저 스튜디오(Studio)를 등록해야 합니다.
            </p>
            <button onClick={() => router.push('/instructor/workshops/new')} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
              스튜디오 등록하러 가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">진행할 스튜디오 (Select Studio)</label>
              <select className="form-select" value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
                {workshops.map(w => (
                  <option key={w.id} value={w.id}>{w.name.ko} ({w.name.en})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">외부 예약 링크 (External Booking Link) - 권장</label>
              <input 
                type="url" 
                className="form-input" 
                value={externalLink} 
                onChange={(e) => setExternalLink(e.target.value)} 
                placeholder="예: https://booking.naver.com/... (선택사항)" 
              />
              <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                이 링크를 입력하면, 자체 예약 시스템 대신 유저가 해당 링크로 바로 이동합니다. (네이버 예약, 인스타그램 등)
              </p>
            </div>

            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="lang-tab-btn"
                  style={{
                    borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                    color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === tab.key ? 600 : 400
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">워크샵명 (Workshop Title) - {activeTab.toUpperCase()}</label>
              <input
                type="text"
                className="form-input"
                value={title[activeTab]}
                onChange={(e) => handleLangChange('title', e.target.value)}
                placeholder="예: 원데이 도자기 머그컵 워크샵"
                required={activeTab === 'ko'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label className="form-label">클래스 소개 (Intro) - {activeTab.toUpperCase()}</label>
                <span style={{ fontSize: '0.8rem', color: (description[activeTab].intro?.length || 0) >= 200 ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
                  {(description[activeTab].intro?.length || 0)} / 200
                </span>
              </div>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: '80px' }}
                value={description[activeTab].intro}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleLangChange('intro', e.target.value);
                  }
                }}
                maxLength={200}
                placeholder="클래스에 대한 전반적인 소개를 적어주세요."
                required={activeTab === 'ko'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label className="form-label">커리큘럼 소개 (Curriculum) - {activeTab.toUpperCase()}</label>
                <span style={{ fontSize: '0.8rem', color: (description[activeTab].curriculum?.length || 0) >= 300 ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
                  {(description[activeTab].curriculum?.length || 0)} / 300
                </span>
              </div>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: '80px' }}
                value={description[activeTab].curriculum}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    handleLangChange('curriculum', e.target.value);
                  }
                }}
                maxLength={300}
                placeholder="시간대별 혹은 단계별 진행 과정을 적어주세요."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label className="form-label">포함 내역 (Included Items) - {activeTab.toUpperCase()}</label>
                <span style={{ fontSize: '0.8rem', color: (description[activeTab].included?.length || 0) >= 200 ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
                  {(description[activeTab].included?.length || 0)} / 200
                </span>
              </div>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: '60px' }}
                value={description[activeTab].included}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleLangChange('included', e.target.value);
                  }
                }}
                maxLength={200}
                placeholder="재료비, 포장비, 다과 등 수강료에 포함된 내역을 적어주세요."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label className="form-label">주의사항 (Precautions) - {activeTab.toUpperCase()}</label>
                <span style={{ fontSize: '0.8rem', color: (description[activeTab].precautions?.length || 0) >= 200 ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
                  {(description[activeTab].precautions?.length || 0)} / 200
                </span>
              </div>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: '60px' }}
                value={description[activeTab].precautions}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleLangChange('precautions', e.target.value);
                  }
                }}
                maxLength={200}
                placeholder="복장 제한, 주차 가능 여부, 지각 시 유의사항 등을 적어주세요."
              />
            </div>

            <hr className="divider" />

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>클래스 대표 사진 (Class Photo)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>📸 대표 사진 1장만 업로드 가능합니다.</p>
              <ImageUpload 
                initialUrl={imageUrl} 
                onUpload={setImageUrl} 
                folder="courses" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">가격 (Price)</label>
                <input type="text" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="예: 50,000원 / $50" required />
              </div>
              <div className="form-group">
                <label className="form-label">소요 시간 (Duration)</label>
                <input type="text" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="예: 2시간 (2 Hours)" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              <div className="form-group">
                <label className="form-label">최대 인원 (Max Participants)</label>
                <input type="number" min="1" max="50" className="form-input" value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">시작 기간 (Start Date) - 선택사항</label>
                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">종료 기간 (End Date) - 선택사항</label>
                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">예약 가능 요일 (Available Days)</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {['일', '월', '화', '수', '목', '금', '토'].map((dayName, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 'var(--space-2)', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                    <input 
                      type="checkbox" 
                      checked={availableDays.includes(idx)} 
                      onChange={() => toggleDay(idx)} 
                    />
                    {dayName}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
              <label className="form-label">예약 가능 시간대 (Available Times)</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <input 
                  type="time" 
                  className="form-input" 
                  style={{ width: 'auto' }}
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)} 
                />
                <button type="button" className="btn btn-secondary" onClick={addTime}>추가</button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {availableTimes.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>추가된 시간대가 없습니다.</span>}
                {availableTimes.map((time) => (
                  <div key={time} style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{time}</span>
                    <button type="button" onClick={() => removeTime(time)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '생성 중...' : '워크샵 개설 (Create Workshop)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
