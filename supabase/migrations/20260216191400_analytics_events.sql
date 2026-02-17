-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  session_id text,
  url text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public analytics)
CREATE POLICY "Allow public insert to analytics"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to read analytics
CREATE POLICY "Allow admins to read analytics"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

-- Index for querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
