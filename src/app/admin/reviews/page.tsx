'use client';
import React, { useEffect, useState } from 'react';
import { getAllReviews, deleteReview } from '@/lib/database';
import type { Review } from '@/types';
import { Trash2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    getAllReviews().then(data => {
      setReviews(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 리뷰를 정말 삭제하시겠습니까? (삭제 시 복구 불가)')) {
      try {
        await deleteReview(id);
        fetchReviews();
      } catch (e) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>리뷰 관리</h1>
          <p>사용자들이 남긴 전체 리뷰를 확인하고 부적절한 리뷰를 삭제합니다.</p>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-3)' }}>작성자</th>
              <th style={{ padding: 'var(--space-3)' }}>리뷰 내용</th>
              <th style={{ padding: 'var(--space-3)' }}>평점</th>
              <th style={{ padding: 'var(--space-3)' }}>작성일</th>
              <th style={{ padding: 'var(--space-3)', width: '80px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-3)' }}>{r.userName}</td>
                <td style={{ padding: 'var(--space-3)' }}>{r.text}</td>
                <td style={{ padding: 'var(--space-3)' }}>⭐ {r.rating}</td>
                <td style={{ padding: 'var(--space-3)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <button onClick={() => handleDelete(r.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  등록된 리뷰가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
