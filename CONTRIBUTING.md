# Contributing to Receipto

Thanks for helping make receipt management free and local-first for the Algerian community and beyond.

## Ground rules

- **Receipto is GPL-3.0.** Any copy, modification, or derivative must stay open source under the same license. This is a hard project principle, not a suggestion.
- **Arabic (RTL) is first-class.** The app is used by non-technical Algerians. Any UI change must be verified in dark mode, mobile, and RTL (see `AGENTS.md`).
- **Never commit secrets.** No `.env`, no API keys, no database backups. The DB backup (`supabase/db_cluster-*.backup.gz`) is gitignored and must stay that way.
- **Database changes go through `supabase/schema.sql`**, never ad-hoc console edits.

## Getting started

1. Fork and clone the repo.
2. Follow the setup instructions in `README.md` (or paste the one-click setup prompt into your AI assistant).
3. Create a branch: `git checkout -b your-feature`.

## What to work on

Open issues and `docs/FEATURES.md` are the source of truth for what's next. Good first areas:

- Parsing rules in `src/lib/parser/` (receipt formats are varied — real samples welcome).
- i18n strings in `src/i18n/locales/{ar,fr,en}.ts`.
- Accessibility and mobile UX across pages.
- Tests in `src/**/__tests__/`.

## Development commands

```bash
npm install
npm run dev          # start the app
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest
npm run build        # production build
npm run a11y         # axe on the public routes
```

## Before submitting

1. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. All must pass.
2. If your change touches a user-facing string, add it to **all three** locales
   (`src/i18n/locales/en.ts`, `ar.ts`, `fr.ts`). English is the source of truth;
   `ar` and `fr` must not fall behind.
3. Verify your change in RTL (Arabic) and dark mode.
4. One logical change per commit, with a clear message (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
4. Open a pull request and describe what you changed and why.

## Reporting bugs

Open an issue with:
- What you did
- What you expected
- What happened (and a screenshot if visual)
- Browser/OS if relevant

Thank you for keeping Receipto free.