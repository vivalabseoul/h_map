'use client';
import React, { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getReviewsByUser, getWorkshopNamesByIds } from '@/lib/database';
import type { Review, Locale } from '@/types';

export default function MyReviewsPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [workshops, setWorkshops] = useState<Record<string, { name: Record<Locale, string>; slug: string }>>({});

  useEffect(() => {
    if (!user) return;
    getReviewsByUser(user.id).then(async (list) => {
      setReviews(list);
      setWorkshops(await getWorkshopNamesByIds(list.map((r) => r.workshopId)));
    });
  }, [user]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('my.reviews')}</h1>
          <p>{t('my.reviews_written').replace('{n}', String(reviews.length))}</p>
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
                <th>{t('my.col_workshop')}</th>
                <th>{t('my.col_rating')}</th>
                <th>{t('my.col_review')}</th>
                <th>{t('my.col_date')}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>
                    {workshops[r.workshopId] ? (
                      <Link href={`/workshops/${workshops[r.workshopId].slug}`}>
                        {workshops[r.workshopId].name[locale] || workshops[r.workshopId].name.ko || workshops[r.workshopId].name.en}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>{t('my.workshop_unavailable')}</span>
                    )}
                  </td>
                  <td>{renderStars(r.rating)}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.text}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString(locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
