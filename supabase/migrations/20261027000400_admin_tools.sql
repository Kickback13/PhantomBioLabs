-- Admin area support.

-- Saves a product and its sizes in one transaction, so a failed size never leaves a half-saved
-- product. Runs as the caller (security invoker): row-level security still applies, and the
-- explicit check gives non-admins a clear error.
create or replace function public.admin_save_product(p_product jsonb, p_variants jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := nullif(p_product ->> 'id', '')::uuid;
  v_keep uuid[];
  v_row jsonb;
  v_vid uuid;
begin
  if not (select private.is_admin()) then
    raise exception 'Only admins can save products' using errcode = '42501';
  end if;
  if jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) = 0 then
    raise exception 'A product needs at least one size' using errcode = '22023';
  end if;

  if v_id is null then
    insert into public.products (slug, name, category_id, summary, description, status, featured_rank, sort_order)
    values (
      p_product ->> 'slug',
      p_product ->> 'name',
      nullif(p_product ->> 'category_id', '')::uuid,
      nullif(p_product ->> 'summary', ''),
      nullif(p_product ->> 'description', ''),
      coalesce(nullif(p_product ->> 'status', ''), 'active')::public.product_status,
      nullif(p_product ->> 'featured_rank', '')::int,
      coalesce((select max(p.sort_order) + 1 from public.products p), 0)
    )
    returning id into v_id;
  else
    -- When the URL changes, keep the old one so /product/<old> keeps redirecting.
    update public.products set
      legacy_slug = case when slug <> (p_product ->> 'slug') then slug else legacy_slug end,
      slug = p_product ->> 'slug',
      name = p_product ->> 'name',
      category_id = nullif(p_product ->> 'category_id', '')::uuid,
      summary = nullif(p_product ->> 'summary', ''),
      description = nullif(p_product ->> 'description', ''),
      status = coalesce(nullif(p_product ->> 'status', ''), 'active')::public.product_status,
      featured_rank = nullif(p_product ->> 'featured_rank', '')::int
    where id = v_id;
    if not found then
      raise exception 'Product not found' using errcode = '22023';
    end if;
  end if;

  -- Remove sizes that were deleted in the editor first, so their labels and SKUs can be reused.
  select coalesce(array_agg((r ->> 'id')::uuid), '{}')
    into v_keep
  from jsonb_array_elements(p_variants) r
  where nullif(r ->> 'id', '') is not null;
  delete from public.product_variants where product_id = v_id and not (id = any (v_keep));

  for v_row in select * from jsonb_array_elements(p_variants) loop
    v_vid := nullif(v_row ->> 'id', '')::uuid;
    if v_vid is null then
      insert into public.product_variants (product_id, label, sku, price_cents, compare_at_cents, in_stock, stock_quantity, active, sort_order)
      values (
        v_id,
        v_row ->> 'label',
        nullif(v_row ->> 'sku', ''),
        (v_row ->> 'price_cents')::int,
        nullif(v_row ->> 'compare_at_cents', '')::int,
        coalesce((v_row ->> 'in_stock')::boolean, true),
        nullif(v_row ->> 'stock_quantity', '')::int,
        coalesce((v_row ->> 'active')::boolean, true),
        coalesce((v_row ->> 'sort_order')::int, 0)
      );
    else
      update public.product_variants set
        label = v_row ->> 'label',
        sku = nullif(v_row ->> 'sku', ''),
        price_cents = (v_row ->> 'price_cents')::int,
        compare_at_cents = nullif(v_row ->> 'compare_at_cents', '')::int,
        in_stock = coalesce((v_row ->> 'in_stock')::boolean, true),
        stock_quantity = nullif(v_row ->> 'stock_quantity', '')::int,
        active = coalesce((v_row ->> 'active')::boolean, true),
        sort_order = coalesce((v_row ->> 'sort_order')::int, 0)
      where id = v_vid and product_id = v_id;
      if not found then
        raise exception 'Size not found on this product' using errcode = '22023';
      end if;
    end if;
  end loop;

  return v_id;
end;
$$;

revoke all on function public.admin_save_product(jsonb, jsonb) from public, anon;
grant execute on function public.admin_save_product(jsonb, jsonb) to authenticated;

-- Storage needs a read policy before admins can replace or delete files in the store buckets.
create policy "Admins read store files" on storage.objects for select to authenticated
  using (bucket_id in ('coas', 'product-images') and (select private.is_admin()));
