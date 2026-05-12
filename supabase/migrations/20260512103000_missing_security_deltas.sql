begin;

-- The live app is using REST endpoints and current API logs show no GraphQL traffic.
-- Disable pg_graphql to remove schema introspection exposure for anon/authenticated.
drop extension if exists pg_graphql;

-- Keep extension-owned objects out of the public API surface.
do $$
begin
  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'vector'
      and n.nspname <> 'extensions'
  ) then
    alter extension vector set schema extensions;
  end if;
end
$$;

commit;
