'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getReviewsByUser } from '@/lib/firestore';
import type { Review } from '@/types';

export default function MyReviewsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (user) getReviewsByUser(user.uid).then(setReviews);
  }, [user]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('my.reviews')}</h1>
          <p>{reviews.length} reviews written</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Share your experience after attending a workshop!</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Explore Workshops
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Workshop</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>Workshop ID: {r.workshopId}</td>
                  <td>{renderStars(r.rating)}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.text}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
