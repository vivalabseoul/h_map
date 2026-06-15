'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function FindAccountPage() {
  const { findEmail, resetPassword } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'id' | 'password'>('id');
  
  // Find ID state
  const [name, setName] = useState('');
  const [foundEmails, setFoundEmails] = useState<string[] | null>(null);
  
  // Forgot Password state
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    setError('');
    setFoundEmails(null);
    try {
      const emails = await findEmail(name);
      setFoundEmails(emails);
    } catch (err: any) {
      setError(err.message || 'Error finding account');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #faf8f5 0%, #f3efe9 100%)',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-10)',
        animation: 'scaleIn 0.3s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-brown)',
            marginBottom: 'var(--space-2)',
          }}>
            {t('auth.find_account') || '아이디/비밀번호 찾기'}
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => { setActiveTab('id'); setError(''); }}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'id' ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeTab === 'id' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'id' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t('auth.find_id') || '아이디 찾기'}
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); }}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: activeTab === 'password' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: activeTab === 'password' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t('auth.forgot_password') || '비밀번호 찾기'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-4)',
          }}>
            {error}
          </div>
        )}

        {/* Find ID Tab */}
        {activeTab === 'id' && (
          <div>
            <form onSubmit={handleFindId}>
              <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                <label className="form-label">{t('auth.display_name') || '이름'}</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px', width: '100%' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.enter_name') || '가입하신 이름을 입력해주세요'}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? '...' : (t('auth.find_id') || '아이디 찾기')}
              </button>
            </form>

            {foundEmails !== null && (
              <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{t('auth.found_emails') || '등록된 이메일:'}</p>
                {foundEmails.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {foundEmails.map((em, idx) => (
                      <li key={idx} style={{ color: 'var(--color-text-primary)' }}>{em}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{t('common.no_results') || '결과가 없습니다'}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Forgot Password Tab */}
        {activeTab === 'password' && (
          <div>
            {!emailSent ? (
              <form onSubmit={handleResetPassword}>
                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="form-label">{t('auth.email') || '이메일'}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }} />
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '36px', width: '100%' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.enter_email') || '가입하신 이메일을 입력해주세요'}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? '...' : (t('auth.send_reset_link') || '재설정 링크 보내기')}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', 
                  background: 'var(--color-success-light)', color: 'var(--color-success)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  margin: '0 auto var(--space-4)' 
                }}>
                  <Mail size={24} />
                </div>
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  {t('auth.email_sent') || '비밀번호 재설정 링크가 이메일로 전송되었습니다.'}
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  이메일함을 확인해주세요.
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
          <Link href="/login" style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
          }}>
            ← {t('nav.login') || '로그인으로 돌아가기'}
          </Link>
        </div>
      </div>
    </div>
  );
}
