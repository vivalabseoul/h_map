-- 1. Create role_requests table
CREATE TABLE IF NOT EXISTS public.role_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL,
  business_card_url text,
  status text DEFAULT 'pending',
  reject_reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own requests
CREATE POLICY "Users can view own role requests" 
ON public.role_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can insert own role requests" 
ON public.role_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all
CREATE POLICY "Admins can view all role requests" 
ON public.role_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('super_admin', 'manager')
  )
);

-- Allow admins to update status
CREATE POLICY "Admins can update role requests" 
ON public.role_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('super_admin', 'manager')
  )
);

-- 2. Create Storage Bucket for Business Cards
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business_cards', 'business_cards', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Allow anyone to read (for admin dashboard, and public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business_cards');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business_cards' AND auth.role() = 'authenticated');
