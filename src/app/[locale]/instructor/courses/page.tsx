'use client';
import React, { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getCoursesByInstructor, deleteCourse } from '@/lib/database';
import type { Course } from '@/types';

export default function InstructorCoursesPage() {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (user) getCoursesByInstructor(user.id).then(setCourses);
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm(t('instructor.confirm_delete') || '정말 삭제하시겠습니까?')) {
      try {
        await deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error(err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('instructor.my_courses')}</h1>
          <p>{courses.length} courses</p>
        </div>
        <Link href="/instructor/courses/new" className="btn btn-primary">
          <Plus size={18} />
          {t('instructor.create_course')}
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>{t('instructor.no_courses')}</h3>
          <p>Create your first course to start teaching!</p>
          <Link href="/instructor/courses/new" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            <Plus size={18} />
            {t('instructor.create_course')}
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Course / Studio</th>
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
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {c.title[locale] || c.title.ko || c.title.en}
                    </div>
                    {(() => {
                      const getIntro = (c: any) => {
                        const isDescEmpty = (d: any) => {
                          if (!d) return true;
                          if (typeof d === 'string') return !d.trim();
                          return !d.intro?.trim() && !d.curriculum?.trim() && !d.included?.trim() && !d.precautions?.trim();
                        };

                        if (!c.description) return '';
                        let parsedDesc = c.description;
                        if (typeof c.description === 'string') {
                          try {
                            parsedDesc = JSON.parse(c.description);
                          } catch (e) {
                            return c.description;
                          }
                        }
                        
                        let desc = (parsedDesc as any)[locale];
                        if (isDescEmpty(desc)) desc = (parsedDesc as any).ko;
                        if (isDescEmpty(desc)) desc = (parsedDesc as any).en;
                        if (isDescEmpty(desc)) desc = parsedDesc;

                        if (isDescEmpty(desc)) return '';
                        if (typeof desc === 'string') return desc;
                        
                        return desc.intro?.trim() || '';
                      };
                      const intro = getIntro(c);
                      return intro ? (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {intro}
                        </div>
                      ) : null;
                    })()}
                    {c.workshopName && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {(c.workshopName as any)[locale] || (c.workshopName as any).ko || (c.workshopName as any).en}
                      </div>
                    )}
                  </td>
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
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Link href={`/instructor/courses/${c.id}/edit`} className="btn btn-sm btn-secondary">
                        {t('common.edit')}
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>
                        {t('common.delete')}
                      </button>
                    </div>
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
