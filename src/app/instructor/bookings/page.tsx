'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getBookingsByInstructor, updateBookingStatus } from '@/lib/database';
import type { Booking } from '@/types';

export default function InstructorBookingsPage() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getBookingsByInstructor(user.id).then(data => {
        setBookings(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    if (!confirm('예약 상태를 변경하시겠습니까?')) return;
    try {
      await updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: status as any } : b));
    } catch (err) {
      console.error(err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading bookings...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-brown)', marginBottom: 'var(--space-2)' }}>
            예약 관리 (Bookings)
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>총 {bookings.length}건의 예약이 있습니다.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <h3>아직 접수된 예약이 없습니다</h3>
          <p>예약이 접수되면 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>코스명 / 공방명</th>
                <th>예약 일정</th>
                <th>예약자 정보</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {b.courseTitle ? (b.courseTitle as any)[locale] || (b.courseTitle as any).en : `Course ID: ${b.courseId}`}
                    </div>
                    {b.workshopName && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {(b.workshopName as any)[locale] || (b.workshopName as any).en}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{b.selectedDate.split('T')[0]}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {b.selectedTime}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent)', marginTop: '2px', fontWeight: 600 }}>
                      참여 인원: {b.participants}명
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{b.userName || '알 수 없음'}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      연락처: {b.userPhone || '미기재'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                      {b.status === 'confirmed' ? '예약 확정' : b.status === 'cancelled' ? '취소됨' : b.status}
                    </span>
                  </td>
                  <td>
                    {b.status !== 'cancelled' ? (
                      <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(b.id, 'cancelled')}>
                        예약 취소
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleUpdateStatus(b.id, 'confirmed')}>
                        다시 확정
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
