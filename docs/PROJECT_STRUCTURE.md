# Receipto — Project Structure

Verified October 1, 2026.

## Root

| Path | Purpose |
|---|---|
| `README.md` / `README.ar.md` | English + Arabic user docs, including the one-click setup prompt |
| `LICENSE` | Full GPL-3.0 text + the project's copyright notice (`GPL-3.0-or-later`) |
| `AGENTS.md` | Rules for AI agents and contributors working in this repo |
| `CONTRIBUTING.md` / `SECURITY.md` / `CODE_OF_CONDUCT.md` | Contribution, security, and conduct policies |
| `supabase/schema.sql` | **The entire database schema** (tables, RLS, storage, RPCs). Apply once. |
| `.env.example` | Template for `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` |
| `package.json` / `vite.config.ts` / `postcss.config.js` | Build config (Tailwind theme lives in `src/index.css`) |
| `vercel.json` | SPA rewrites, for optional self-hosting |
| `.gitattributes` | Normalises line endings to LF so Windows and Linux contributors don't fight |
| `scripts/a11y-check.mjs` | axe-core accessibility gate used by CI (`npm run a11y`) |
| `e2e/functional.py` | Browser-driven functional check: signup → capture → review → dashboard → export, verified against PostgREST (`npm run e2e`). Configured by env vars; needs the local Supabase stack + a preview server on `:8080`. |

## `.github/`

| Path | Purpose |
|---|---|
| `workflows/ci.yml` | Typecheck, lint, test, build, plus an axe-core accessibility gate that fails on serious/critical WCAG violations |
| `dependabot.yml` | Weekly npm + monthly GitHub Actions updates |
| `ISSUE_TEMPLATE/` | Bug and feature request forms |
| `pull_request_template.md` | PR checklist (i18n, schema source, dark/RTL/mobile) |

## `src/`

| Path | Purpose |
|---|---|
| `pages/` | Route-level screens: Landing, Auth, Dashboard, Capture, Review, Inventory, Insights, Assistant, DamagedItems, Settings, PrivacyPolicy, TermsOfService, NotFound |
| `components/` | Reusable UI grouped by feature: `assistant/`, `damaged/`, `insights/`, `inventory/`, `landing/`, `receipts/`, `review/`, plus `ui/` (shadcn primitives) |
| `lib/` | Core logic: `parser/` (PDF + OCR + rules), `ocr/` (Tesseract, self-hosted), `ai/` (provider-agnostic chat, tools, embeddings, vision), `assistant/` (chat orchestration hook) |
| `hooks/` | `queries.ts` (TanStack Query hooks), `useReceiptList`, `useMobile` |
| `services/` | Supabase data access: receipts, inventory, insights, export, AI settings + provider calls, chat storage |
| `contexts/` | `AuthContext`, `UserSettingsContext`, `ThemeContext` |
| `i18n/` | i18next setup + locale dictionaries (`ar`, `fr`, `en`) |
| `integrations/supabase/` | Supabase client + generated `Database` types |
| `types/` | Shared TypeScript types |
| `styles/` | Global CSS + design tokens |

## `docs/`

| Path | Purpose |
|---|---|
| `DATABASE.md` | Schema, RLS, design rules (matches `supabase/schema.sql`) |
| `FEATURES.md` | Feature inventory |
| `PROJECT_STRUCTURE.md` | This file |
| `DEPLOY.md` | Optional cloud deployment |
| `DESIGN_SYSTEM.html` | The design system (tokens, type, components, RTL), self-contained |
| `CHANGELOG.md` | Release history |

## Notes for contributors

- Aim for 250 lines per file and split before you exceed it. The documented
  exceptions are `supabase/schema.sql` (single source of truth), generated or
  vendored files (`package-lock.json`, `src/integrations/supabase/types.ts`,
  `src/components/ui/*`), and locale dictionaries (`src/i18n/locales/*.ts`),
  which must stay whole so keys stay in parity across languages.
- No hardcoded UI strings: everything goes through `i18n` (Arabic is first-class,
  RTL via logical properties).
- Database changes go into `supabase/schema.sql`, never ad-hoc console edits.
- The parser/OCR pipeline is the no-AI default and must work with zero external
  API dependencies.