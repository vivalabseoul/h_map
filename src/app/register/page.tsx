'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Palette, Store } from 'lucide-react';
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
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [businessCard, setBusinessCard] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file); // If not an image, just return it
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // 명함 글씨(이름, 전화번호 등)를 선명하게 읽을 수 있도록 최소 600px 유지
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          let quality = 0.9;
          const compress = () => {
            canvas.toBlob((blob) => {
              if (blob) {
                if (blob.size > 100 * 1024 && quality > 0.1) {
                  quality -= 0.15;
                  compress();
                } else {
                  const newFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(newFile);
                }
              } else {
                resolve(file); // fallback
              }
            }, 'image/jpeg', quality);
          };
          compress();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

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
    }
    let finalDisplayName = displayName;
    if (role === 'market_coordinator') {
      if (!companyName.trim() || !jobTitle.trim()) {
        setError('마켓 코디네이터는 소속 회사명과 직급을 입력해야 합니다.');
        return;
      }
      finalDisplayName = `${displayName} (${companyName} ${jobTitle})`;
    }
    
    setLoading(true);
    try {
      await register(email, password, finalDisplayName, role, businessCard, companyName, jobTitle);
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

          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label" style={{ marginBottom: 'var(--space-3)' }}>{t('auth.select_role')}</label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexDirection: 'column' }}>
              {/* Member Card */}
              <div 
                onClick={() => setRole('member')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
                  border: role === 'member' ? '2px solid #111111' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: role === 'member' ? 'var(--color-bg)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ padding: '8px', background: role === 'member' ? '#111111' : 'var(--color-bg-alt)', color: role === 'member' ? '#ffffff' : 'var(--color-text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{t('auth.role_member')}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{t('auth.role_member_desc')}</div>
                </div>
              </div>

              {/* Creator Card */}
              <div 
                onClick={() => setRole('instructor')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
                  border: role === 'instructor' ? '2px solid #111111' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: role === 'instructor' ? 'var(--color-bg)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ padding: '8px', background: role === 'instructor' ? '#111111' : 'var(--color-bg-alt)', color: role === 'instructor' ? '#ffffff' : 'var(--color-text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Palette size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{t('auth.role_creator')}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{t('auth.role_creator_desc')}</div>
                </div>
              </div>

              {/* Coordinator Card (Hidden as requested) */}
              {false && (
                <div 
                  onClick={() => setRole('market_coordinator')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
                    border: role === 'market_coordinator' ? '2px solid #111111' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: role === 'market_coordinator' ? 'var(--color-bg)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ padding: '8px', background: role === 'market_coordinator' ? '#111111' : 'var(--color-bg-alt)', color: role === 'market_coordinator' ? '#ffffff' : 'var(--color-text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>마켓 코디네이터 (Coordinator)</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>플리마켓을 기획하고 모집 공고를 관리합니다.</div>
                  </div>
                </div>
              )}
            </div>

            {role !== 'member' && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{t('auth.creator_notice_highlight')}</span> {t('auth.creator_notice_text')}
              </div>
            )}
          </div>

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

          {/* Market Coordinator Additional Info */}
          {role === 'market_coordinator' && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">소속 회사명 (또는 단체명)</label>
                <input type="text" className="form-input" style={{ width: '100%', padding: '10px' }}
                  value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: (주)비바랩" required={role === 'market_coordinator'}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">직급 (또는 역할)</label>
                <input type="text" className="form-input" style={{ width: '100%', padding: '10px' }}
                  value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="예: 기획팀장" required={role === 'market_coordinator'}
                />
              </div>
            </div>
          )}

          {/* Business Card Upload */}
          {role !== 'member' && (
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">{t('auth.business_card_label')}</label>
              <input type="file" accept="image/*" className="form-input" style={{ width: '100%', padding: '8px' }} 
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const resized = await resizeImage(file);
                    setBusinessCard(resized);
                  }
                }} 
              />
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                {t('auth.business_card_desc1')}<br/>
                {t('auth.business_card_desc2')}
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
