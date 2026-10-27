-- Keep is_admin() out of the public REST API. RLS policies still call it (they follow the
-- function by id, so they don't need rewriting).
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- The test order during setup used number 10001; start real orders there.
alter table public.orders alter column order_number restart with 10001;
