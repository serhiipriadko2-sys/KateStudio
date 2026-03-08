-- Secure Gamification: move XP and streak calculations to server-side RPC
-- This prevents client-side data tampering by removing broad UPDATE access.

-- Drop insecure policies that allow clients to write arbitrary values
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;

-- Secure initialization policy: clients may only INSERT a fresh row with all
-- default/zero values. Subsequent writes must go through the RPC.
CREATE POLICY "Users can initialize own progress"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND total_xp = 0
    AND level = 1
    AND current_streak = 0
    AND max_streak = 0
  );

-- RPC: process_practice_completion
-- Runs as SECURITY DEFINER so it can bypass RLS and update user_progress
-- atomically, preventing race conditions and client-side tampering.
CREATE OR REPLACE FUNCTION public.process_practice_completion()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid;
  v_progress  public.user_progress%ROWTYPE;
  v_today     date := CURRENT_DATE;
  v_yesterday date := CURRENT_DATE - INTERVAL '1 day';
  v_new_streak   integer;
  v_new_max      integer;
  v_new_xp       integer;
  v_new_level    integer;
BEGIN
  -- Identify the calling user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch (or initialise) the user's progress row
  SELECT * INTO v_progress
  FROM public.user_progress
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_progress (user_id, current_streak, max_streak, total_xp, level)
    VALUES (v_user_id, 0, 0, 0, 1)
    RETURNING * INTO v_progress;
  END IF;

  -- Streak logic
  IF v_progress.last_activity_date = v_today THEN
    -- Already processed today — return current state without changes
    RETURN jsonb_build_object(
      'total_xp',       v_progress.total_xp,
      'level',          v_progress.level,
      'current_streak', v_progress.current_streak,
      'max_streak',     v_progress.max_streak
    );
  ELSIF v_progress.last_activity_date = v_yesterday THEN
    v_new_streak := v_progress.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_new_max := GREATEST(v_new_streak, v_progress.max_streak);

  -- XP and level
  v_new_xp    := v_progress.total_xp + 10;
  v_new_level := v_new_xp / 100 + 1;

  -- Persist
  UPDATE public.user_progress
  SET
    current_streak    = v_new_streak,
    max_streak        = v_new_max,
    last_activity_date = v_today,
    total_xp          = v_new_xp,
    level             = v_new_level,
    updated_at        = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'total_xp',       v_new_xp,
    'level',          v_new_level,
    'current_streak', v_new_streak,
    'max_streak',     v_new_max
  );
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.process_practice_completion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_practice_completion() TO authenticated;
