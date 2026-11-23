-- ==========================================================================
-- 가입 시 public.users 행 자동 생성 트리거 (재)설치 + 누락 계정 백필
--
-- 배경: RLS 강화 후, 이메일 인증 전(세션 없음)에는 클라이언트가 public.users 에
--       직접 INSERT 할 수 없다. 그래서 DB 트리거가 반드시 행을 만들어야 한다.
--       (role_requests.user_id 는 public.users(id) 를 참조하므로 행이 없으면 FK 에러)
-- Supabase SQL Editor 에서 실행. 여러 번 실행해도 안전.
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url, role, preferred_locale, disabled)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'member',
    'ko',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 트리거가 없던 동안 가입해서 public.users 행이 없는 계정 복구
INSERT INTO public.users (id, email, display_name, photo_url, role, preferred_locale, disabled)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', SPLIT_PART(COALESCE(u.email, ''), '@', 1), ''),
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  'member',
  'ko',
  false
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = u.id);

-- 확인: 0 이 나와야 정상
SELECT COUNT(*) AS missing_users
FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = u.id);
