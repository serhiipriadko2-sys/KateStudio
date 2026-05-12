-- Reset broad table grants for anon/authenticated and re-grant only application-required access.
-- Goal: reduce unnecessary GraphQL discoverability and privilege surface without breaking current client flows.
-- Expected effect: anon loses visibility into private/internal tables; authenticated keeps only the table operations the app/admin UI actually needs.
-- Reversibility: grants can be restored explicitly per table if a missed runtime path is discovered.

revoke all privileges on all tables in schema public from anon, authenticated;

-- Public content tables: readable by guests and signed-in users.
grant select on table
  public.classes,
  public.trainers,
  public.reviews,
  public.app_settings,
  public.faq_items,
  public.pricing_plans,
  public.articles,
  public.retreats,
  public.site_images,
  public.videos
to anon, authenticated;

-- Public submission surfaces.
grant insert on table public.contacts, public.analytics_events to anon, authenticated;

-- Authenticated user/private surfaces.
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.bookings to authenticated;
grant select, insert, update, delete on table public.subscriptions to authenticated;
grant select, insert, update on table public.practice_events to authenticated;
grant select, insert, update on table public.user_preferences to authenticated;
grant select, insert on table public.app_events to authenticated;
grant select, insert, update on table public.user_progress to authenticated;
grant select, insert, update on table public.user_achievements to authenticated;
grant select, insert, update, delete on table public.user_push_tokens to authenticated;

-- Admin and governed operational surfaces.
grant select on table public.admins to authenticated;
grant select, update, delete on table public.contacts to authenticated;
grant select on table public.analytics_events to authenticated;
grant select, insert, update, delete on table public.class_recurring_rules to authenticated;
grant select, insert, update, delete on table
  public.classes,
  public.trainers,
  public.reviews,
  public.app_settings,
  public.faq_items,
  public.pricing_plans,
  public.articles,
  public.retreats,
  public.site_images,
  public.videos
to authenticated;

-- Internal AI / logging / shadow surfaces: no direct client access.
revoke all privileges on table
  public.ai_jobs,
  public.api_logs,
  public.prompt_requests,
  public.embeddings,
  public.model_metadata,
  public.dialogue
from anon, authenticated;
