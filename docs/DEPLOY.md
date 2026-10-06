# Receipto — Deployment

Receipto is **local-first**: the recommended setup runs entirely on your own
machine (Supabase in Docker + the app locally) at zero cost. This document covers
the optional cloud deployment path for when you want a shared, always-on instance.

## Architecture note

There are **no Edge Functions and no server-side secrets** in this project.
Parsing, OCR, the chat assistant, and report generation all run client-side in
the browser. Supabase provides only the database, auth, and storage. This keeps
the attack surface small and makes the app genuinely private by default.

## Local (recommended)

Follow the README "Quick start". Everything runs on your machine.

## Cloud (optional)

You need two accounts: a Supabase project (free tier is fine) and a hosting
platform such as Vercel.

### 1. Create and configure the Supabase project

1. Create a new empty project at https://supabase.com/dashboard.
   Any region works; `eu-central-1` / `eu-west-3` give the lowest latency to
   Algeria.
2. Open **SQL Editor** and paste the full contents of `supabase/schema.sql`.
   Run it once. It creates all tables, RLS policies, the storage bucket, and
   the RPCs. (CLI equivalent: `npx supabase link --project-ref <ref>` then
   `npx supabase db query --linked --file supabase/schema.sql`.)
3. Verify: in the dashboard, Storage → Buckets → `receipts` should exist and be
   **not public**. Authentication → Users is where you confirm new sign-ups if
   email confirmation is enabled.

### 2. Configure auth

In Authentication → Providers → Email, keep Email enabled and **turn OFF
"Confirm email"**. This is required, not optional: with it on, a new sign-up
receives no session until the address is confirmed, and the free tier's small
email quota is exhausted almost immediately (Supabase returns
`over_email_send_rate_limit`). Turn confirmation back on once you have SMTP
configured. Also set the site URL to your app's domain.

### 3. Deploy the app

Any static host works (the build output is plain `dist/`). With Vercel:

1. Import the repository.
2. Build command: `npm run build`, output directory `dist`.
3. Add environment variables for the **production** environment:
   - `VITE_SUPABASE_URL` — your project URL (e.g. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` — your project's publishable/anon key
4. Deploy.

**Never** put the `service_role` key in the client environment — only the
publishable anon key belongs there.

### 4. After deploy

- Re-run the security checks: `npm audit`, and the checklist in SECURITY.md.
- Verify sign-up → capture → confirm → inventory works against the cloud project.

## Rollback / data

Your data lives in your Supabase project. To reset to a clean state, recreate
the project or drop the `public` schema and re-run `schema.sql`. Always back up
before destructive operations.