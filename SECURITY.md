# Security Policy

Receipto is built local-first and privacy-first: by default your receipts are
parsed on your own device and stored in your own database. We take security
seriously and welcome responsible disclosure.

## Supported versions

Security fixes are backported to the latest release only.

## Reporting a vulnerability

Do **not** open a public issue for a security problem. Report it privately using
the repository's **Security → Report a vulnerability** flow (GitHub's private
vulnerability reporting). That channel is encrypted and requires no email address.

Please include:
- What you found and where (file, function, endpoint)
- How to reproduce it (steps, sample payload)
- Impact and a suggested fix, if you have one

We aim to respond within 5 business days and to keep you updated as the issue
is triaged and fixed. Please give us a reasonable window to fix before any
public disclosure.

## Known good practices in this repo

- **Row-level security**: every user table has RLS enabled with
  `auth.uid() = user_id` policies (see `supabase/schema.sql`).
- **Private storage**: the receipts bucket is private with per-user policies.
- **Zero runtime secrets**: Supabase keys are publishable-only and loaded from
  environment variables; service-role keys are never used client-side.
- **AI is opt-in**: providers are chosen by the user, keys stay in their
  browser, and the default parsing pipeline needs no external service.
- **Dependency hygiene**: `npm audit` reports **0 vulnerabilities** across the whole
  tree, so nothing with a known advisory reaches the shipped browser bundle or the
  CI toolchain. (The dependency-free CSV/XLSX exporter exists for this reason.)
  The build toolchain is kept current for the same reason — Vite and Vitest are on
  supported lines with their security fixes applied.
- **No telemetry**: the app contains no analytics, no error reporting, and no
  tracking. It never phones home.
- **Enforced accessibility**: CI runs axe-core against the public routes and **fails
  the build** on any serious or critical WCAG A/AA violation.

### A note on Lighthouse CI

Lighthouse CI was removed. Its thresholds were all `warn`, so it never actually
blocked a pull request, and its dependency tree (`@lhci/cli` → Puppeteer) carried
14 advisories with no upstream fix available — `extract-zip`, the vulnerable
package at the bottom of that tree, had no patched release at all. In its place,
`npm run a11y` runs axe-core in GitHub Actions and genuinely fails the build.
Contributors can still run Lighthouse locally against `npm run preview` whenever
they want a performance or SEO read.

## Scope

In scope: the web app source in this repository, `supabase/schema.sql`,
and the documented deployment flow.

Out of scope (please do not report, but still consider responsibly):
- Vulnerabilities in the user's own self-hosted Supabase instance or Docker
  setup unless they stem from this repository's configuration.
- Known upstream issues in third-party dependencies that already have their
  own advisory process.