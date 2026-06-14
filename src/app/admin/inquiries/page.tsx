'use client';
import React, { useEffect, useState } from 'react';
import { getInquiries, updateInquiryReply } from '@/lib/firestore';
import type { Inquiry } from '@/types';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    getInquiries().then(setInquiries);
  }, []);

  const handleReplySubmit = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await updateInquiryReply(id, replyText);
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'resolved', reply: replyText } : inq));
      setSelectedId(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      alert('답변 등록에 실패했습니다.');
    }
  };

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      booking: '강의예약',
      creation: '강의개설',
      registration: '회원가입',
      other: '기타'
    };
    return map[cat] || cat;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>문의 관리 (Inquiries)</h1>
          <p>사용자 문의 내역을 확인하고 답변할 수 있습니다.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자 (이메일)</th>
              <th>작성일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <React.Fragment key={inq.id}>
                <tr>
                  <td><span className="badge badge-info">{categoryLabel(inq.category)}</span></td>
                  <td style={{ fontWeight: 500 }}>{inq.title}</td>
                  <td>{inq.userName} ({inq.userEmail})</td>
                  <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${inq.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                      {inq.status === 'resolved' ? '답변완료' : '대기중'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setSelectedId(selectedId === inq.id ? null : inq.id);
                        setReplyText(inq.reply || '');
                      }}
                    >
                      {selectedId === inq.id ? '닫기' : '내용 보기'}
                    </button>
                  </td>
                </tr>
                {selectedId === inq.id && (
                  <tr>
                    <td colSpan={6} style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-4)' }}>
                      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                          <strong>문의 내용:</strong>
                          <p style={{ marginTop: 'var(--space-2)', whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)' }}>
                            {inq.content}
                          </p>
                        </div>
                        <hr className="divider" />
                        <div>
                          <strong>답변 작성:</strong>
                          {inq.status === 'resolved' ? (
                            <p style={{ marginTop: 'var(--space-2)', whiteSpace: 'pre-wrap', color: 'var(--color-success)' }}>
                              {inq.reply}
                            </p>
                          ) : (
                            <div style={{ marginTop: 'var(--space-2)' }}>
                              <textarea 
                                className="form-input form-textarea" 
                                style={{ width: '100%', minHeight: '100px', marginBottom: 'var(--space-2)' }}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="답변 내용을 입력하세요..."
                              />
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleReplySubmit(inq.id)}
                              >
                                답변 등록
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  등록된 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
