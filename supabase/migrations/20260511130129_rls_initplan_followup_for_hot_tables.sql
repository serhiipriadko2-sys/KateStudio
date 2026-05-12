begin;

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admins'
      and policyname = 'authenticated can check admin status'
  ) then
    execute $policy$
      alter policy "authenticated can check admin status" on public.admins
        using (user_id = (select auth.uid()))
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'app_events'
      and policyname = 'app_events_insert_own'
  ) then
    execute $policy$
      alter policy app_events_insert_own on public.app_events
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'app_events'
      and policyname = 'app_events_select_own'
  ) then
    execute $policy$
      alter policy app_events_select_own on public.app_events
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_delete_own'
  ) then
    execute $policy$
      alter policy bookings_delete_own on public.bookings
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_insert_own'
  ) then
    execute $policy$
      alter policy bookings_insert_own on public.bookings
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_select_own'
  ) then
    execute $policy$
      alter policy bookings_select_own on public.bookings
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_update_own'
  ) then
    execute $policy$
      alter policy bookings_update_own on public.bookings
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'classes'
      and policyname = 'service role manage classes'
  ) then
    execute $policy$
      alter policy "service role manage classes" on public.classes
        using ((select auth.role()) = 'service_role')
        with check ((select auth.role()) = 'service_role')
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'practice_events'
      and policyname = 'practice_events_delete_own'
  ) then
    execute $policy$
      alter policy practice_events_delete_own on public.practice_events
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'practice_events'
      and policyname = 'practice_events_insert_own'
  ) then
    execute $policy$
      alter policy practice_events_insert_own on public.practice_events
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'practice_events'
      and policyname = 'practice_events_select_own'
  ) then
    execute $policy$
      alter policy practice_events_select_own on public.practice_events
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_insert_own'
  ) then
    execute $policy$
      alter policy profiles_insert_own on public.profiles
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_select_own'
  ) then
    execute $policy$
      alter policy profiles_select_own on public.profiles
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_update_own'
  ) then
    execute $policy$
      alter policy profiles_update_own on public.profiles
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'subscriptions_select_own'
  ) then
    execute $policy$
      alter policy subscriptions_select_own on public.subscriptions
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_achievements'
      and policyname = 'Users can insert own achievements'
  ) then
    execute $policy$
      alter policy "Users can insert own achievements" on public.user_achievements
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_achievements'
      and policyname = 'Users can update own achievements'
  ) then
    execute $policy$
      alter policy "Users can update own achievements" on public.user_achievements
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_achievements'
      and policyname = 'Users can view own achievements'
  ) then
    execute $policy$
      alter policy "Users can view own achievements" on public.user_achievements
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'user_preferences_insert_own'
  ) then
    execute $policy$
      alter policy user_preferences_insert_own on public.user_preferences
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'user_preferences_select_own'
  ) then
    execute $policy$
      alter policy user_preferences_select_own on public.user_preferences
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_preferences'
      and policyname = 'user_preferences_update_own'
  ) then
    execute $policy$
      alter policy user_preferences_update_own on public.user_preferences
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_progress'
      and policyname = 'Users can insert own progress'
  ) then
    execute $policy$
      alter policy "Users can insert own progress" on public.user_progress
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_progress'
      and policyname = 'Users can update own progress'
  ) then
    execute $policy$
      alter policy "Users can update own progress" on public.user_progress
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id)
    $policy$;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_progress'
      and policyname = 'Users can view own progress'
  ) then
    execute $policy$
      alter policy "Users can view own progress" on public.user_progress
        using ((select auth.uid()) = user_id)
    $policy$;
  end if;
end
$$;

commit;
