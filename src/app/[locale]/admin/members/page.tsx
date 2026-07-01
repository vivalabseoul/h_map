'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Search, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, updateUserRole, toggleUserDisabled, updateUserProfile } from '@/lib/database';
import { getAssignableRoles } from '@/lib/permissions';
import type { AppUser, UserRole } from '@/types';

export default function MembersPage() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole]);
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', photoURL: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const handleRoleChange = useCallback(async (id: string, newRole: UserRole) => {
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Role change error:', err);
    }
  }, []);

  const handleToggleDisabled = useCallback(async (id: string, disabled: boolean) => {
    try {
      await toggleUserDisabled(id, disabled);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, disabled } : u));
    } catch (err) {
      console.error('Toggle disabled error:', err);
    }
  }, []);

  const handleForceRemove = useCallback(async (id: string) => {
    if (confirm('정말로 이 회원을 강제 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Mock remove logic
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        console.error('Force remove error:', err);
      }
    }
  }, []);

  const openEditModal = (user: AppUser) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName || '',
      bio: user.bio || '',
      photoURL: user.photoURL || ''
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({ displayName: '', bio: '', photoURL: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await updateUserProfile(editingUser.id, editForm);
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...editForm } : u));
      closeEditModal();
    } catch (err) {
      console.error('Update profile error:', err);
      alert('회원정보 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const assignableRoles = userRole ? getAssignableRoles(userRole) : [];

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      super_admin: t('admin.super_admin'),
      manager: t('admin.manager'),
      instructor: t('admin.instructor_role'),
      member: t('admin.member_role'),
    };
    return map[role] || role;
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'var(--color-danger)',
      manager: 'var(--color-warning)',
      instructor: 'var(--color-sage)',
      member: 'var(--color-info)',
    };
    return map[role] || 'var(--color-text-muted)';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.member_management')}</h1>
          <p>{filtered.length} members found</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder={t('admin.search_members')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            id="member-search"
          />
        </div>
        <select className="form-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} id="role-filter">
          <option value="all">{t('filters.all')}</option>
          <option value="super_admin">{t('admin.super_admin')}</option>
          <option value="manager">{t('admin.manager')}</option>
          <option value="instructor">{t('admin.instructor_role')}</option>
          <option value="member">{t('admin.member_role')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('auth.display_name')}</th>
              <th>{t('auth.email')}</th>
              <th>{t('admin.role')}</th>
              <th>{t('admin.status')}</th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.displayName || '—'}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{user.email}</td>
                <td>
                  <span className="badge" style={{
                    background: `${roleColor(user.role)}18`,
                    color: roleColor(user.role),
                  }}>
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.disabled ? 'badge-danger' : 'badge-success'}`}>
                    {user.disabled ? t('admin.disabled') : t('admin.active')}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                    {userRole === 'super_admin' && (
                      <button
                        className="btn btn-sm"
                        onClick={() => openEditModal(user)}
                      >
                        정보 수정
                      </button>
                    )}
                    {assignableRoles.length > 0 && user.role !== 'super_admin' && (
                      <select
                        className="form-select"
                        style={{ padding: '4px 28px 4px 8px', fontSize: 'var(--font-size-xs)', minWidth: '100px' }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>{roleLabel(r)}</option>
                        ))}
                      </select>
                    )}
                    {user.role !== 'super_admin' && (
                      <>
                        <button
                          className={`btn btn-sm ${user.disabled ? 'btn-success' : 'btn-warning'}`}
                          onClick={() => handleToggleDisabled(user.id, !user.disabled)}
                        >
                          {user.disabled ? t('admin.enable_account') : t('admin.disable_account')}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleForceRemove(user.id)}
                        >
                          강제 탈퇴
                        </button>
                      </>
                    )}
                    {user.role === 'super_admin' && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} /> Protected
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <button 
          className="btn btn-secondary" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          이전
        </button>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
          {currentPage} / {totalPages}
        </span>
        <button 
          className="btn btn-secondary" 
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          다음
        </button>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={closeEditModal}>
          <div style={{
            backgroundColor: 'var(--color-bg)', padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px',
            boxShadow: 'var(--shadow-xl)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>회원정보 수정</h3>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">User ID (UID)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={editingUser.id}
                  readOnly
                  style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'text', fontSize: 'var(--font-size-sm)' }}
                />
                <button 
                  className="btn btn-sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(editingUser.id);
                    alert('UID가 복사되었습니다!');
                  }}
                  type="button"
                >
                  복사
                </button>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Supabase 데이터베이스에서 회원을 찾을 때 사용하세요.
              </p>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">이름 / 닉네임</label>
              <input
                type="text"
                className="form-input"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">간단한 소개 (Bio)</label>
              <textarea
                className="form-input form-textarea"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">프로필 사진 URL</label>
              <input
                type="text"
                className="form-input"
                value={editForm.photoURL}
                onChange={(e) => setEditForm({ ...editForm, photoURL: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={closeEditModal} disabled={isSaving}>취소</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
