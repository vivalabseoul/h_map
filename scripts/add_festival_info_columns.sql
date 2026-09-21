-- Run once in the Supabase SQL editor before syncing festivals.
-- Venue, opening hours and organizer come from the Korea Tourism Organization API.
ALTER TABLE public.flea_markets
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS operating_hours TEXT,
  ADD COLUMN IF NOT EXISTS organizer TEXT;
