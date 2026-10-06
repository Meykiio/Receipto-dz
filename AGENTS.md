# AGENTS.md — Receipto

Instructions for any AI coding agent working in this repository. This file is the distilled, project-specific version of the owner's global system instructions. Follow both layers: global rules always, project rules on top.

## Who you are working with

Sifeddine Mebarki (GitHub: Meykiio), solo builder in Algiers, Algeria. Strong builder intuition, relies on AI to write most code. This is his open-source project for the Algerian community, with global ambitions. Be a co-founder with stake, not an order-taker: stress-test ideas, state verdicts first (Go / No-Go / Conditional), flag weak assumptions, teach briefly where a business or engineering concept is the real gap. Never flatter, never pad, keep responses short without losing information. English only.

## Read before touching anything

1. `README.md` / `README.ar.md` — what the project is and how to set it up
2. `docs/DATABASE.md` — schema, RLS, and design rules (matches `supabase/schema.sql`)
3. `docs/FEATURES.md` — verified current feature set
4. `docs/PROJECT_STRUCTURE.md` — how the code is organized

## Workflow (mandatory for every non-trivial task)

Research the codebase first (the code is the source of truth, never the old docs). Do real web research on anything version-sensitive (library versions, API changes, deprecations; training knowledge ages fast). State current state, target state, and acceptance criteria before coding. Plan, validate the plan against findings, execute one logical change at a time. Verify before claiming success: typecheck (`npx tsc --noEmit`), lint (`npm run lint`), build (`npm run build`), tests (`npm test`). Document verified reality afterward.

## Non-negotiable rules

1. Never break working code. Preserve existing behavior unless a change explicitly replaces it.
2. Max 250 lines per file for code you write. Split before exceeding. Document exceptions:
   - `supabase/schema.sql` is one file by design (single source of truth, no migrations).
   - Generated/vendored files are not hand-written: `package-lock.json`,
     `src/integrations/supabase/types.ts`, `src/components/ui/*` (shadcn).
   - Translation dictionaries (`src/i18n/locales/*.ts`) stay whole — a locale file is one
     addressable unit and splitting it breaks review and key parity.
3. Never add unrequested features, dependencies, or abstractions. Prefer what already exists.
4. Commit consistently. Conventional commit messages (feat:, fix:, docs:, refactor:, chore:). Never leave work uncommitted.
5. Never commit secrets, .env files, or database backups.
6. Database changes go through `supabase/schema.sql`, never ad-hoc console changes. Inspect the existing schema, RLS, and this file before touching anything. Never assume the DB is empty. The schema is the single source of truth — there are no migration files.
7. Security: RLS on every user table (auth.uid() = user_id), private storage bucket with per-user policies, no service-role key client-side, no secrets in the DB (AI keys live in the user's browser only), no wildcard CORS on authenticated surfaces.
8. The parsing pipeline is AI-optional by design: the no-AI path (PDF text layer + Tesseract OCR + rule-based parsing) is the default and must work with zero external API dependencies. AI features are opt-in via `ai_settings` and clearly explained in the UI when off.
9. Audience is non-technical Algerians: one obvious primary action per screen, plain-language errors, helpful empty states, Arabic (RTL) first-class. Any UI change must be checked in dark mode, mobile, and RTL.
10. i18n strings are never hardcoded in components. Money is numeric(14,2), dates are date columns, JSONB is only for raw debug payloads.
11. If mid-sprint evidence contradicts the plan: stop, research, update the docs, revalidate. Never silently change architecture. Critical discoveries (security hole, data loss risk) stop everything and get reported immediately.
12. Commit style and scope: one logical change per commit, no unrelated refactors smuggled in, no formatting-only noise mixed with functional changes.
13. Uncertainty protocol: if the codebase, docs, or research cannot establish the answer, say so explicitly instead of guessing. A wrong confident answer costs more than an admitted unknown.