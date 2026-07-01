'use client';
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getWorkshops, deleteWorkshop, updateWorkshop, getAllUsers } from '@/lib/database';
import type { Workshop, AppUser } from '@/types';
import { CATEGORIES } from '@/types';

export default function AdminWorkshopsPage() {
  const { locale, t } = useLanguage();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [instructors, setInstructors] = useState<AppUser[]>([]);

  // Transfer Ownership Modal State
  const [transferModal, setTransferModal] = useState<{ isOpen: boolean; workshopId: string; currentOwnerId: string } | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState<'createdAt' | 'clicksDesc' | 'clicksAsc'>('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  useEffect(() => {
    getWorkshops().then(setWorkshops);
    getAllUsers().then(users => {
      // Filter only users who are instructors (or super_admin/manager if they also own workshops)
      setInstructors(users.filter(u => u.role === 'instructor' || u.role === 'manager' || u.role === 'super_admin'));
    });
  }, []);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (confirm(`스튜디오를 강제로 ${newStatus === 'active' ? '활성화' : '비활성화'} 하시겠습니까?`)) {
      setWorkshops(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteWorkshop(id);
        setWorkshops(prev => prev.filter(w => w.id !== id));
      } catch (err) {
        console.error(err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleOpenTransferModal = (id: string, currentOwnerId: string) => {
    setTransferModal({ isOpen: true, workshopId: id, currentOwnerId });
    setSelectedInstructorId(currentOwnerId);
  };

  const handleConfirmTransfer = async () => {
    if (!transferModal) return;
    const { workshopId, currentOwnerId } = transferModal;
    
    if (selectedInstructorId && selectedInstructorId !== currentOwnerId) {
      if (confirm(`정말 이 스튜디오의 소유권을 변경하시겠습니까?`)) {
        try {
          await updateWorkshop(workshopId, { ownerId: selectedInstructorId });
          setWorkshops(prev => prev.map(w => w.id === workshopId ? { ...w, ownerId: selectedInstructorId } : w));
          alert('소유권이 성공적으로 변경되었습니다.');
          setTransferModal(null);
        } catch (err) {
          console.error(err);
          alert('소유권 변경 중 오류가 발생했습니다.');
        }
      }
    } else {
      setTransferModal(null);
    }
  };

  const filteredWorkshops = workshops.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = Object.values(w.name).some(n => n?.toLowerCase().includes(q));
    const descMatch = Object.values(w.description || {}).some(d => d?.toLowerCase().includes(q));
    const catMatch = w.category.toLowerCase().includes(q) || t(`filters.${w.category}`).toLowerCase().includes(q);
    const ownerMatch = (w.ownerName || '').toLowerCase().includes(q) || (w.ownerId || '').toLowerCase().includes(q);
    return nameMatch || descMatch || catMatch || ownerMatch;
  });

  const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
    if (sortBy === 'clicksDesc') {
      return (b.totalClicks || 0) - (a.totalClicks || 0);
    }
    if (sortBy === 'clicksAsc') {
      return (a.totalClicks || 0) - (b.totalClicks || 0);
    }
    // Default to created at (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.ceil(sortedWorkshops.length / itemsPerPage) || 1;
  const paginatedWorkshops = sortedWorkshops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.workshops')}</h1>
          <p>{filteredWorkshops.length} workshops found</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="Search by name, description, category, or owner..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="form-select"
          style={{ width: '200px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="createdAt">최신 등록순</option>
          <option value="clicksDesc">조회수 높은 순 (랭킹)</option>
          <option value="clicksAsc">조회수 낮은 순</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Workshop</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Region</th>
              <th>조회수(클릭)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWorkshops.map((w) => {
              const cat = CATEGORIES.find((c) => c.key === w.category);
              return (
                <tr key={w.id}>
                  <td style={{ fontWeight: 500 }}>{w.name[locale]}</td>
                  <td>
                    <span className="badge badge-accent">
                      {cat?.emoji} {t(`filters.${w.category}`)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{w.ownerName || w.ownerId}</td>
                  <td>⭐ {w.rating} ({w.reviewCount})</td>
                  <td>
                    <span className={`badge ${w.status === 'active' ? 'badge-success' : w.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{w.region.replace('_', ' ')}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{(w.totalClicks || 0).toLocaleString()} 회</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>길찾기: {w.navClicks || 0}</span>
                      <span>인스타: {w.instagramClicks || 0}</span>
                      <span>웹: {w.websiteClicks || 0}</span>
                      <span>유튜브: {w.youtubeClicks || 0}</span>
                      <span>공유: {w.shareClicks || 0}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        className={`btn btn-sm ${w.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(w.id, w.status)}
                      >
                        {w.status === 'active' ? '비활성화' : '활성화'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenTransferModal(w.id, w.ownerId)}
                      >
                        권한 이전
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {/* Transfer Ownership Modal */}
      {transferModal?.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setTransferModal(null)}>
          <div style={{
            backgroundColor: 'var(--color-bg)', padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px',
            boxShadow: 'var(--shadow-xl)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>소유권(강사) 이전</h3>
            <p style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              이 공방을 관리할 새로운 강사를 목록에서 선택해 주세요.
            </p>
            
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label">새로운 소유자 선택</label>
              <select 
                className="form-select" 
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
              >
                <option value="">강사를 선택하세요</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.displayName || inst.email} ({inst.email}) - {inst.role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setTransferModal(null)}>취소</button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmTransfer}
                disabled={!selectedInstructorId || selectedInstructorId === transferModal.currentOwnerId}
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
