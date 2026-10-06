# Support

Thanks for using Receipto. This is a free, open-source project maintained by
one person, so the support channels are deliberately simple.

## Before you ask

Most problems come from the local stack not running yet. In order:

1. **Is Docker running?** Supabase runs in Docker. If Docker Desktop (or the
   Docker daemon on Linux) is stopped, sign-up, sign-in, and saving will fail
   with a connection error.
2. **Is Supabase up?** Run `npx supabase start` and wait for it to print the
   API URL. `npx supabase status` should list the services as running.
3. **Are your environment variables set?** `.env.local` needs the
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` printed by
   `npx supabase start`.
4. **Is AI not working?** AI is off by default. It needs to be enabled in
   Settings, with your own provider and API key. Without a key, the on-device
   (no-AI) path still works fully.

The [README](README.md) has the full setup steps, and
[docs/DEPLOY.md](docs/DEPLOY.md) covers deployment.

## Where to get help

- **Email:** [notsifeddine@gmail.com](mailto:notsifeddine@gmail.com)
- **Bugs and feature requests:** open an issue on the
  [issue tracker](https://github.com/Meykiio/Receipto-dz/issues). Please use the
  templates and include your platform, what you did, what you expected, and what
  happened.

Email is best for setup questions and anything you would rather not post
publicly. Issues are best for reproducible bugs, because the fix can be
discussed and tracked in the open.

## What to expect

This is a spare-time project, so replies are best-effort rather than a service
level. Reports that are clear and reproducible genuinely get fixed faster.
Please be patient, and keep in mind that nobody is being paid to answer.

## Security issues

Do **not** open a public issue for a security problem. Follow the private
process in [SECURITY.md](SECURITY.md) instead.

## Other free tools for Algeria

Receipto is the first of a small set of free tools built in Algiers for
Algerian households and small businesses — software that would otherwise be
paid for or tied to a cloud you do not control.
