-- ═══════════════════════════════════════════════════════════════════════
-- RECEIPTO — MASTER SCHEMA (run this once in the Supabase SQL editor)
-- ═══════════════════════════════════════════════════════════════════════
-- This single file sets up the entire Receipto database: extensions, tables,
-- row-level security, private storage, and the write paths (RPCs).
--
-- HOW TO USE
--   1. Create a Supabase project (cloud) or start the local CLI stack.
--   2. Open the SQL editor (cloud dashboard, or http://127.0.0.1:54323 locally).
--   3. Paste this whole file and run it. Run it exactly once on a fresh DB.
--
-- WHAT IT CREATES
--   • Extensions: pg_trgm (full-text) + vector (embeddings, 512-d)
--   • Tables: vendors, products, receipts, receipt_items, damaged_items,
--     budgets, user_settings, inventory_movements, receipt_chunks,
--     ai_settings, ai_usage
--   • View: inventory_stock (derived stock per product)
--   • RLS on every user table + storage bucket policies (per-user folders)
--   • RPCs: confirm_receipt (auto-registers products), report_damage,
--     adjust_stock, hybrid_search
--
-- DESIGN RULES (see docs/DATABASE.md)
--   Money is numeric(14,2). Dates are date. JSONB only for raw AI debug.
--   No secrets stored client-side. AI is opt-in; keys never hit the DB.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists pg_trgm with schema extensions;
create extension if not exists vector with schema extensions;

-- ─────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────

-- vendors: normalizes the most-queried field
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- products: inventory catalog built from confirmed receipts
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  normalized_name text not null,
  default_unit text not null default 'pc',
  category text,
  sku text,
  low_stock_threshold numeric(12, 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_name)
);

-- receipts: flat, typed columns. No JSONB payload as source of truth.
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vendor_id uuid references public.vendors (id) on delete set null,
  vendor_name text not null default 'Unknown',
  receipt_date date,
  total numeric(14, 2) not null default 0,
  tax numeric(14, 2),
  currency text not null default 'DZD',
  document_type text,
  payment_method text,
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'failed')),
  parse_method text check (parse_method in ('manual', 'ocr', 'ai')),
  ocr_text text,
  ai_raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- receipt_items: first-class table, links to products for inventory
create table public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  quantity numeric(12, 3) not null default 1,
  unit_price numeric(14, 2) not null default 0,
  damaged_quantity numeric(12, 3) not null default 0 check (damaged_quantity >= 0),
  damage_notes text,
  product_id uuid references public.products (id) on delete set null,
  tracked boolean not null default true,
  created_at timestamptz not null default now()
);

-- damaged_items: refund documentation (supplier comes from the receipt vendor)
create table public.damaged_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  receipt_item_id uuid references public.receipt_items (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_description text not null,
  original_quantity numeric(12, 3) not null default 0,
  actual_quantity numeric(12, 3) not null default 0,
  damaged_quantity numeric(12, 3) not null default 0 check (damaged_quantity >= 0),
  damage_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- budgets: one amount per month
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'DZD',
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

-- user_settings: profile-level only
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  currency text not null default 'DZD',
  date_format text not null default 'DD/MM/YYYY',
  locale text not null default 'ar' check (locale in ('ar', 'fr', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- inventory_movements: append-only ledger. Stock is always sum(delta).
create table public.inventory_movements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  delta numeric(12, 3) not null check (delta != 0),
  reason text not null
    check (reason in ('purchase', 'damage', 'manual_in', 'manual_out', 'correction')),
  receipt_id uuid references public.receipts (id) on delete cascade,
  receipt_item_id uuid references public.receipt_items (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- receipt_chunks: hybrid search (full-text + pgvector embeddings)
create table public.receipt_chunks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  content text not null,
  fts tsvector generated always as (to_tsvector('simple', content)) stored,
  embedding extensions.vector(512),
  created_at timestamptz not null default now()
);

-- ai_settings: per-user AI provider config (non-secret only; keys never stored)
create table public.ai_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  provider text not null default 'gemini' check (provider in ('gemini', 'openai_compatible')),
  base_url text,
  chat_model text,
  vision_model text,
  embedding_model text,
  tools_supported boolean not null default true,
  vision_supported boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ai_usage: rate/quota tracking for optional AI features
create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  feature text not null check (feature in ('parse', 'chat', 'report')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. DERIVED VIEW
-- ─────────────────────────────────────────────
create view public.inventory_stock
with (security_invoker = true) as
select
  p.id as product_id,
  p.user_id,
  p.name,
  p.default_unit,
  p.low_stock_threshold,
  coalesce(sum(m.delta), 0) as quantity
from public.products p
left join public.inventory_movements m on m.product_id = p.id
group by p.id;

-- ─────────────────────────────────────────────
-- 4. UPDATED_AT MAINTENANCE
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_receipts_updated_at
  before update on public.receipts
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_damaged_items_updated_at
  before update on public.damaged_items
  for each row execute function public.set_updated_at();

create trigger trg_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

create trigger trg_ai_settings_updated_at
  before update on public.ai_settings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- 5. INDEXES (targeted, per access patterns)
-- ─────────────────────────────────────────────
create index receipts_user_date_idx on public.receipts (user_id, receipt_date desc);
create index receipts_vendor_idx on public.receipts (user_id, vendor_id);
create index receipts_status_idx on public.receipts (user_id, status);
create index receipt_items_receipt_idx on public.receipt_items (receipt_id);
create index receipt_items_user_idx on public.receipt_items (user_id);
create index receipt_items_product_idx on public.receipt_items (product_id);
create index damaged_items_user_idx on public.damaged_items (user_id);
create index damaged_items_receipt_idx on public.damaged_items (receipt_id);
create index budgets_user_month_idx on public.budgets (user_id, month desc);
create index inv_mov_product_idx on public.inventory_movements (product_id, created_at);
create index inv_mov_user_idx on public.inventory_movements (user_id, created_at desc);
create index ai_usage_user_idx on public.ai_usage (user_id, created_at desc);
create index receipt_chunks_user_idx on public.receipt_chunks (user_id, receipt_id);
create index receipt_chunks_fts_idx on public.receipt_chunks using gin (fts);
create index receipt_chunks_embedding_idx on public.receipt_chunks
  using hnsw (embedding extensions.vector_ip_ops);

-- Covering indexes for foreign keys. Postgres does not index FK columns
-- automatically, so without these a cascade delete or an "on delete set null"
-- must scan the whole child table.
-- (Supabase advisor: unindexed_foreign_keys.)
create index receipts_vendor_fk_idx on public.receipts (vendor_id);
create index damaged_items_receipt_item_idx on public.damaged_items (receipt_item_id);
create index inv_mov_receipt_idx on public.inventory_movements (receipt_id);
create index inv_mov_receipt_item_idx on public.inventory_movements (receipt_item_id);
create index receipt_chunks_receipt_idx on public.receipt_chunks (receipt_id);

-- ─────────────────────────────────────────────
-- 6. ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────
-- Every user table: authenticated only, auth.uid() = user_id.
-- Pattern per table: select/insert/update/delete_own.
--
-- IMPORTANT: table privileges must be granted explicitly. Creating tables via
-- schema.sql (after the project is provisioned) means Supabase's default
-- grants are not applied to them; without these GRANTs the REST API returns
-- 42501 (permission denied) even with correct RLS policies.

grant select, insert, update, delete on table
  public.vendors,
  public.products,
  public.receipts,
  public.receipt_items,
  public.damaged_items,
  public.budgets,
  public.user_settings,
  public.inventory_movements,
  public.receipt_chunks,
  public.ai_settings,
  public.ai_usage
to authenticated;

-- The derived stock view is read-only: grant SELECT only.
grant select on table public.inventory_stock to authenticated;

grant usage on schema public to authenticated;

alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_items enable row level security;
alter table public.damaged_items enable row level security;
alter table public.budgets enable row level security;
alter table public.user_settings enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ai_usage enable row level security;
alter table public.receipt_chunks enable row level security;

do $$
declare
  t text;
  tables text[] := array[
    'vendors', 'products', 'receipts', 'receipt_items', 'damaged_items',
    'budgets', 'inventory_movements', 'ai_usage', 'receipt_chunks'
  ];
begin
  foreach t in array tables loop
    execute format('create policy "select_own" on public.%I for select to authenticated using ((select auth.uid()) = user_id);', t);
    execute format('create policy "insert_own" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id);', t);
    execute format('create policy "update_own" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);', t);
    execute format('create policy "delete_own" on public.%I for delete to authenticated using ((select auth.uid()) = user_id);', t);
  end loop;
end $$;

-- user_settings and ai_settings use user_id as primary key
do $$
begin
  execute 'create policy "select_own" on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);';
  execute 'create policy "insert_own" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);';
  execute 'create policy "update_own" on public.user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);';
  execute 'create policy "delete_own" on public.user_settings for delete to authenticated using ((select auth.uid()) = user_id);';

  execute 'create policy "select_own" on public.ai_settings for select to authenticated using ((select auth.uid()) = user_id);';
  execute 'create policy "insert_own" on public.ai_settings for insert to authenticated with check ((select auth.uid()) = user_id);';
  execute 'create policy "update_own" on public.ai_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);';
  execute 'create policy "delete_own" on public.ai_settings for delete to authenticated using ((select auth.uid()) = user_id);';
end $$;

-- ─────────────────────────────────────────────
-- 7. STORAGE (private receipts bucket, per-user folders)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('receipts', 'receipts', false, 10485760) -- 10MB
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

create policy "receipts_select_own_folder"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "receipts_insert_own_folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "receipts_update_own_folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "receipts_delete_own_folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ─────────────────────────────────────────────
-- 8. WRITE PATHS (RPCs)
-- ─────────────────────────────────────────────
-- All run as security definer but derive and verify the caller from auth.uid().
-- RLS still applies to every table touched inside.

-- confirm_receipt: one atomic call inserts vendor, receipt, items, auto-registers
-- products into inventory, writes purchase movements, and indexes the content
-- for hybrid search. Called from the Review screen after the user confirms.
create or replace function public.confirm_receipt(
  p_vendor_name text,
  p_receipt_date date default null,
  p_total numeric default 0,
  p_tax numeric default null,
  p_currency text default 'DZD',
  p_document_type text default null,
  p_payment_method text default null,
  p_image_path text default null,
  p_ocr_text text default null,
  p_parse_method text default 'manual',
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_vendor_id uuid;
  v_receipt_id uuid;
  v_item jsonb;
  v_item_id uuid;
  v_product_id uuid;
  v_item_name text;
  v_normalized text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.vendors (user_id, name)
  values (v_user_id, coalesce(nullif(p_vendor_name, ''), 'Unknown'))
  on conflict (user_id, name) do update set name = excluded.name
  returning id into v_vendor_id;

  insert into public.receipts (
    user_id, vendor_id, vendor_name, receipt_date, total, tax, currency,
    document_type, payment_method, image_path, ocr_text, parse_method, status
  )
  values (
    v_user_id, v_vendor_id, coalesce(nullif(p_vendor_name, ''), 'Unknown'),
    p_receipt_date, p_total, p_tax, p_currency, p_document_type,
    p_payment_method, p_image_path, p_ocr_text, p_parse_method, 'confirmed'
  )
  returning id into v_receipt_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_name := nullif(trim(coalesce(v_item->>'description', '')), '');
    v_normalized := lower(v_item_name);

    if v_normalized is not null then
      -- Auto-register the product if this item is tracked and not already linked.
      if coalesce((v_item->>'tracked')::boolean, true) then
        if nullif(v_item->>'product_id', '') is null then
          select p.id into v_product_id
          from public.products p
          where p.user_id = v_user_id and p.normalized_name = v_normalized
          limit 1;

          if v_product_id is null then
            insert into public.products (user_id, name, normalized_name, default_unit)
            values (v_user_id, v_item_name, v_normalized, 'pc')
            returning id into v_product_id;
          end if;
        else
          v_product_id := nullif(v_item->>'product_id', '')::uuid;
        end if;
      else
        v_product_id := null;
      end if;
    else
      v_product_id := null;
    end if;

    insert into public.receipt_items (
      receipt_id, user_id, description, quantity, unit_price, product_id, tracked
    )
    values (
      v_receipt_id,
      v_user_id,
      v_item->>'description',
      coalesce((v_item->>'quantity')::numeric, 1),
      coalesce((v_item->>'unit_price')::numeric, 0),
      v_product_id,
      coalesce((v_item->>'tracked')::boolean, true)
    )
    returning id into v_item_id;

    -- Always write the purchase movement when a product is known and tracked.
    if v_product_id is not null then
      insert into public.inventory_movements (
        user_id, product_id, delta, reason, receipt_id, receipt_item_id
      )
      values (
        v_user_id,
        v_product_id,
        coalesce((v_item->>'quantity')::numeric, 1),
        'purchase',
        v_receipt_id,
        v_item_id
      );
    end if;
  end loop;

  -- Content chunk for hybrid search (embedding backfilled client-side)
  insert into public.receipt_chunks (user_id, receipt_id, content)
  select v_user_id, v_receipt_id,
    coalesce(nullif(p_vendor_name, ''), 'Unknown') || ' | ' ||
    coalesce(p_receipt_date::text, '') || ' | ' ||
    coalesce((select string_agg(e->>'description', ' ; ') from jsonb_array_elements(p_items) e), '');

  return v_receipt_id;
end;
$$;

-- report_damage: updates the item, writes the refund-documentation row, and
-- posts a damage movement that lowers usable stock.
create or replace function public.report_damage(
  p_receipt_id uuid,
  p_receipt_item_id uuid,
  p_damaged_quantity numeric,
  p_damage_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item record;
  v_damaged_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_item
  from public.receipt_items
  where id = p_receipt_item_id
    and receipt_id = p_receipt_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Receipt item not found';
  end if;

  if p_damaged_quantity <= 0 or p_damaged_quantity > v_item.quantity then
    raise exception 'Invalid damaged quantity';
  end if;

  update public.receipt_items
  set damaged_quantity = damaged_quantity + p_damaged_quantity,
      damage_notes = coalesce(p_damage_notes, damage_notes)
  where id = p_receipt_item_id;

  insert into public.damaged_items (
    receipt_id, receipt_item_id, user_id, item_description,
    original_quantity, actual_quantity, damaged_quantity, damage_notes
  )
  values (
    p_receipt_id, p_receipt_item_id, v_user_id, v_item.description,
    v_item.quantity, v_item.quantity - p_damaged_quantity,
    p_damaged_quantity, p_damage_notes
  )
  returning id into v_damaged_id;

  if v_item.product_id is not null then
    insert into public.inventory_movements (
      user_id, product_id, delta, reason, receipt_id, receipt_item_id, note
    )
    values (
      v_user_id, v_item.product_id, -p_damaged_quantity,
      'damage', p_receipt_id, p_receipt_item_id, p_damage_notes
    );
  end if;

  return v_damaged_id;
end;
$$;

-- adjust_stock: manual stock corrections from the Inventory page.
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_delta numeric,
  p_reason text,
  p_note text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_movement_id bigint;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_reason not in ('manual_in', 'manual_out', 'correction') then
    raise exception 'Invalid adjustment reason';
  end if;

  if not exists (
    select 1 from public.products
    where id = p_product_id and user_id = v_user_id
  ) then
    raise exception 'Product not found';
  end if;

  insert into public.inventory_movements (user_id, product_id, delta, reason, note)
  values (v_user_id, p_product_id, p_delta, p_reason, p_note)
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

-- hybrid_search: Reciprocal Ranked Fusion over full-text + semantic results.
-- User-scoped via auth.uid(); embedding matches ignore NULL embeddings so the
-- keyword path still works before embeddings are backfilled.
create or replace function public.hybrid_search(
  p_query_text text,
  p_query_embedding extensions.vector,
  p_match_count int default 10,
  p_full_text_weight float default 1,
  p_semantic_weight float default 1,
  p_rrf_k int default 50
)
returns table (
  id bigint,
  user_id uuid,
  receipt_id uuid,
  content text,
  created_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
with full_text as (
  select
    rc.id,
    row_number() over (order by ts_rank_cd(rc.fts, websearch_to_tsquery('simple', p_query_text)) desc) as rank_ix
  from public.receipt_chunks rc
  where rc.user_id = auth.uid()
    and rc.fts @@ websearch_to_tsquery('simple', p_query_text)
  limit least(p_match_count, 30) * 2
),
semantic as (
  select
    rc.id,
    row_number() over (order by rc.embedding <#> p_query_embedding) as rank_ix
  from public.receipt_chunks rc
  where rc.user_id = auth.uid()
    and rc.embedding is not null
  order by rank_ix
  limit least(p_match_count, 30) * 2
)
select
  rc.id,
  rc.user_id,
  rc.receipt_id,
  rc.content,
  rc.created_at
from full_text
full outer join semantic on full_text.id = semantic.id
join public.receipt_chunks rc on coalesce(full_text.id, semantic.id) = rc.id
order by
  coalesce(1.0 / (p_rrf_k + full_text.rank_ix), 0.0) * p_full_text_weight +
  coalesce(1.0 / (p_rrf_k + semantic.rank_ix), 0.0) * p_semantic_weight
  desc
limit least(p_match_count, 30);
$$;

-- ─────────────────────────────────────────────
-- 9. RPC PERMISSIONS (authenticated only)
-- ─────────────────────────────────────────────
revoke execute on function public.confirm_receipt(text, date, numeric, numeric, text, text, text, text, text, text, jsonb) from public, anon, service_role;
revoke execute on function public.report_damage(uuid, uuid, numeric, text) from public, anon, service_role;
revoke execute on function public.adjust_stock(uuid, numeric, text, text) from public, anon, service_role;
revoke execute on function public.hybrid_search(text, extensions.vector, int, float, float, int) from public, anon, service_role;

-- Supabase ships a public SECURITY DEFINER helper (rls_auto_enable) that is
-- exposed over the API on some projects. It is not ours and no client calls it,
-- so revoke it defensively wherever it exists. Guarded so this file stays
-- paste-safe on projects that do not have it.
-- (Supabase advisor: anon_security_definer_function_executable.)
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

grant execute on function public.confirm_receipt(text, date, numeric, numeric, text, text, text, text, text, text, jsonb) to authenticated;
grant execute on function public.report_damage(uuid, uuid, numeric, text) to authenticated;
grant execute on function public.adjust_stock(uuid, numeric, text, text) to authenticated;
grant execute on function public.hybrid_search(text, extensions.vector, int, float, float, int) to authenticated;