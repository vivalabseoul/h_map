'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import { updateUserProfile } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export default function ProfileForm() {
  const { user, updatePassword, updateEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setEmail(user.email || '');
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customUser = user as any;
      setBio(customUser.bio || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setSaving(true);
    try {
      if (email !== user.email) {
        await updateEmail(email);
      }

      await updateUserProfile(user.id, {
        email,
        displayName,
        photoURL,
        bio
      });

      // 서버(auth.users)의 메타데이터도 동기화
      if (supabase) {
        await supabase.auth.updateUser({
          data: {
            full_name: displayName,
            name: displayName,
            avatar_url: photoURL
          }
        });
      }
      
      if (newPassword) {
        await updatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      alert('회원정보가 성공적으로 저장되었습니다!');
      window.location.reload(); // Refresh to update AuthContext state across the app
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert('회원정보 저장에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
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
          <label className="form-label">이메일 계정 (Email)</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            이메일을 변경하면 인증 이메일이 발송될 수 있습니다.
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">이름 또는 닉네임 (Name / Nickname)</label>
          <input
            type="text"
            className="form-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="본명 대신 사용할 닉네임을 입력하셔도 됩니다."
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label className="form-label">간단한 소개 (Bio)</label>
          <textarea
            className="form-input form-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="간단한 자기소개를 작성해 주세요."
            maxLength={200}
          />
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 'var(--space-1)' }}>
            {bio.length} / 200
          </p>
        </div>

        <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
        
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>비밀번호 변경 (선택사항)</h3>

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">새 비밀번호 (New Password)</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="변경할 비밀번호를 입력하세요 (선택)"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label className="form-label">새 비밀번호 확인 (Confirm New Password)</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 한번 입력하세요"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
          {saving ? '저장 중...' : '회원정보 저장하기 (Save Profile)'}
        </button>
      </form>
    </div>
  );
}
