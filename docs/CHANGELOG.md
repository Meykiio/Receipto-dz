# Changelog

All notable changes to Receipto. Format based on Keep a Changelog. Dates in YYYY-MM-DD.

## 2026-10-06 — First public release

### Added
- `SUPPORT.md` with a real contact address and the common setup problems.
- `CodeQL` workflow (static security analysis). Dormant while the repository is
  private; activates when it is public.
- Supabase Cloud path in the one-click setup prompt: it now asks whether the user
  wants a local Docker database or their own free Supabase project, and requests
  the Project URL and publishable key when the cloud path is chosen.
- Five covering indexes for foreign keys (`receipts.vendor_id`,
  `damaged_items.receipt_item_id`, `inventory_movements.receipt_id` and
  `receipt_item_id`, `receipt_chunks.receipt_id`), clearing the Supabase
  `unindexed_foreign_keys` advisor. Postgres does not index FK columns on its own,
  so these matter on cascade deletes as data grows.
- Guarded `revoke` for Supabase's `rls_auto_enable()` helper, clearing the
  `anon_security_definer_function_executable` advisor.

### Changed
- Upgraded Tailwind CSS 3 -> 4 (CSS-first `@theme` in `src/index.css`,
  `@tailwindcss/postcss`), removing the `braces` advisory. `npm audit` is clean.
- ESLint: 19 warnings -> 0, without changing runtime behaviour.
- AI assistant and AI report now answer in the language of the current UI.

### Fixed
- Legal pages pointed at a non-existent `support@receipto.app` address; replaced
  with a real contact, and the "last updated" date was over a year stale.
- Hardcoded English strings that were rendering in the trilingual UI
  (`Capture` read-error fallback, export success/failure toasts, delete-account
  error toast).

### Verified
- Row-level security exercised at runtime: a second user cannot read, update,
  delete, or forge rows belonging to another user, and `confirm_receipt` writes
  under the caller's own `auth.uid()`. Confirmed both on local Supabase and on a
  Supabase Cloud project.

## 2026-10-01 — Open-source release prep

### Added
- Single master schema `supabase/schema.sql` (consolidates the previous migration
  chain into one file: extensions, tables, RLS, storage, RPCs). Verified against a
  fresh Supabase project with an end-to-end write test.
- Arabic README (`README.ar.md`).
- GPL-3.0 license, `CONTRIBUTING.md`, `SECURITY.md`.
- `CODE_OF_CONDUCT.md`, issue templates, PR template, and a `CI` workflow
  (typecheck, lint, test, build).
- An axe-core accessibility gate (`npm run a11y`) that fails CI on any
  serious/critical WCAG A/AA violation.

### Changed
- Replaced the unmaintained `xlsx` (SheetJS) dependency with a dependency-free
  CSV/`.xlsx` exporter built on `fflate` — removes a known high/critical
  vulnerability with no npm fix.
- Removed ~20 dead dependencies (Clerk, zod, react-hook-form, react-dropzone,
  vaul, cmdk, marked, lodash, file-saver, unused radix packages, and more).
- Removed orphaned Supabase Edge Functions (chat-assistant, process-receipt,
  export-report, financial-report) — the assistant runs fully client-side.
- i18n: added missing `scanWithAiDisabled` to Arabic and French.
- Fixed the collapsed sidebar icons (centered in the rail), removed the mobile
  drawer collapse button, made the "Scan with AI" toggle always visible.
- Inventory: full product CRUD (add / edit / delete) plus a pagination-reset fix.
- Docs rewritten to describe the actual current state (no plan/sprint/archive
  leftovers).

### Removed
- `docs/archive/`, `docs/PLAN.md`, `docs/UI_REFACTOR_PLAN.md`,
  `docs/SYSTEM_INSTRUCTIONS.md`, `docs/AUDIT.md` (kept in the previous repository's
  history), and the old multi-file migration directory.
- Stale `bun.lockb` (repository uses npm).
- Lighthouse CI. Its thresholds were all `warn` so it never blocked a PR, and its
  dependency tree carried 14 advisories with no upstream fix (`extract-zip` had no
  patched release at all). `npm audit` is now clean across the entire tree.
- Vercel Analytics and Sentry — the app now genuinely ships no telemetry, matching
  what the documentation always claimed.

### Fixed
- `budgets.month` was queried as `YYYY-MM` against a `date` column, so the dashboard
  budget indicator returned an error (HTTP 400). All call sites now send a full
  `YYYY-MM-01` date.
- Insights report is now fully translated: the dialog, the PDF/CSV exports, and the
  fallback report templates were previously hardcoded English in a trilingual app.
- `src/integrations/supabase/types.ts` was stored as UTF-16LE instead of UTF-8.

## 2026-09-29 — Rebuild complete

- Relational schema, RLS, private storage, typed data layer, local-first parsing
  (pdf.js + self-hosted Tesseract), inventory auto-registration, hybrid search,
  provider-agnostic AI, i18n (ar/fr/en), PWA.