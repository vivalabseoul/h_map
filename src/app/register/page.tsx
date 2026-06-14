'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'member' | 'instructor' | 'market_coordinator'>('member');
  const [businessCard, setBusinessCard] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (role !== 'member') {
      if (!businessCard) {
        setError('크리에이터 및 마켓 코디네이터는 명함을 첨부해야 합니다.');
        return;
      }
      if (businessCard.size > 200 * 1024) {
        setError('명함 파일 크기는 200KB 이하여야 합니다.');
        return;
      }
    }
    
    setLoading(true);
    try {
      await register(email, password, displayName, role, businessCard);
      // If requested a special role, alert them
      if (role !== 'member') {
        alert('회원가입이 완료되었습니다. 관리자 승인 후 등급이 변경됩니다.');
      }
      router.push('/');
    } catch (err: unknown) {
      const authErr = err as { message?: string };
      setError(authErr.message || '가입에 실패했습니다. 이메일과 비밀번호를 다시 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { paddingLeft: '36px', width: '100%' };
  const iconStyle = {
    position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🧶</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-brown)',
            marginBottom: 'var(--space-2)',
          }}>
            {t('auth.register_title')}
          </h1>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-relaxed)',
          }}>
            {t('auth.register_subtitle')}
          </p>
        </div>

        <form onSubmit={handleRegister}>
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

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">{t('auth.display_name')}</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={iconStyle} />
              <input type="text" className="form-input" style={inputStyle}
                value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name" required id="name-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">{t('auth.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={iconStyle} />
              <input type="email" className="form-input" style={inputStyle}
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required id="reg-email-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input type={showPassword ? 'text' : 'password'} className="form-input"
                style={{ ...inputStyle, paddingRight: '36px' }}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters" required id="reg-password-input"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label">{t('auth.confirm_password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input type="password" className="form-input" style={inputStyle}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" required id="confirm-password-input"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">회원 유형 (Role)</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value as any)} style={{ width: '100%', padding: '10px' }}>
              <option value="member">일반 회원 (Member)</option>
              <option value="instructor">크리에이터 (Creator)</option>
              <option value="market_coordinator">마켓 코디네이터 (Market Coordinator)</option>
            </select>
            {role !== 'member' && (
              <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-bg-secondary)', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>안내:</span> 크리에이터 및 마켓 코디네이터는 가입 시 1차적으로 <strong>일반 회원</strong>으로 등록되며, 관리자의 명함 확인 및 승인 후에 해당 등급으로 변경됩니다.
              </div>
            )}
          </div>

          {/* Business Card Upload */}
          {role !== 'member' && (
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">명함 첨부 (최대 200KB)</label>
              <input type="file" accept="image/*" className="form-input" style={{ width: '100%', padding: '8px' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setBusinessCard(e.target.files[0]);
                  }
                }} 
              />
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                * 회사명(또는 공방/축제명), 이름, 연락처가 명확히 표시된 명함 사진을 첨부해 주세요.<br/>
                * 가입 후 관리자가 내용을 확인하여 등급을 승인해 드립니다.
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
            disabled={loading} id="register-button">
            {loading ? '...' : t('auth.sign_up_email')}
          </button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)',
        }}>
          {t('auth.has_account')}{' '}
          <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
            {t('nav.login')}
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <Link href="/" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            ← {t('common.back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
