'use client';

import React, { useState, useEffect } from 'react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/lib/database';
import type { Notice } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Megaphone, CheckCircle, XCircle } from 'lucide-react';

// Using inline styles for quick admin page setup
const styles = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold' },
  button: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2b2b2b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  dangerButton: { background: '#ef4444', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  editButton: { background: '#3b82f6', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { padding: '12px 16px', textAlign: 'left' as const, background: '#f8f9fa', borderBottom: '2px solid #dee2e6', fontWeight: '600' },
  td: { padding: '12px 16px', borderBottom: '1px solid #dee2e6' },
  badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
  badgeMain: { background: '#fee2e2', color: '#991b1b' },
  badgeActive: { background: '#dcfce7', color: '#166534' },
  badgeInactive: { background: '#f3f4f6', color: '#374151' },
  modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '500' },
  input: { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '100px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelButton: { padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' },
};

export default function AdminNoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    const data = await getNotices();
    setNotices(data);
  };

  const openModal = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice);
      setTitle(notice.title);
      setContent(notice.content);
      setIsMain(notice.isMain);
      setIsActive(notice.isActive);
    } else {
      setEditingNotice(null);
      setTitle('');
      setContent('');
      setIsMain(false);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, { title, content, isMain, isActive });
      } else {
        await createNotice({
          title, content, isMain, isActive, authorName: user?.displayName || '관리자'
        });
      }
      await loadNotices();
      closeModal();
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await deleteNotice(id);
        await loadNotices();
      } catch (error) {
        console.error('Failed to delete notice:', error);
      }
    }
  };

  const toggleMain = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { isMain: !notice.isMain });
      await loadNotices();
    } catch (error) {
      console.error('Failed to toggle main status', error);
    }
  };

  const toggleActive = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { isActive: !notice.isActive });
      await loadNotices();
    } catch (error) {
      console.error('Failed to toggle active status', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>공지사항 관리</h1>
        <button style={styles.button} onClick={() => openModal()}>
          <Plus size={16} /> 새 공지사항 등록
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>메인 노출</th>
            <th style={styles.th}>상태</th>
            <th style={styles.th}>제목</th>
            <th style={styles.th}>작성일</th>
            <th style={styles.th}>관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => (
            <tr key={notice.id}>
              <td style={styles.td}>
                <button 
                  onClick={() => toggleMain(notice)}
                  style={{...styles.badge, ...(notice.isMain ? styles.badgeMain : styles.badgeInactive), border: 'none', cursor: 'pointer'}}
                >
                  {notice.isMain ? '메인 배너' : '일반'}
                </button>
              </td>
              <td style={styles.td}>
                <button 
                  onClick={() => toggleActive(notice)}
                  style={{...styles.badge, ...(notice.isActive ? styles.badgeActive : styles.badgeInactive), border: 'none', cursor: 'pointer'}}
                >
                  {notice.isActive ? '활성 (표시됨)' : '비활성 (숨김)'}
                </button>
              </td>
              <td style={styles.td}>{notice.title}</td>
              <td style={styles.td}>{new Date(notice.createdAt).toLocaleDateString()}</td>
              <td style={styles.td}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={styles.editButton} onClick={() => openModal(notice)}><Edit2 size={14} /></button>
                  <button style={styles.dangerButton} onClick={() => handleDelete(notice.id)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{editingNotice ? '공지사항 수정' : '새 공지사항 등록'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>제목</label>
                <input 
                  style={styles.input} 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  maxLength={100}
                  required 
                  placeholder="공지사항 제목"
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: title.length >= 100 ? '#ef4444' : '#6b7280', marginTop: '4px' }}>
                  {title.length} / 100자
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>내용</label>
                <textarea 
                  style={styles.textarea} 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  maxLength={2000}
                  required 
                  placeholder="공지사항 내용 (최대 2000자)"
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: content.length >= 2000 ? '#ef4444' : '#6b7280', marginTop: '4px' }}>
                  {content.length} / 2000자
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={isMain} onChange={e => setIsMain(e.target.checked)} />
                  메인 공지사항 (상단 배너에 노출)
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  활성화 (사용자에게 표시)
                </label>
              </div>

              <div style={styles.buttonGroup}>
                <button type="button" style={styles.cancelButton} onClick={closeModal}>취소</button>
                <button type="submit" style={styles.button}>저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
