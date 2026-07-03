// ==========================================
// DELETE /api/auth/delete-account
// Deletes the authenticated user's account
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
// Security: Verifies the JWT token to ensure only the
// authenticated user can delete their own account.
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json(
        { error: '서버 설정이 올바르지 않습니다. SUPABASE_SERVICE_ROLE_KEY를 확인하세요.' },
        { status: 500 }
      );
    }

    // Verify the caller's JWT from the Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // Use anon client to verify the token
    const userClient = createClient(supabaseUrl, anonKey);
    const { data: { user: callerUser }, error: verifyError } = await userClient.auth.getUser(token);

    if (verifyError || !callerUser) {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 401 });
    }

    // Ensure the caller is only deleting their own account
    if (callerUser.id !== userId) {
      return NextResponse.json({ error: '본인 계정만 삭제할 수 있습니다.' }, { status: 403 });
    }

    // Admin client with service role key (bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Delete the user from auth.users (cascade will delete public.users row too)
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: err.message || '알 수 없는 오류가 발생했습니다.' }, { status: 500 });
  }
}
