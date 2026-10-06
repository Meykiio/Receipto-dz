# Receipto

**Free, private, local-first receipt management, expense tracking, and inventory for Algeria — and beyond.**

[![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](LICENSE)
[![CI](https://github.com/Meykiio/Receipto-dz/actions/workflows/ci.yml/badge.svg)](https://github.com/Meykiio/Receipto-dz/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Snap a receipt. Get its contents extracted on your device. Track spending against a budget. Watch your inventory fill itself from your purchases. Manage damaged goods and supplier refunds. No account on any service, no subscription, no AI required — unless you choose to enable it.

Arabic (RTL), French, and English. Installable as a PWA. Receipt parsing and OCR run entirely on your device, with no internet connection needed once Supabase is running locally.

> **Arabic**: [اقرأ هذا الملف بالعربية](README.ar.md)

---

## Why Receipto

Most receipt/inventory tools are either paid, cloud-locked, or send your financial data somewhere you don't control. Receipto inverts that:

- **Local-first.** By default everything runs on your machine. Your receipts and stock never leave your computer unless *you* turn on an optional AI feature.
- **Free forever.** GPL-3.0-or-later. No subscription, no paywall, no "pro tier". This project exists to make powerful tooling free for everyone.
- **Understandable.** One obvious action per screen. Plain-language errors. Built for people who are not developers.
- **Private by design.** Row-level security on every table, a private storage bucket with per-user folders, and zero secrets in the app.

Receipto is a solo project, built in Algiers as the first of a small set of free tools for Algerian households and small businesses.

## What it does

- **Capture receipts** — from your phone camera or files (images and PDFs). Digital PDFs are read from their embedded text layer (usually the most accurate path); photos go through open-source OCR (Tesseract, trained for French + Arabic + English) plus parsing rules.
- **Review before saving** — extracted fields appear as an editable draft beside the original image. Nothing is saved until you confirm. Manual entry always works.
- **Inventory, automatically** — every confirmed receipt registers its products: live quantities, low-stock warnings, movement history, quick adjustments, and manual add/edit/delete of products.
- **Spending insights** — per-vendor breakdowns, monthly budget progress, and trends over time.
- **Damaged goods & refunds** — mark items damaged, group by supplier, generate a printable refund summary.
- **Export** — CSV, Excel (`.xlsx`), and JSON. Generated locally, no spreadsheet library with known vulnerabilities.
- **Optional AI** (off by default, in Settings) — higher-accuracy parsing, a chat assistant that answers questions about *your* receipts and stock, and AI-generated reports. Works with Gemini, OpenAI-compatible endpoints (OpenAI, Groq, OpenRouter), or fully local models via Ollama.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query |
| Styling & UX | Tailwind + design tokens (dark/light), RTL-first |
| Data | Supabase (Postgres + Auth + Storage + Row-Level Security) |
| PDF text | pdf.js |
| OCR | Tesseract.js (fr/ara/eng), fully self-hosted, works offline |
| Charts | Recharts |
| AI (optional) | Provider-agnostic, keys stay in the user's browser |

## Getting started

### Prerequisites

| Tool | Why |
|---|---|
| **Git** | to clone the repository |
| **Node.js 20+** | to build and run the app |
| **npm** | comes with Node.js |
| **Docker** | to run Supabase locally — Docker Desktop on Windows/macOS, Docker Engine on Linux |
| **Supabase CLI** | to start Supabase locally; run `npx supabase --version` to check |
| **A Supabase cloud project** (alternative to Docker) | free, no Docker needed — create one at supabase.com (PATH B in the setup prompt below) |
| **Ollama** (optional) | only if you want fully local AI |

### Quick start (normal)

```bash
# 1. Clone
git clone https://github.com/Meykiio/Receipto-dz.git
cd receipto-app

# 2. Install
npm install

# 3. Start Supabase locally (Docker must be running)
npx supabase start

# 4. Create your environment file
#    macOS / Linux / Git Bash:
cp .env.example .env.local
#    Windows PowerShell:
#    Copy-Item .env.example .env.local
#    Then paste the API URL + anon key printed by "supabase start" into .env.local

# 5. Apply the database schema ONCE
#    Open the local Studio (usually http://127.0.0.1:54323) -> SQL Editor,
#    paste the contents of supabase/schema.sql, and run it.

# 6. Run the app
npm run dev
# open http://localhost:8080
```

The one-click prompt below does all of this for you, including filling in the keys.

### One-click setup (zero technical knowledge)

Copy the prompt below, paste it into any AI coding assistant (Claude Code, Cursor, opencode, Gemini CLI, Windsurf), and let it do everything. It detects your operating system (Windows, macOS, or Linux), verifies your computer, installs anything missing, and gets you to a working Receipto with a logged-in account.

### One-click local setup prompt — paste this into your AI assistant

```text
You are setting up Receipto, an open-source receipt-management + inventory app (React + TypeScript + Vite + Supabase), for a non-technical user. Work autonomously, verify every step, and explain each step in one plain-language sentence. Never skip a failed verification: diagnose the root cause, fix it, and re-run before continuing.

GOAL (both paths): Receipto running at http://localhost:8080, a working database, the schema applied, and a first account that can log in. AI features stay OFF unless the user explicitly asks to enable them.

FIRST, ASK ONE QUESTION before installing anything: "Do you want Receipto to use a database on your own computer (Docker — recommended, fully private and free) or your own free Supabase cloud project?" Wait for the answer, then follow that path (PATH A or PATH B below).

STEPS:

0. DETECT THE PLATFORM FIRST. Determine the OS (Windows, macOS, Linux) and the CPU architecture. Use the platform-appropriate commands and package managers below. Report which OS you detected. On Windows, also note whether you are in PowerShell, cmd, or Git Bash and use the right syntax for each.

1. VERIFY PREREQUISITES. Check each tool; install any that are missing using the OS-appropriate method. Report exactly what you installed and when a restart is needed.
   - Git: `git --version`
     • Windows: winget install Git.Git  |  macOS: brew install git (or built-in)  |  Linux: apt install git / dnf install git
   - Node.js 20+: `node -v`
     • Windows: winget install OpenJS.NodeJS.LTS  |  macOS: brew install node  |  Linux: apt install nodejs npm (or use nvm)
   - npm: `npm -v` (comes with Node)
   - Docker (must be RUNNING, not just installed): `docker version`
     • Windows/macOS: Docker Desktop — winget install Docker.DockerDesktop (needs a restart, and enable WSL2 backend) | brew install --cask docker
     • Linux: Docker Engine — follow your distro's instructions (docker.io or docker-ce), then `sudo systemctl enable --now docker`
   - Supabase CLI: `npx supabase --version`
   ALTERNATIVE (no Docker): use PATH B (Supabase Cloud) below — create a free project at supabase.com. A plain local Postgres server alone will NOT work, because Receipto also needs Supabase Auth, Storage, and the REST API.

2. CLONE. If the current folder is not already the project, run:
   git clone https://github.com/Meykiio/Receipto-dz.git
   cd Receipto-dz

3. INSTALL DEPENDENCIES. Run `npm install` in the repo root. Report honestly if it fails and fix the root cause.

--- PATH A: LOCAL DATABASE (Docker) ---

A1. START SUPABASE LOCALLY. Run `npx supabase start` (Docker must be running). Wait for it to print: API URL, anon key, Studio URL, and DB URL. If a port is busy or Docker is down, diagnose and fix before continuing. If you see "not linked", this is expected — local start does not need a linked project.

A2. APPLY THE DATABASE SCHEMA ONCE. Open Studio (usually http://127.0.0.1:54323) -> SQL Editor. Read `supabase/schema.sql` and paste its FULL contents, then Run. It creates all tables, RLS, storage, and functions. Run it exactly ONCE on a fresh database.
   CLI alternative: npx supabase db query --local --file supabase/schema.sql
   Verify: `select count(*) from public.products;` should return 0.

A3. ENVIRONMENT. Create `.env.local` (never commit it):
   VITE_SUPABASE_URL=<API URL, e.g. http://127.0.0.1:54321>
   VITE_SUPABASE_ANON_KEY=<anon key printed by supabase start>

A4. Email confirmation is off by default locally, so sign-up works immediately. If it is on, disable it in supabase/config.toml and restart, or confirm the user in Studio -> Authentication -> Users.

--- PATH B: SUPABASE CLOUD (no Docker) ---

B1. ASK THE USER FOR TWO VALUES from their free Supabase project (supabase.com -> the project -> Settings -> API):
    - Project URL (https://<ref>.supabase.co)
    - the publishable/anon key (this key is public and safe in .env.local; the service_role key is NOT and must never be used here)
    If they have no project yet, walk them through creating one on the free plan.

B2. TELL THE USER TO DISABLE EMAIL CONFIRMATION: Supabase dashboard -> Authentication -> Sign In / Providers -> Email -> turn OFF "Confirm email" -> Save. A fresh cloud project has it ON, which blocks sign-up and burns the small free email quota. This step is required.

B3. APPLY THE SCHEMA ONCE. Dashboard -> SQL Editor -> New query. Read `supabase/schema.sql` and paste its FULL contents, then Run. Run it exactly ONCE on the fresh project.
   Verify: `select count(*) from public.products;` should return 0.

B4. ENVIRONMENT. Create `.env.local` (never commit it) with the two values from B1:
   VITE_SUPABASE_URL=<Project URL>
   VITE_SUPABASE_ANON_KEY=<publishable/anon key>

--- FINISH (both paths) ---

5. RUN THE APP. Start `npm run dev` in the background. Confirm http://localhost:8080 loads without console errors.

6. TYPE-CHECK. Run `npm run typecheck`. Report the result honestly. (Use `npm run typecheck`, not `npx tsc --noEmit`: the root tsconfig is a solution-style config with project references, so plain `tsc --noEmit` type-checks zero files and always exits 0.)

7. CREATE THE FIRST ACCOUNT in the app, then confirm it reaches the dashboard.

8. FINAL REPORT. Print a clear summary:
   - What is running and where (app URL; Studio URL on PATH A, or the Supabase dashboard on PATH B)
   - The daily commands: PATH A — start Docker, `npx supabase start`, `npm run dev`; PATH B — `npm run dev`. How to stop everything.
   - What is ON and what is OFF (AI is OFF — why, and how to enable it later in Settings)
   - Any unresolved issues with their exact error messages

HARD RULES: never commit secrets or .env files; never modify the database outside supabase/schema.sql; the service_role key must never appear in the app or in .env.local; do not add dependencies; if a step cannot be completed, stop and explain exactly what is missing rather than improvising.
```

## Deploying to the cloud (optional)

Receipto is built to run fully locally. A Supabase cloud project can either replace the local Docker setup (the setup prompt above, PATH B) or host a shared, always-on version (e.g. on Vercel) — the code is the same. In both cases you apply the exact same `supabase/schema.sql` once in the project's SQL editor, and you must turn **off** Authentication → Email → **Confirm email**, or sign-up cannot complete. See `docs/DEPLOY.md`.

## Documentation

- `docs/DATABASE.md` — schema, RLS, and design rules
- `docs/FEATURES.md` — what the app does
- `docs/PROJECT_STRUCTURE.md` — how the code is organized
- `docs/DEPLOY.md` — cloud deployment
- `docs/DESIGN_SYSTEM.html` — the full design system (tokens, type, components, RTL). Open it in a browser.

## Verification

The full local gate, in order:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (0 errors; warnings are pre-existing)
npm test            # vitest
npm run build       # production build + PWA service worker
npm run a11y        # axe on the public routes (serious/critical fail the gate)
npm audit           # expect 0 vulnerabilities
```

`npm run a11y` and `npm run build` both need a running app; `a11y` starts its own
preview server.

There is also a functional end-to-end check that drives a real browser through
signup → capture → review → dashboard → export and verifies the stored rows via
PostgREST. It needs the local Supabase stack and a preview server:

```bash
npx supabase start
npm run build && npm run preview -- --port 8080
pip install playwright pillow && playwright install chromium
npx supabase status -o env   # then export SUPABASE_ANON_KEY
npm run e2e
```

It creates a throwaway `@receipto.test` account per run and exits non-zero on any
failed check or uncaught page error.

## Contributing

We welcome help. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md). We take privacy seriously: RLS on every table, private storage, and no secrets client-side.

## License

[GPL-3.0-or-later](LICENSE) — Receipto is free software and stays free. Anyone may use it commercially, study it, and change it, but any copy or derivative they distribute must keep the same freedoms: the complete source code, under the GPL (this version or any later version).

**© 2026 Sifeddine Mebarki** — built for the Algerian community, with global ambitions.