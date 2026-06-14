'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Search, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, updateUserRole, toggleUserDisabled } from '@/lib/firestore';
import { getAssignableRoles } from '@/lib/permissions';
import type { AppUser, UserRole } from '@/types';

export default function MembersPage() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const handleRoleChange = useCallback(async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Role change error:', err);
    }
  }, []);

  const handleToggleDisabled = useCallback(async (uid: string, disabled: boolean) => {
    try {
      await toggleUserDisabled(uid, disabled);
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, disabled } : u));
    } catch (err) {
      console.error('Toggle disabled error:', err);
    }
  }, []);

  const handleForceRemove = useCallback(async (uid: string) => {
    if (confirm('정말로 이 회원을 강제 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Mock remove logic
        setUsers((prev) => prev.filter((u) => u.uid !== uid));
      } catch (err) {
        console.error('Force remove error:', err);
      }
    }
  }, []);

  const assignableRoles = userRole ? getAssignableRoles(userRole) : [];

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

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
            {filtered.map((user) => (
              <tr key={user.uid}>
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
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    {assignableRoles.length > 0 && user.role !== 'super_admin' && (
                      <select
                        className="form-select"
                        style={{ padding: '4px 28px 4px 8px', fontSize: 'var(--font-size-xs)', minWidth: '100px' }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
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
                          onClick={() => handleToggleDisabled(user.uid, !user.disabled)}
                        >
                          {user.disabled ? t('admin.enable_account') : t('admin.disable_account')}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleForceRemove(user.uid)}
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
    </div>
  );
}
