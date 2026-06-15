'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateUserRole } from '@/lib/database';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';
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
  const router = useRouter();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching role requests with join:', error.message, error.code, error.hint, error.details);
        // Fallback: fetch without join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('role_requests')
          .select('*')
          .eq('status', 'pending')
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

      // 2. Update request status
      const { error } = await supabase!
        .from('role_requests')
        .update({ status: 'approved' })
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
      const { error } = await supabase!
        .from('role_requests')
        .update({ 
          status: 'rejected', 
          reject_reason: reason || '관리자에 의해 반려되었습니다.' 
        })
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>가입 등급 승인 관리</h1>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          대기 중인 등급 승인 요청이 없습니다.
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>요청일</th>
                <th>이름 (이메일)</th>
                <th>요청 등급</th>
                <th>명함</th>
                <th style={{ textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td data-label="요청일">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td data-label="이름 (이메일)" style={{ textAlign: 'left' }}>
                    <div style={{ textAlign: 'right' }}>
                      {req.users?.display_name || '(이름 없음)'} <br/>
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
                  <td data-label="관리" className={styles.actions}>
                    <button onClick={() => handleApprove(req)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>승인</button>
                    <button onClick={() => handleReject(req)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>반려</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
