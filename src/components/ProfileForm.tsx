'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import { updateUserProfile, submitWithdrawalRequest } from '@/lib/database';
import { supabase } from '@/lib/supabase';

// 탈퇴 사유 선택지
const WITHDRAWAL_REASONS = [
  '서비스를 더 이상 이용하지 않아서',
  '개인정보 보호가 걱정되어서',
  '원하는 기능이나 서비스가 없어서',
  '다른 계정으로 재가입 예정',
  '서비스 이용이 불편해서',
  '기타',
];

export default function ProfileForm() {
  const { user, updatePassword, updateEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // 탈퇴 신청 모달 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalDetail, setWithdrawalDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
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
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert('회원정보 저장에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWithdrawalSubmit = async () => {
    if (!user) return;
    if (!withdrawalReason) {
      alert('탈퇴 사유를 선택해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await submitWithdrawalRequest(user.id, user.email, withdrawalReason, withdrawalDetail || undefined);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Withdrawal request failed:', error);
      alert('탈퇴 신청에 실패했습니다: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowWithdrawalModal(false);
    setWithdrawalReason('');
    setWithdrawalDetail('');
    setSubmitted(false);
  };

  return (
    <>
      {/* ── 프로필 수정 폼 ── */}
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

      {/* ── 회원탈퇴 신청 ── */}
      <div
        className="card"
        style={{
          maxWidth: '600px',
          marginTop: 'var(--space-6)',
        }}
      >
        <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-lg)' }}>
          탈퇴 신청하기
        </h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: '1.7' }}>
          탈퇴를 신청하면 관리자 검토 후 계정이 삭제됩니다.<br />
          탈퇴 처리가 완료되면 모든 데이터가 영구 삭제됩니다.
        </p>
        <button
          type="button"
          onClick={() => setShowWithdrawalModal(true)}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { 
            (e.currentTarget).style.background = 'rgba(220,38,38,0.05)'; 
            (e.currentTarget).style.color = '#dc2626';
            (e.currentTarget).style.borderColor = '#dc2626';
          }}
          onMouseLeave={(e) => { 
            (e.currentTarget).style.background = 'transparent'; 
            (e.currentTarget).style.color = 'var(--color-text-muted)';
            (e.currentTarget).style.borderColor = 'var(--color-border)';
          }}
        >
          탈퇴 신청 진행
        </button>
      </div>

      {/* ── 탈퇴 신청 모달 ── */}
      {showWithdrawalModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div
            style={{
              background: 'var(--color-surface, #fff)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 30px 70px rgba(0,0,0,0.25)',
            }}
          >
            {submitted ? (
              /* ── 신청 완료 화면 ── */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: 'var(--space-4)' }}>✅</div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-3)' }}>
                  탈퇴 신청이 접수되었습니다
                </h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: 'var(--space-6)' }}>
                  소중한 의견을 보내주셔서 감사합니다.<br />
                  관리자 검토 후 순차적으로 처리됩니다.<br />
                  탈퇴 처리 완료 시 안내 이메일이 발송됩니다.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  확인
                </button>
              </div>
            ) : (
              /* ── 탈퇴 사유 입력 화면 ── */
              <>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{ fontSize: '44px', marginBottom: 'var(--space-3)' }}>🙁</div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                    회원탈퇴 신청
                  </h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                    불편하셨다면 정말 죄송합니다.<br />
                    탈퇴 사유를 알려주시면 서비스 개선에 반영하겠습니다.
                  </p>
                </div>

                {/* 사유 선택 */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
                    탈퇴 사유를 선택해 주세요 <span style={{ color: '#dc2626' }}>*</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {WITHDRAWAL_REASONS.map((reason) => (
                      <label
                        key={reason}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${withdrawalReason === reason ? '#dc2626' : 'var(--color-border)'}`,
                          background: withdrawalReason === reason ? 'rgba(220,38,38,0.05)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text)',
                        }}
                      >
                        <input
                          type="radio"
                          name="withdrawal-reason"
                          value={reason}
                          checked={withdrawalReason === reason}
                          onChange={() => setWithdrawalReason(reason)}
                          style={{ accentColor: '#dc2626', width: '16px', height: '16px', flexShrink: 0 }}
                        />
                        {reason}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 추가 의견 */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
                    추가 의견 (선택사항)
                  </label>
                  <textarea
                    className="form-input form-textarea"
                    value={withdrawalDetail}
                    onChange={(e) => setWithdrawalDetail(e.target.value)}
                    placeholder="서비스 개선을 위한 자유로운 의견을 남겨주세요."
                    maxLength={500}
                    rows={3}
                  />
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: 'var(--space-1)' }}>
                    {withdrawalDetail.length} / 500
                  </p>
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: 'var(--color-surface-2, #f3f4f6)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    계속 이용할게요
                  </button>
                  <button
                    type="button"
                    onClick={handleWithdrawalSubmit}
                    disabled={submitting || !withdrawalReason}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      background: withdrawalReason ? '#dc2626' : 'rgba(220,38,38,0.3)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: withdrawalReason ? 'pointer' : 'not-allowed',
                      fontWeight: '600',
                      fontSize: 'var(--font-size-sm)',
                      transition: 'opacity 0.2s',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? '신청 중...' : '탈퇴 신청하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
