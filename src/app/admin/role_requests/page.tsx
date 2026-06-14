'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateUserRole } from '@/lib/database';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

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

  useEffect(() => {
    if (!authLoading && userRole !== 'super_admin' && userRole !== 'manager') {
      router.push('/');
    }
  }, [userRole, authLoading, router]);

  const fetchRequests = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('role_requests')
      .select('*, users(email, display_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching role requests:', error);
    } else {
      setRequests(data as any);
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
      const { error } = await supabase
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
      const { error } = await supabase
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

  if (authLoading || loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--space-6)' }}>가입 등급 승인 관리</h1>

      {requests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px' }}>
          대기 중인 등급 승인 요청이 없습니다.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <thead style={{ background: 'var(--color-bg-secondary)' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>요청일</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>이름 (이메일)</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>요청 등급</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>명함</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    {req.users?.display_name} <br/>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>({req.users?.email})</span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                    {req.requested_role === 'instructor' ? '크리에이터' : '마켓 코디네이터'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {req.business_card_url ? (
                      <a href={req.business_card_url} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>
                        이미지 보기
                      </a>
                    ) : (
                      <span style={{ color: '#999' }}>없음</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => handleApprove(req)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>승인</button>
                    <button onClick={() => handleReject(req)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>반려</button>
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
