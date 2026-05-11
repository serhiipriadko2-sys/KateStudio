begin;

alter policy "authenticated can check admin status" on public.admins
  using (user_id = (select auth.uid()));

alter policy app_events_insert_own on public.app_events
  with check ((select auth.uid()) = user_id);
alter policy app_events_select_own on public.app_events
  using ((select auth.uid()) = user_id);

alter policy bookings_delete_own on public.bookings
  using ((select auth.uid()) = user_id);
alter policy bookings_insert_own on public.bookings
  with check ((select auth.uid()) = user_id);
alter policy bookings_select_own on public.bookings
  using ((select auth.uid()) = user_id);
alter policy bookings_update_own on public.bookings
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "service role manage classes" on public.classes
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

alter policy practice_events_delete_own on public.practice_events
  using ((select auth.uid()) = user_id);
alter policy practice_events_insert_own on public.practice_events
  with check ((select auth.uid()) = user_id);
alter policy practice_events_select_own on public.practice_events
  using ((select auth.uid()) = user_id);

alter policy profiles_insert_own on public.profiles
  with check ((select auth.uid()) = user_id);
alter policy profiles_select_own on public.profiles
  using ((select auth.uid()) = user_id);
alter policy profiles_update_own on public.profiles
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy subscriptions_select_own on public.subscriptions
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own achievements" on public.user_achievements
  with check ((select auth.uid()) = user_id);
alter policy "Users can update own achievements" on public.user_achievements
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "Users can view own achievements" on public.user_achievements
  using ((select auth.uid()) = user_id);

alter policy user_preferences_insert_own on public.user_preferences
  with check ((select auth.uid()) = user_id);
alter policy user_preferences_select_own on public.user_preferences
  using ((select auth.uid()) = user_id);
alter policy user_preferences_update_own on public.user_preferences
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can insert own progress" on public.user_progress
  with check ((select auth.uid()) = user_id);
alter policy "Users can update own progress" on public.user_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "Users can view own progress" on public.user_progress
  using ((select auth.uid()) = user_id);

commit;
