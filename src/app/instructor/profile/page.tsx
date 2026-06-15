'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function InstructorProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setBio((user as any).bio || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const { updateUserProfile } = await import('@/lib/database');
      await updateUserProfile(user.id, {
        displayName,
        photoURL,
        bio
      });
      alert('프로필이 성공적으로 저장되었습니다!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert('프로필 저장에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
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
            <label className="form-label">프로필 사진 (Profile Picture)</label>
            <ImageUpload 
              initialUrl={photoURL} 
              onUpload={setPhotoURL} 
              folder="profiles" 
            />
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? '저장 중...' : '저장하기 (Save Profile)'}
          </button>
        </form>
      </div>
    </div>
  );
}
