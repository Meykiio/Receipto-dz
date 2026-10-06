# Receipto — Database

The entire database is defined in one file: **`supabase/schema.sql`**. Apply it once
to a fresh Supabase project (SQL Editor, or `npx supabase db query --local --file supabase/schema.sql`).

The schema is intentionally **not** idempotent: it is meant to be run exactly once on a
new, empty database. Do not re-run it against an existing project.

This document is verified against the current schema (last verified: October 1, 2026).

## Design rules

- **Money is `numeric(14,2)`.** Never floats.
- **Dates are `date`.** Times are `timestamptz`.
- **JSONB only for raw AI debug payloads** (`receipts.ai_raw`). It is never the
  source of truth — the typed columns are.
- **No secrets in the database.** AI provider keys live only in the user's browser
  (localStorage) and are never stored server-side.
- **Stock is derived, not stored.** `inventory_stock` is a view over the sum of
  `inventory_movements.delta`.

## What `schema.sql` creates

### Extensions
- `pg_trgm` (full-text search)
- `vector` (pgvector, 512-dimensional embeddings for hybrid search)

### Tables (all with `user_id` → `auth.users`)

| Table | Purpose |
|---|---|
| `vendors` | Normalized supplier names (`unique(user_id, name)`) |
| `products` | Inventory catalog (`unique(user_id, normalized_name)`) |
| `receipts` | One row per receipt; flat typed columns |
| `receipt_items` | Line items; `product_id` links to inventory |
| `damaged_items` | Refund documentation for damaged goods |
| `budgets` | One monthly budget per user |
| `user_settings` | Profile-level settings (currency, locale) |
| `inventory_movements` | Append-only ledger; stock = sum of deltas |
| `receipt_chunks` | Content chunks for hybrid search (full-text + embeddings) |
| `ai_settings` | Per-user AI provider config (non-secret only) |
| `ai_usage` | Rate/quota tracking for optional AI |

### View
- `inventory_stock` — derived stock per product (`security_invoker = true`)

### Security (Row-Level Security)
- Every user table has RLS enabled with a per-table policy set scoped to the
  `authenticated` role and `(select auth.uid()) = user_id`:
  `select_own`, `insert_own`, `update_own`, `delete_own`.
- `anon` has **no policies** and is denied by default.
- Storage: private `receipts` bucket (10 MB limit) with per-user folder policies
  (`{user_id}/...`) on `storage.objects`.

### RPCs (write paths)
All are `security definer`, verify `auth.uid()`, and run with
`set search_path`; RLS still applies inside. Execute is granted to
`authenticated` only.

| Function | Purpose |
|---|---|
| `confirm_receipt(vendor, date, total, tax, currency, …, items jsonb)` | One atomic call: upserts vendor, inserts receipt + items, **auto-registers products**, writes purchase movements, indexes content for search |
| `report_damage(receipt_id, receipt_item_id, qty, notes)` | Marks item damaged, writes refund doc, posts a `damage` movement |
| `adjust_stock(product_id, delta, reason, note)` | Manual stock correction from the Inventory page |
| `hybrid_search(query_text, query_embedding, …)` | Reciprocal Ranked Fusion over full-text + semantic results, user-scoped |

## Applying the schema

- **Local (CLI):** `npx supabase start`, then
  `npx supabase db query --local --file supabase/schema.sql`
  (or paste into the Studio SQL editor at `http://127.0.0.1:54323`).
- **Cloud:** create a Supabase project, then either paste the full contents of
  `supabase/schema.sql` into the dashboard SQL editor, or link and use the CLI:
  `npx supabase link --project-ref <ref>` followed by
  `npx supabase db query --linked --file supabase/schema.sql`.

The schema is **not** re-runnable on the same database (plain `create table`).
Run it once on a fresh DB. This is intentional — it keeps the source of truth
simple and the state honest.

## Changing the schema

Edit `supabase/schema.sql`, apply it to a fresh database to verify, and commit.
Do **not** make ad-hoc changes in the SQL console — the file is the single
source of truth.