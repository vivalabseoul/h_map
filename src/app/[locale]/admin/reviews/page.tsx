'use client';
import React, { useEffect, useState } from 'react';
import { getAllReviews, deleteReview } from '@/lib/database';
import type { Review } from '@/types';
import { Trash2, Search } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredReviews = reviews.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (r.userName || '').toLowerCase().includes(q);
    const textMatch = (r.text || '').toLowerCase().includes(q);
    return nameMatch || textMatch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>리뷰 관리</h1>
          <p>{filteredReviews.length} reviews found</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="Search by username, content..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>작성자</th>
              <th>리뷰 내용</th>
              <th>평점</th>
              <th>작성일</th>
              <th style={{ width: '80px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((r) => (
              <tr key={r.id}>
                <td>{r.userName}</td>
                <td>{r.text}</td>
                <td>⭐ {r.rating}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(r.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
