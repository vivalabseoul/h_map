-- ==========================================================================
-- Storage 정책: business_cards 버킷(Private) / images 버킷
-- Supabase SQL Editor 에서 실행. 여러 번 실행해도 안전.
-- 전제: 대시보드에서 business_cards 버킷의 "Public bucket" 을 끈 상태.
-- ==========================================================================

DROP POLICY IF EXISTS afm_bc_insert ON storage.objects;
DROP POLICY IF EXISTS afm_bc_select ON storage.objects;
DROP POLICY IF EXISTS afm_bc_update ON storage.objects;
DROP POLICY IF EXISTS afm_bc_delete ON storage.objects;

-- 가입 시 명함 업로드 (이메일 인증 전이라 세션이 없을 수 있어 anon 도 허용)
CREATE POLICY afm_bc_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business_cards');

-- 열람/교체/삭제는 관리자만 (signed URL 생성도 SELECT 권한 필요)
CREATE POLICY afm_bc_select ON storage.objects FOR SELECT
  USING (bucket_id = 'business_cards' AND public.is_admin());
CREATE POLICY afm_bc_update ON storage.objects FOR UPDATE
  USING (bucket_id = 'business_cards' AND public.is_admin());
CREATE POLICY afm_bc_delete ON storage.objects FOR DELETE
  USING (bucket_id = 'business_cards' AND public.is_admin());
