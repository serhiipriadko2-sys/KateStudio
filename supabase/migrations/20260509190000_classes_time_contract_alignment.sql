
-- Bridge migration: align classes.time contract before trainers rollout.
-- Live main already uses time without time zone for public.classes.time.
-- Older baseline/history paths still materialize it as text, which breaks trainers_phase1 comparisons.

alter table if exists public.classes
  alter column time type time without time zone
  using (
    case
      when time is null then null
      else time::time
    end
  );
