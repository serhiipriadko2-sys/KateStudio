-- Harden RPC execute grants for book_class_with_access.
-- Keep signed-in booking flow available, but close PUBLIC/anon inheritance.

revoke execute on function public.book_class_with_access(text, text, date, text, text, bigint) from public;
grant execute on function public.book_class_with_access(text, text, date, text, text, bigint) to authenticated;
revoke execute on function public.book_class_with_access(text, text, date, text, text, bigint) from anon;
