-- ==========================================
-- Handmade Map Supabase Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT DEFAULT 'member' NOT NULL,
  preferred_locale TEXT DEFAULT 'ko',
  bio TEXT,
  disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workshops Table
CREATE TABLE public.workshops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_name TEXT,
  name JSONB NOT NULL,
  category TEXT NOT NULL,
  description JSONB NOT NULL,
  address JSONB NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  images TEXT[] DEFAULT '{}',
  rating FLOAT8 DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  sns_links JSONB,
  region TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  instagram_clicks INTEGER DEFAULT 0,
  youtube_clicks INTEGER DEFAULT 0,
  share_clicks INTEGER DEFAULT 0,
  nav_clicks INTEGER DEFAULT 0,
  map_pin_clicks INTEGER DEFAULT 0,
  list_clicks INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Courses Table
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  instructor_name TEXT,
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  price TEXT NOT NULL,
  price_krw NUMERIC,
  price_usd NUMERIC,
  duration TEXT NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  available_days INTEGER[] DEFAULT '{}',
  available_times TEXT[] DEFAULT '{}',
  image_url TEXT,
  external_link TEXT,
  auto_approve BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_phone TEXT,
  status TEXT DEFAULT 'pending',
  selected_date TEXT NOT NULL,
  selected_time TEXT NOT NULL,
  participants INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_photo TEXT,
  rating FLOAT8 NOT NULL,
  text TEXT NOT NULL,
  locale TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Inquiries Table
CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Flea Markets Table
CREATE TABLE public.flea_markets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  creator_name TEXT,
  name JSONB NOT NULL,
  date TEXT NOT NULL,
  address JSONB NOT NULL,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  admission_fee TEXT,
  poster_url TEXT,
  images TEXT[] DEFAULT '{}',
  description JSONB NOT NULL,
  phone TEXT,
  website TEXT,
  instagram TEXT,
  youtube TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notices Table
CREATE TABLE public.notices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RLS (Row Level Security) Setup
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flea_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Note: For a rapid prototyping environment, we will allow all operations. 
-- In production, you MUST restrict these policies based on auth.uid() and role.
CREATE POLICY "Enable all operations for all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.workshops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.flea_markets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON public.notices FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Auth Trigger (Sync auth.users to public.users)
-- ==========================================
-- Creates a new row in public.users whenever a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url, role, disabled)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    'member',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 10. Workshop Clicks Table (Analytics)
-- ==========================================
CREATE TABLE public.workshop_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workshop_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users" ON public.workshop_clicks FOR ALL USING (true) WITH CHECK (true);

-- RPC for incrementing link clicks
CREATE OR REPLACE FUNCTION increment_workshop_click(p_workshop_id UUID, p_link_type TEXT)
RETURNS void AS $$
BEGIN
  -- Insert the click event
  INSERT INTO public.workshop_clicks (workshop_id, link_type)
  VALUES (p_workshop_id, p_link_type);

  -- Update specific columns based on p_link_type
  IF p_link_type = 'website' THEN
    UPDATE public.workshops SET website_clicks = COALESCE(website_clicks, 0) + 1, total_clicks = COALESCE(total_clicks, 0) + 1 WHERE id = p_workshop_id;
  ELSIF p_link_type = 'instagram' THEN
    UPDATE public.workshops SET instagram_clicks = COALESCE(instagram_clicks, 0) + 1, total_clicks = COALESCE(total_clicks, 0) + 1 WHERE id = p_workshop_id;
  ELSIF p_link_type = 'youtube' THEN
    UPDATE public.workshops SET youtube_clicks = COALESCE(youtube_clicks, 0) + 1, total_clicks = COALESCE(total_clicks, 0) + 1 WHERE id = p_workshop_id;
  ELSIF p_link_type = 'share' THEN
    UPDATE public.workshops SET share_clicks = COALESCE(share_clicks, 0) + 1, total_clicks = COALESCE(total_clicks, 0) + 1 WHERE id = p_workshop_id;
  ELSIF p_link_type = 'nav' THEN
    UPDATE public.workshops SET nav_clicks = COALESCE(nav_clicks, 0) + 1, total_clicks = COALESCE(total_clicks, 0) + 1 WHERE id = p_workshop_id;
  ELSIF p_link_type = 'map_pin' THEN
    UPDATE public.workshops SET map_pin_clicks = COALESCE(map_pin_clicks, 0) + 1 WHERE id = p_workshop_id;
  ELSIF p_link_type = 'list_item' THEN
    UPDATE public.workshops SET list_clicks = COALESCE(list_clicks, 0) + 1 WHERE id = p_workshop_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
