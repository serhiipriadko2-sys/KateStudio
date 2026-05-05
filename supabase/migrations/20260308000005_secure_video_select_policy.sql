-- Restrict video visibility to prevent locked content disclosure.
-- Public users can only read unlocked rows.
-- Locked rows require an active subscription or admin privileges.

DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON public.videos;

CREATE POLICY "Public can view unlocked videos"
  ON public.videos
  FOR SELECT
  USING (is_locked = false);

CREATE POLICY "Subscribers and admins can view locked videos"
  ON public.videos
  FOR SELECT
  USING (
    is_locked = true
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.subscriptions s
        WHERE s.user_id = auth.uid()
          AND s.status = 'active'
          AND (s.current_period_end IS NULL OR s.current_period_end > now())
      )
    )
  );
