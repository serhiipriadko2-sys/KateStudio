-- Harden analytics insert policy to prevent unauthenticated flooding.
-- Public clients can no longer write directly to analytics_events.

DROP POLICY IF EXISTS "Allow public insert to analytics" ON public.analytics_events;

CREATE POLICY "Allow authenticated insert to analytics"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    length(event_name) BETWEEN 1 AND 64
    AND octet_length(event_data::text) <= 4096
    AND length(coalesce(session_id, '')) <= 128
    AND length(coalesce(url, '')) <= 2048
    AND length(coalesce(user_agent, '')) <= 512
  );
