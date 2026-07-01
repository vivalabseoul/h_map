'use client';
import React, { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getBookingsByUser, updateBookingStatus } from '@/lib/database';
import type { Booking } from '@/types';

export default function MyBookingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) getBookingsByUser(user.id).then(setBookings);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', borderLeft: '4px solid var(--color-accent)' }}>
            <strong>안내:</strong> 예약하신 날짜나 시간을 변경하시려면 공방(스튜디오)으로 직접 전화 문의해 주시기 바랍니다.
          </div>

          <div className="table-wrapper desktop-only">
            <table className="table">
              <thead>
                <tr>
                  <th>Course / Workshop</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {b.courseTitle ? (typeof b.courseTitle === 'string' ? b.courseTitle : (b.courseTitle as any).ko || (b.courseTitle as any).en) : `Course ID: ${b.courseId}`}
                      </div>
                      {b.workshopName && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {typeof b.workshopName === 'string' ? b.workshopName : (b.workshopName as any).ko || (b.workshopName as any).en}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>{b.selectedDate.split('T')[0]}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {b.selectedTime} ({b.participants}명)
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        b.status === 'confirmed' ? 'badge-success' : 
                        b.status === 'pending' ? 'badge-warning' : 
                        'badge-danger'
                      }`}>
                        {b.status === 'confirmed' ? '예약 확정' : 
                         b.status === 'pending' ? '승인 대기' : 
                         b.status === 'rejected' ? '거절됨' :
                         b.status === 'cancelled' ? '취소됨' : b.status}
                      </span>
                    </td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td>
                      {b.status !== 'cancelled' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.id)}>
                          취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {bookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>
                      {b.courseTitle ? (typeof b.courseTitle === 'string' ? b.courseTitle : (b.courseTitle as any).ko || (b.courseTitle as any).en) : `Course ID: ${b.courseId}`}
                    </div>
                    {b.workshopName && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {typeof b.workshopName === 'string' ? b.workshopName : (b.workshopName as any).ko || (b.workshopName as any).en}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${
                    b.status === 'confirmed' ? 'badge-success' : 
                    b.status === 'pending' ? 'badge-warning' : 
                    'badge-danger'
                  }`} style={{ whiteSpace: 'nowrap', marginLeft: 'var(--space-2)' }}>
                    {b.status === 'confirmed' ? '예약 확정' : 
                     b.status === 'pending' ? '승인 대기' : 
                     b.status === 'rejected' ? '거절됨' :
                     b.status === 'cancelled' ? '취소됨' : b.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Date: </span>
                    {b.selectedDate.split('T')[0]}
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Time: </span>
                    {b.selectedTime} ({b.participants}명)
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Applied: {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                  {b.status !== 'cancelled' && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.id)}>
                      예약 취소 (Cancel)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
