-- Decisions from the launch review (27 Oct 2026).

-- Proper compound names and clean URLs. Old URLs are kept in legacy_slug and redirect.
update public.products set name = 'Tirzepatide' where slug = 'tirzepatide';
update public.products set slug = 'retatrutide', legacy_slug = 'glp-3-rt', name = 'Retatrutide' where slug = 'glp-3-rt';
update public.products set slug = 'semaglutide', legacy_slug = 'semaglutide-glp-1', name = 'Semaglutide' where slug = 'semaglutide-glp-1';
update public.product_variants set sku = replace(sku, 'PBL-GLP3RT-', 'PBL-RETATRUTIDE-') where sku like 'PBL-GLP3RT-%';

-- Every import flag was reviewed and approved.
update public.products set review_flags = '{}' where review_flags <> '{}';

-- More than one lab tests the lots, so a COA records its own lab and there's no default.
alter table public.coas alter column lab_name drop default;
alter table public.coas alter column lab_name drop not null;
