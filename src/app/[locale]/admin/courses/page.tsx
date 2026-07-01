'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getCourses, updateCourse } from '@/lib/database';
import type { Course } from '@/types';

export default function AdminCoursesPage() {
  const { locale, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    if (confirm(`워크샵 예약을 강제로 ${newStatus === 'open' ? '오픈' : '마감'} 하시겠습니까?`)) {
      try {
        await updateCourse(id, { status: newStatus as any });
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      } catch (err) {
        console.error(err);
        alert('상태 변경 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.courses')}</h1>
          <p>{courses.length} courses total</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Instructor</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.title[locale]}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{c.instructorName || c.instructorId}</td>
                <td>{c.price}</td>
                <td>{c.duration}</td>
                <td>{c.currentParticipants}/{c.maxParticipants}</td>
                <td>
                  <span className={`badge ${c.status === 'open' ? 'badge-success' : c.status === 'closed' ? 'badge-danger' : 'badge-warning'}`}>
                    {c.status}
                  </span>
                </td>
                <td>{new Date(c.startDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn btn-sm ${c.status === 'open' ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(c.id, c.status)}
                  >
                    {c.status === 'open' ? '강제 마감' : '다시 오픈'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
