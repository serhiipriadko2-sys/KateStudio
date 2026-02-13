-- Secure Subscriptions Table
-- Remove insecure policies that allowed users to insert/update their own subscription status.
-- Updates should only be performed by Service Role (Edge Functions).

drop policy if exists "subscriptions_update_own" on public.subscriptions;
drop policy if exists "subscriptions_insert_own" on public.subscriptions;

-- Ensure "subscriptions_select_own" exists (it should be there from previous migrations, but good to be safe or leave it alone if I am not recreating it)
-- I will just drop the insecure ones.
