-- Admin can view and manually manage user subscriptions
-- (e.g. grant Premium/VIP without payment)

-- Admin: read all subscriptions
create policy "admin read all subscriptions" on public.subscriptions
  for select using (public.is_admin());

-- Admin: update any subscription (plan, status, current_period_end)
create policy "admin update subscriptions" on public.subscriptions
  for update using (public.is_admin()) with check (public.is_admin());

-- Admin: insert subscription for a user (grant access manually)
create policy "admin insert subscriptions" on public.subscriptions
  for insert with check (public.is_admin());

-- Admin: delete subscription if needed
create policy "admin delete subscriptions" on public.subscriptions
  for delete using (public.is_admin());
