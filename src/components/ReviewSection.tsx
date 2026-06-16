'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Star, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getReviews, addReview, deleteReview, updateReview } from '@/lib/database';
import type { Review } from '@/types';
import styles from './ReviewSection.module.css';

interface ReviewSectionProps {
  workshopId: string;
  onReviewAdded?: () => void;
}

export default function ReviewSection({ workshopId, onReviewAdded }: ReviewSectionProps) {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [editHoveredStar, setEditHoveredStar] = useState(0);

  useEffect(() => {
    getReviews(workshopId).then(setReviews);
  }, [workshopId]);

  const handleSubmit = useCallback(async () => {
    if (!user || !newRating || !newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addReview({
        workshopId,
        userId: user.id,
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
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error('Review submit error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [user, newRating, newText, submitting, workshopId, locale]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete') || '정말 삭제하시겠습니까?')) return;
    try {
      await deleteReview(id);
      const updated = await getReviews(workshopId);
      setReviews(updated);
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error('Delete review error:', error);
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditText(review.text);
    setEditHoveredStar(0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async () => {
    if (!editingId || !editRating || !editText.trim()) return;
    try {
      await updateReview(editingId, editText.trim(), editRating);
      const updated = await getReviews(workshopId);
      setReviews(updated);
      setEditingId(null);
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error('Update review error:', error);
    }
  };

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
              {editingId === review.id ? (
                <div className={styles.writeReview} style={{ marginTop: 'var(--space-2)' }}>
                  <div className={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={styles.starBtn}
                        onMouseEnter={() => setEditHoveredStar(star)}
                        onMouseLeave={() => setEditHoveredStar(0)}
                        onClick={() => setEditRating(star)}
                      >
                        <Star
                          size={20}
                          fill={(editHoveredStar || editRating) >= star ? '#e6a23c' : 'none'}
                          stroke={(editHoveredStar || editRating) >= star ? '#e6a23c' : '#e8e0d8'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={styles.reviewTextarea}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>취소</button>
                    <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={!editRating || !editText.trim()}>저장</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.reviewText}>{review.text}</p>
                  {review.locale !== locale && (
                    <span className={styles.translatedBadge}>
                      <Globe size={12} />
                      {t('review.auto_translated')}
                    </span>
                  )}
                  {user && user.id === review.userId && (
                    <div className={styles.reviewActions}>
                      <button className={styles.actionBtn} onClick={() => handleEditClick(review)}>수정</button>
                      <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(review.id)}>삭제</button>
                    </div>
                  )}
                </>
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
