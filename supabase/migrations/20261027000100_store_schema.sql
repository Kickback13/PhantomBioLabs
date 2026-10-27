-- Phantom Bio Labs store schema: catalog, COAs, customers, wishlists, orders, settings.
-- Prices are stored in cents. Row-level security is on for every table.

create type public.product_status as enum ('active', 'hidden');
create type public.order_status as enum ('pending_payment', 'paid', 'processing', 'shipped', 'cancelled', 'refunded');

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- catalog
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  legacy_slug text unique,
  legacy_woo_id int,
  name text not null,
  category_id uuid references public.categories (id) on delete restrict,
  summary text,
  description text,
  specs jsonb not null default '{}'::jsonb,
  status public.product_status not null default 'active',
  featured_rank int,
  sort_order int not null default 0,
  image_path text,
  review_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  sku text unique,
  price_cents int not null check (price_cents >= 0),
  compare_at_cents int check (compare_at_cents is null or compare_at_cents > price_cents),
  in_stock boolean not null default true,
  stock_quantity int check (stock_quantity is null or stock_quantity >= 0),
  active boolean not null default true,
  sort_order int not null default 0,
  image_path text,
  legacy_woo_id int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, label)
);
create index product_variants_product_idx on public.product_variants (product_id);

-- Certificates of analysis: one PDF per product, optionally per size and lot.
create table public.coas (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  lot_number text not null,
  tested_on date,
  purity_percent numeric(5, 2) check (purity_percent is null or (purity_percent > 0 and purity_percent <= 100)),
  lab_name text not null default 'ISL Labs',
  file_path text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index coas_product_idx on public.coas (product_id);
create index coas_variant_idx on public.coas (variant_id);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- people
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emails listed here become admins when they sign up.
create table public.admin_emails (
  email text primary key check (email = lower(email))
);

create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index wishlist_items_product_idx on public.wishlist_items (product_id);

-- ---------------------------------------------------------------- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 10001) unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending_payment',
  subtotal_cents int not null check (subtotal_cents >= 0),
  shipping_cents int not null check (shipping_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  currency text not null default 'USD',
  shipping_address jsonb not null,
  shipping_method text not null default 'standard',
  customer_note text,
  research_use_confirmed boolean not null check (research_use_confirmed),
  age_confirmed boolean not null check (age_confirmed),
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text not null,
  sku text,
  unit_price_cents int not null check (unit_price_cents >= 0),
  quantity int not null check (quantity between 1 and 100),
  line_total_cents int not null check (line_total_cents >= 0)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);
create index order_items_variant_idx on public.order_items (variant_id);

-- ---------------------------------------------------------------- triggers
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger coas_updated_at before update on public.coas for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- auth helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    exists (select 1 from public.admin_emails a where a.email = lower(new.email))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- checkout
-- Creates an order from variant ids and quantities. Prices, stock and shipping are read from
-- the database, never from the browser. The order starts as 'pending_payment'.
create or replace function public.place_order(
  p_email text,
  p_items jsonb,
  p_shipping_address jsonb,
  p_shipping_method text default 'standard',
  p_customer_note text default null,
  p_research_use_confirmed boolean default false,
  p_age_confirmed boolean default false
)
returns table (order_id uuid, order_number bigint, total_cents int)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_order_id uuid;
  v_order_number bigint;
  v_subtotal int := 0;
  v_shipping int;
  v_threshold int;
  v_flat int;
  v_line record;
  v_count int;
begin
  if not coalesce(p_research_use_confirmed, false) or not coalesce(p_age_confirmed, false) then
    raise exception 'Research-use and age confirmations are required' using errcode = '22023';
  end if;
  if p_email is null or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid email is required' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Cart is empty or too large' using errcode = '22023';
  end if;
  if jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'Shipping address is required' using errcode = '22023';
  end if;

  -- Every requested line must match one active, in-stock size of an active product.
  select count(*) into v_count
  from jsonb_to_recordset(p_items) as i(variant_id uuid, quantity int)
  join public.product_variants v on v.id = i.variant_id and v.active and v.in_stock
  join public.products p on p.id = v.product_id and p.status = 'active'
  where i.quantity between 1 and 100;
  if v_count <> jsonb_array_length(p_items) then
    raise exception 'One or more items are unavailable' using errcode = '22023';
  end if;

  select coalesce(sum(v.price_cents * i.quantity), 0)::int into v_subtotal
  from jsonb_to_recordset(p_items) as i(variant_id uuid, quantity int)
  join public.product_variants v on v.id = i.variant_id;

  select coalesce((value #>> '{}')::int, 12500) into v_threshold from public.settings where key = 'free_shipping_threshold_cents';
  select coalesce((value #>> '{}')::int, 999) into v_flat from public.settings where key = 'flat_shipping_cents';
  v_threshold := coalesce(v_threshold, 12500);
  v_flat := coalesce(v_flat, 999);
  v_shipping := case when v_subtotal >= v_threshold then 0 else v_flat end;

  insert into public.orders (
    user_id, email, subtotal_cents, shipping_cents, total_cents, shipping_address,
    shipping_method, customer_note, research_use_confirmed, age_confirmed
  )
  values (
    auth.uid(), lower(p_email), v_subtotal, v_shipping, v_subtotal + v_shipping, p_shipping_address,
    coalesce(p_shipping_method, 'standard'), left(p_customer_note, 1000), true, true
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  for v_line in
    select v.id as variant_id, v.product_id, p.name, v.label, v.sku, v.price_cents, i.quantity
    from jsonb_to_recordset(p_items) as i(variant_id uuid, quantity int)
    join public.product_variants v on v.id = i.variant_id
    join public.products p on p.id = v.product_id
  loop
    insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, sku, unit_price_cents, quantity, line_total_cents)
    values (v_order_id, v_line.product_id, v_line.variant_id, v_line.name, v_line.label, v_line.sku, v_line.price_cents, v_line.quantity, v_line.price_cents * v_line.quantity);
  end loop;

  return query select v_order_id, v_order_number, v_subtotal + v_shipping;
end;
$$;

revoke all on function public.place_order(text, jsonb, jsonb, text, text, boolean, boolean) from public;
grant execute on function public.place_order(text, jsonb, jsonb, text, text, boolean, boolean) to anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------- row-level security
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.coas enable row level security;
alter table public.settings enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_emails enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Catalog: anyone can read what's live; admins can read and change everything.
create policy "Public reads categories" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public reads active products" on public.products for select using (status = 'active' or (select public.is_admin()));
create policy "Admins manage products" on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public reads active sizes" on public.product_variants for select using (
  (active and exists (select 1 from public.products p where p.id = product_id and p.status = 'active'))
  or (select public.is_admin())
);
create policy "Admins manage sizes" on public.product_variants for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public reads published COAs" on public.coas for select using (published or (select public.is_admin()));
create policy "Admins manage COAs" on public.coas for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public reads settings" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Profiles: people see and edit their own name; is_admin can't be changed through the API.
create policy "Users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Users update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Admins read admin emails" on public.admin_emails for select to authenticated using ((select public.is_admin()));

create policy "Users read own wishlist" on public.wishlist_items for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add to own wishlist" on public.wishlist_items for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users remove from own wishlist" on public.wishlist_items for delete to authenticated using (user_id = (select auth.uid()));

-- Orders are created only through place_order(). Customers read their own; admins read and update all.
create policy "Users read own orders" on public.orders for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admins update orders" on public.orders for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Users read own order items" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin())))
);

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('coas', 'coas', true, 20971520, array['application/pdf']),
  ('product-images', 'product-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "Admins upload store files" on storage.objects for insert to authenticated
  with check (bucket_id in ('coas', 'product-images') and (select public.is_admin()));
create policy "Admins update store files" on storage.objects for update to authenticated
  using (bucket_id in ('coas', 'product-images') and (select public.is_admin()));
create policy "Admins delete store files" on storage.objects for delete to authenticated
  using (bucket_id in ('coas', 'product-images') and (select public.is_admin()));
