'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getBookingsByUser, updateBookingStatus } from '@/lib/firestore';
import type { Booking } from '@/types';

export default function MyBookingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) getBookingsByUser(user.uid).then(setBookings);
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm(t('common.confirm_cancel'))) return;
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('my.bookings')}</h1>
          <p>{bookings.length} total bookings</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <h3>No bookings yet</h3>
          <p>Find a workshop and book your first class!</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Explore Workshops
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>Course ID: {b.courseId}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>Instructor</td>
                  <td>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    {b.status !== 'cancelled' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
