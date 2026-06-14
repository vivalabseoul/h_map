'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Star, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getReviews, addReview } from '@/lib/firestore';
import type { Review } from '@/types';
import styles from './ReviewSection.module.css';

interface ReviewSectionProps {
  workshopId: string;
}

export default function ReviewSection({ workshopId }: ReviewSectionProps) {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getReviews(workshopId).then(setReviews);
  }, [workshopId]);

  const handleSubmit = useCallback(async () => {
    if (!user || !newRating || !newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addReview({
        workshopId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        rating: newRating,
        text: newText.trim(),
        locale,
      });
      // Refresh reviews
      const updated = await getReviews(workshopId);
      setReviews(updated);
      setNewRating(0);
      setNewText('');
    } catch (error) {
      console.error('Review submit error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [user, newRating, newText, submitting, workshopId, locale]);

  const renderStars = (rating: number, size = 14) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < Math.floor(rating) ? '#e6a23c' : 'none'}
        stroke={i < Math.floor(rating) ? '#e6a23c' : '#e8e0d8'}
      />
    ));

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{t('review.title')}</h3>

      {reviews.length === 0 ? (
        <p className={styles.empty}>{t('review.no_reviews')}</p>
      ) : (
        <div className={styles.reviewList}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAvatar}>
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.reviewMeta}>
                  <div className={styles.reviewName}>{review.userName}</div>
                  <div className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
              </div>
              <p className={styles.reviewText}>{review.text}</p>
              {review.locale !== locale && (
                <span className={styles.translatedBadge}>
                  <Globe size={12} />
                  {t('review.auto_translated')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Review */}
      {user ? (
        <div className={styles.writeReview}>
          <div className={styles.writeReviewTitle}>{t('review.write_review')}</div>
          <div className={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={styles.starBtn}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setNewRating(star)}
                aria-label={`${star} star`}
              >
                <Star
                  size={24}
                  fill={(hoveredStar || newRating) >= star ? '#e6a23c' : 'none'}
                  stroke={(hoveredStar || newRating) >= star ? '#e6a23c' : '#e8e0d8'}
                />
              </button>
            ))}
          </div>
          <textarea
            className={styles.reviewTextarea}
            placeholder={t('review.your_review')}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!newRating || !newText.trim() || submitting}
          >
            {submitting ? '...' : t('review.submit')}
          </button>
        </div>
      ) : (
        <p className={styles.loginPrompt}>{t('review.login_to_review')}</p>
      )}
    </div>
  );
}
