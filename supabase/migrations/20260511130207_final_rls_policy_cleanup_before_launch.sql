begin;

-- Keep a single admin self-check policy; authenticated already has the required table grant.
drop policy if exists "admin can read own row" on public.admins;

alter policy "service role manage retreats" on public.retreats
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

alter policy "Service role reads all tokens" on public.user_push_tokens
  using ((select auth.role()) = 'service_role');

alter policy "Users manage own push tokens" on public.user_push_tokens
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
