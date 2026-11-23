-- ==========================================================================
-- ArtFlow Map — RLS hardening
-- 기존의 "Enable all operations for all users" (USING true) 정책을 모두 제거하고
-- 역할/소유자 기준 정책으로 교체한다.
--
-- 적용 방법: Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run.
-- 여러 번 실행해도 안전하다(idempotent). 문제가 생기면 맨 아래 ROLLBACK 블록 실행.
-- service_role 키(서버 API: 계정삭제, 축제 동기화)는 RLS를 우회하므로 영향 없음.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 0. 헬퍼 함수 (SECURITY DEFINER: users 테이블 RLS 재귀 방지)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.app_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.users WHERE id = auth.uid() AND COALESCE(disabled, false) = false $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE(public.app_role() IN ('super_admin', 'manager'), false) $$;

GRANT EXECUTE ON FUNCTION public.app_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- --------------------------------------------------------------------------
-- 1. 기존 전체허용 정책 제거
-- --------------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND policyname = 'Enable all operations for all users'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 새 정책 이름 충돌 방지를 위해 우리가 만든 정책도 재생성 전에 정리
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND policyname LIKE 'afm\_%'
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- --------------------------------------------------------------------------
-- 2. users — 본인 또는 관리자만 조회. role/disabled/email 은 관리자만 변경 가능
-- --------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_users_select ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY afm_users_insert ON public.users FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'member');
CREATE POLICY afm_users_update ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY afm_users_delete ON public.users FOR DELETE
  USING (public.is_admin());

-- 일반 사용자가 자기 role/disabled/email 을 바꾸지 못하게 컬럼 보호
CREATE OR REPLACE FUNCTION public.protect_user_columns()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- auth.uid() 가 NULL 이면 service_role / SQL Editor 등 서버측 호출 → 허용
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.disabled := OLD.disabled;
    NEW.email := OLD.email;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_user_columns ON public.users;
CREATE TRIGGER trg_protect_user_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_columns();

-- --------------------------------------------------------------------------
-- 3. workshops — 공개(active & 비공개 아님)는 누구나, 나머지는 소유자/관리자
-- --------------------------------------------------------------------------
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_workshops_select ON public.workshops FOR SELECT
  USING ((status = 'active' AND COALESCE(is_private, false) = false)
         OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_workshops_insert ON public.workshops FOR INSERT
  WITH CHECK (owner_id = auth.uid()
              AND public.app_role() IN ('super_admin', 'manager', 'instructor'));
CREATE POLICY afm_workshops_update ON public.workshops FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_workshops_delete ON public.workshops FOR DELETE
  USING (owner_id = auth.uid() OR public.is_admin());

-- --------------------------------------------------------------------------
-- 4. courses
-- --------------------------------------------------------------------------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_courses_select ON public.courses FOR SELECT
  USING (COALESCE(is_private, false) = false
         OR instructor_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_courses_insert ON public.courses FOR INSERT
  WITH CHECK (instructor_id = auth.uid()
              AND public.app_role() IN ('super_admin', 'manager', 'instructor'));
CREATE POLICY afm_courses_update ON public.courses FOR UPDATE
  USING (instructor_id = auth.uid() OR public.is_admin())
  WITH CHECK (instructor_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_courses_delete ON public.courses FOR DELETE
  USING (instructor_id = auth.uid() OR public.is_admin());

-- --------------------------------------------------------------------------
-- 5. bookings — 예약자 본인, 해당 강의 강사, 관리자
-- --------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_bookings_select ON public.bookings FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin()
         OR EXISTS (SELECT 1 FROM public.courses c
                    WHERE c.id = bookings.course_id AND c.instructor_id = auth.uid()));
CREATE POLICY afm_bookings_insert ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY afm_bookings_update ON public.bookings FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin()
         OR EXISTS (SELECT 1 FROM public.courses c
                    WHERE c.id = bookings.course_id AND c.instructor_id = auth.uid()));
CREATE POLICY afm_bookings_delete ON public.bookings FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- --------------------------------------------------------------------------
-- 6. reviews — 조회는 공개, 작성/수정/삭제는 본인 또는 관리자
-- --------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_reviews_select ON public.reviews FOR SELECT USING (true);
CREATE POLICY afm_reviews_insert ON public.reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY afm_reviews_update ON public.reviews FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_reviews_delete ON public.reviews FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- 평점/리뷰수는 이제 클라이언트가 workshops 를 직접 수정할 수 없으므로 트리거로 갱신
CREATE OR REPLACE FUNCTION public.refresh_workshop_rating()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE wid uuid;
BEGIN
  wid := COALESCE(NEW.workshop_id, OLD.workshop_id);
  UPDATE public.workshops w
  SET review_count = s.cnt,
      rating = COALESCE(ROUND(s.avg_rating::numeric, 1), 0)
  FROM (SELECT COUNT(*) AS cnt, AVG(rating) AS avg_rating
        FROM public.reviews WHERE workshop_id = wid) s
  WHERE w.id = wid;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_refresh_workshop_rating ON public.reviews;
CREATE TRIGGER trg_refresh_workshop_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_workshop_rating();

-- --------------------------------------------------------------------------
-- 7. inquiries — 문의 작성은 누구나(비로그인 포함), 조회/답변은 본인/관리자
-- --------------------------------------------------------------------------
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_inquiries_select ON public.inquiries FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_inquiries_insert ON public.inquiries FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY afm_inquiries_update ON public.inquiries FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY afm_inquiries_delete ON public.inquiries FOR DELETE
  USING (public.is_admin());

-- --------------------------------------------------------------------------
-- 8. flea_markets — 공개 조회, 등록/수정/삭제는 작성자(코디네이터)/관리자
-- --------------------------------------------------------------------------
ALTER TABLE public.flea_markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_flea_select ON public.flea_markets FOR SELECT USING (true);
CREATE POLICY afm_flea_insert ON public.flea_markets FOR INSERT
  WITH CHECK (creator_id = auth.uid()
              AND public.app_role() IN ('super_admin', 'manager', 'market_coordinator'));
CREATE POLICY afm_flea_update ON public.flea_markets FOR UPDATE
  USING (creator_id = auth.uid() OR public.is_admin())
  WITH CHECK (creator_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_flea_delete ON public.flea_markets FOR DELETE
  USING (creator_id = auth.uid() OR public.is_admin());

-- --------------------------------------------------------------------------
-- 9. notifications — 본인 것만 조회/수정. 생성은 로그인 사용자(예약 알림 등)
-- --------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_notifications_select ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_notifications_insert ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY afm_notifications_update ON public.notifications FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_notifications_delete ON public.notifications FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- --------------------------------------------------------------------------
-- 10. notices — 공개 조회, 관리자만 작성
-- --------------------------------------------------------------------------
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_notices_select ON public.notices FOR SELECT USING (true);
CREATE POLICY afm_notices_insert ON public.notices FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY afm_notices_update ON public.notices FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY afm_notices_delete ON public.notices FOR DELETE USING (public.is_admin());

-- --------------------------------------------------------------------------
-- 11. 분석 테이블 — 방문 기록은 누구나 INSERT, 조회는 관리자/해당 공방 소유자
-- --------------------------------------------------------------------------
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_page_views_insert ON public.page_views FOR INSERT
  WITH CHECK (char_length(visitor_id) <= 64 AND char_length(path) <= 300);
CREATE POLICY afm_page_views_select ON public.page_views FOR SELECT
  USING (public.is_admin()
         OR EXISTS (SELECT 1 FROM public.workshops w
                    WHERE w.id = page_views.workshop_id AND w.owner_id = auth.uid()));

ALTER TABLE public.workshop_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY afm_workshop_clicks_select ON public.workshop_clicks FOR SELECT
  USING (public.is_admin());

-- 클릭 카운터 RPC: workshops 직접 UPDATE 가 막혔으므로 SECURITY DEFINER 로 재정의
CREATE OR REPLACE FUNCTION public.increment_workshop_click(p_workshop_id uuid, p_link_type text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_link_type NOT IN ('website','instagram','youtube','share','nav','map_pin','list_item') THEN
    RETURN;
  END IF;

  INSERT INTO public.workshop_clicks (workshop_id, link_type) VALUES (p_workshop_id, p_link_type);

  UPDATE public.workshops SET
    website_clicks   = COALESCE(website_clicks, 0)   + (p_link_type = 'website')::int,
    instagram_clicks = COALESCE(instagram_clicks, 0) + (p_link_type = 'instagram')::int,
    youtube_clicks   = COALESCE(youtube_clicks, 0)   + (p_link_type = 'youtube')::int,
    share_clicks     = COALESCE(share_clicks, 0)     + (p_link_type = 'share')::int,
    nav_clicks       = COALESCE(nav_clicks, 0)       + (p_link_type = 'nav')::int,
    map_pin_clicks   = COALESCE(map_pin_clicks, 0)   + (p_link_type = 'map_pin')::int,
    list_clicks      = COALESCE(list_clicks, 0)      + (p_link_type = 'list_item')::int,
    total_clicks     = COALESCE(total_clicks, 0)
                       + (p_link_type IN ('website','instagram','youtube','share','nav'))::int
  WHERE id = p_workshop_id;
END $$;

CREATE OR REPLACE FUNCTION public.increment_application_clicks(market_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ UPDATE public.flea_markets SET application_clicks = COALESCE(application_clicks, 0) + 1 WHERE id = market_id $$;

GRANT EXECUTE ON FUNCTION public.increment_workshop_click(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_application_clicks(uuid) TO anon, authenticated;

-- --------------------------------------------------------------------------
-- 12. withdrawal_requests / role_requests
-- --------------------------------------------------------------------------
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_withdrawal_select ON public.withdrawal_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_withdrawal_insert ON public.withdrawal_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY afm_withdrawal_update ON public.withdrawal_requests FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY afm_withdrawal_delete ON public.withdrawal_requests FOR DELETE
  USING (public.is_admin());

-- role_requests: 가입 직후(이메일 인증 전이라 세션이 없을 수 있음)에도 요청은 넣을 수 있어야 한다.
-- 단 상태는 반드시 pending. 승인/반려/명함 갱신은 관리자만.
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY afm_role_requests_select ON public.role_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY afm_role_requests_insert ON public.role_requests FOR INSERT
  WITH CHECK (status = 'pending' AND (auth.uid() IS NULL OR user_id = auth.uid()));
CREATE POLICY afm_role_requests_update ON public.role_requests FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY afm_role_requests_delete ON public.role_requests FOR DELETE
  USING (public.is_admin());

-- ==========================================================================
-- ROLLBACK (문제가 생겨 급히 원복해야 할 때만 실행)
-- ==========================================================================
-- DO $$ DECLARE r record; BEGIN
--   FOR r IN SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'afm\_%' LOOP
--     EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
--   END LOOP;
--   FOR r IN SELECT unnest(ARRAY['users','workshops','courses','bookings','reviews','inquiries','flea_markets',
--     'notifications','notices','workshop_clicks','page_views','withdrawal_requests','role_requests']) AS t LOOP
--     EXECUTE format('CREATE POLICY "Enable all operations for all users" ON public.%I FOR ALL USING (true) WITH CHECK (true)', r.t);
--   END LOOP;
-- END $$;
