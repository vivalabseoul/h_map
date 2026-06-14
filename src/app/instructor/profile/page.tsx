'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Image as ImageIcon } from 'lucide-react';

export default function InstructorProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setBio((user as any).bio || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the Firestore user document
    alert('프로필이 성공적으로 저장되었습니다. (UI 데모)');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>프로필 (Profile)</h1>
          <p>크리에이터님의 프로필 사진과 소개를 작성해주세요.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label">프로필 사진 (Profile Picture URL)</label>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-bg-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
              }}>
                {photoURL ? (
                  <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={32} color="var(--color-text-muted)" />
                )}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <ImageIcon size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-muted)' }} />
                <input
                  type="url"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '36px' }}
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                  현재는 이미지 URL을 직접 입력하는 방식으로 지원됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">이름 (Name)</label>
            <input
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="크리에이터명 또는 닉네임"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label">간단한 소개 (Bio)</label>
            <textarea
              className="form-input form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="안녕하세요, 저는 OOO 크리에이터입니다. 주로 어떤 작업을 하는지 짧게 소개해 주세요."
              maxLength={200}
            />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 'var(--space-1)' }}>
              {bio.length} / 200
            </p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            저장하기 (Save Profile)
          </button>
        </form>
      </div>
    </div>
  );
}
