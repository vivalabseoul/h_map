'use client';
import { useLocalizedRouter } from '@/context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateUserRole } from '@/lib/database';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';
import { Search } from 'lucide-react';
import styles from './RoleRequests.module.css';

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: UserRole;
  business_card_url: string;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason: string | null;
  created_at: string;
  users?: {
    email: string;
    display_name: string;
  };
}

export default function RoleRequestsAdminPage() {
  const { userRole, loading: authLoading } = useAuth();
  const router = useLocalizedRouter();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    if (!authLoading && userRole !== 'super_admin' && userRole !== 'manager') {
      router.push('/');
    }
  }, [userRole, authLoading, router]);

  const fetchRequests = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      // Try with user join first
      const { data, error } = await supabase
        .from('role_requests')
        .select('*, users(email, display_name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching role requests with join:', error.message, error.code, error.hint, error.details);
        // Fallback: fetch without join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('role_requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('Error fetching role requests (fallback):', fallbackError.message, fallbackError.code, fallbackError.hint, fallbackError.details);
        } else {
          console.log('Role requests (without join):', fallbackData);
          setRequests((fallbackData || []) as any);
        }
      } else {
        console.log('Role requests:', data);
        setRequests((data || []) as any);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: RoleRequest) => {
    if (!confirm(`${request.users?.display_name} 님의 ${request.requested_role} 등급 변경을 승인하시겠습니까?`)) return;

    try {
      // 1. Update user role
      await updateUserRole(request.user_id, request.requested_role);

      const updateData: any = { status: 'approved' };

      // Delete image from storage to save space and protect privacy
      if (request.business_card_url) {
        try {
          const urlParts = request.business_card_url.split('business_cards/');
          if (urlParts.length > 1) {
            const fileName = urlParts[1];
            await supabase!.storage.from('business_cards').remove([fileName]);
            updateData.business_card_url = null;
          }
        } catch (e) {
          console.error('Failed to delete image:', e);
        }
      }

      // 2. Update request status
      const { error } = await supabase!
        .from('role_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;
      
      alert('승인되었습니다.');
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (request: RoleRequest) => {
    const reason = prompt('반려 사유를 입력해 주세요:');
    if (reason === null) return; // cancelled

    try {
      const updateData: any = { 
        status: 'rejected', 
        reject_reason: reason || '관리자에 의해 반려되었습니다.' 
      };

      // Delete image from storage to save space and protect privacy
      if (request.business_card_url) {
        try {
          const urlParts = request.business_card_url.split('business_cards/');
          if (urlParts.length > 1) {
            const fileName = urlParts[1];
            await supabase!.storage.from('business_cards').remove([fileName]);
            updateData.business_card_url = null;
          }
        } catch (e) {
          console.error('Failed to delete image:', e);
        }
      }

      const { error } = await supabase!
        .from('role_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      alert('반려 처리되었습니다.');
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert('반려 중 오류가 발생했습니다.');
    }
  };

  const handleUploadAdmin = async (request: RoleRequest, file: File) => {
    if (!supabase) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `admin_${request.user_id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('business_cards')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('business_cards')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('role_requests')
        .update({ business_card_url: publicUrlData.publicUrl })
        .eq('id', request.id);

      if (updateError) throw updateError;

      alert('명함 이미지가 업로드되었습니다.');
      fetchRequests();
    } catch (err: any) {
      console.error('Business card upload error:', err);
      alert('업로드 실패: ' + err.message);
    }
  };

  if (authLoading || loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  const filteredRequests = requests.filter((req) => {
    const matchSearch = !searchQuery || 
      req.users?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>가입 등급 승인 관리</h1>
          <p>{filteredRequests.length} requests found</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
            placeholder="이름 또는 이메일 검색..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">모든 상태</option>
          <option value="pending">대기 중</option>
          <option value="approved">승인됨</option>
          <option value="rejected">반려됨</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-8)' }}>
          등록된 등급 승인 요청이 없습니다.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>요청일</th>
                <th>이름 (이메일)</th>
                <th>요청 등급</th>
                <th>명함</th>
                <th>상태</th>
                <th style={{ textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((req) => (
                <tr key={req.id}>
                  <td data-label="요청일">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td data-label="이름 (이메일)" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 500 }}>{req.users?.display_name || '(이름 없음)'}</span>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>({req.users?.email || req.user_id})</span>
                    </div>
                  </td>
                  <td data-label="요청 등급" style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>
                    {req.requested_role === 'instructor' ? '크리에이터' : '마켓 코디네이터'}
                  </td>
                  <td data-label="명함" className={styles.imageCol}>
                    {req.business_card_url ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={() => setPreviewImage(req.business_card_url)} 
                          style={{ color: '#0284c7', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                        >
                          이미지 보기
                        </button>
                        <label style={{ fontSize: '0.8rem', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                          재업로드
                          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUploadAdmin(req, e.target.files[0]); }} />
                        </label>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ color: '#999' }}>없음</span>
                        <label style={{ fontSize: '0.8rem', color: '#0284c7', cursor: 'pointer', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                          업로드
                          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUploadAdmin(req, e.target.files[0]); }} />
                        </label>
                      </div>
                    )}
                  </td>
                  <td data-label="상태" style={{ fontWeight: '500' }}>
                    {req.status === 'pending' && <span style={{ color: '#f59e0b' }}>대기 중</span>}
                    {req.status === 'approved' && <span style={{ color: '#10b981' }}>승인됨</span>}
                    {req.status === 'rejected' && <span style={{ color: '#ef4444' }}>반려됨</span>}
                  </td>
                  <td data-label="관리">
                    {req.status === 'pending' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={() => handleApprove(req)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>승인</button>
                        <button onClick={() => handleReject(req)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>반려</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>처리 완료</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredRequests.length > 0 && (
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
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-35px', right: '0',
                background: 'none', border: 'none', color: '#fff',
                fontSize: '28px', cursor: 'pointer', lineHeight: 1
              }}
            >
              &times;
            </button>
            <img 
              src={previewImage} 
              alt="명함 원본" 
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                minWidth: '200px',
                objectFit: 'contain',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
