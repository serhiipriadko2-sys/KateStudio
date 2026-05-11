-- Ensure public review avatars are readable by the anonymous site client while
-- keeping review management behind the existing admin check.

grant usage on schema public to anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant insert, update, delete on table public.reviews to authenticated;

drop policy if exists "Enable read access for all users" on public.reviews;
create policy "Enable public read access for active reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (is_active is true);

drop policy if exists "Enable write access for admins" on public.reviews;
create policy "Enable admin write access for reviews"
  on public.reviews
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
