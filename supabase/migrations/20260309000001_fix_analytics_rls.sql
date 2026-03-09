-- Fix: analytics_events admin SELECT policy referenced wrong column.
-- The admins table uses `user_id` as PK, not `id`.
-- This caused admins to never be able to read analytics data.

DROP POLICY IF EXISTS "Allow admins to read analytics" ON public.analytics_events;

CREATE POLICY "Allow admins to read analytics"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid()
    )
  );
