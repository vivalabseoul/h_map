'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createInquiry } from '@/lib/database';
import type { InquiryCategory } from '@/types';

export default function ContactPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InquiryCategory>('booking');
  const [content, setContent] = useState('');

  const categoryLabels: Record<InquiryCategory, string> = {
    booking: '강의예약 (Workshop Booking)',
    creation: '강의개설 (Workshop Creation)',
    registration: '회원가입 (Registration)',
    studio: '공방관련 (Studio)',
    other: '기타 (Other)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save to Mock DB so Admin can reply
      await createInquiry({
        userId: user?.id || 'guest',
        userName: user?.displayName || user?.email?.split('@')[0] || '비회원',
        userEmail: user?.email || 'guest@example.com',
        title,
        category,
        content,
      });

      // 2. Open Mailto for the direct email requirement
      const subject = encodeURIComponent(`[${categoryLabels[category]}] ${title}`);
      const body = encodeURIComponent(content);
      window.location.href = `mailto:lunantshop@gmail.com?subject=${subject}&body=${body}`;

      alert('문의가 성공적으로 접수되었습니다. (메일 앱이 열립니다)');
      setTitle('');
      setContent('');
      setCategory('booking');
    } catch (err) {
      console.error(err);
      alert('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="page-container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>문의하기 (Contact Us)</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            궁금한 점이 있으신가요? 아래 양식을 작성해 주시면 담당자가 확인 후 답변해 드립니다.
            답변은 제출해주신 이메일 또는 내 문의내역에서 확인 가능합니다.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">항목 (Category)</label>
              <select 
                className="form-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value as InquiryCategory)}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">제목 (Title)</label>
              <input
                type="text"
                className="form-input"
                placeholder="문의 제목을 입력해주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">내용 (Content)</label>
              <textarea
                className="form-input form-textarea"
                placeholder="상세한 문의 내용을 입력해주세요"
                style={{ minHeight: '150px' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? '제출 중...' : '문의 등록 (Submit & Send Email)'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
