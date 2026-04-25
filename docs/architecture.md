# Eventy360 Architecture

Eventy360 is organized as a simple production monorepo. The repository gathers deployable applications and shared backend infrastructure without forcing Next.js, Flutter, and Supabase through one task runner.

The production rule is: the root owns repository policy and delivery gates; each app owns its native build/runtime.

## Layout

```text
eventy360/
  apps/
    web/       # Next.js app: public pages, user app, admin app
    mobile/    # Reserved for the future Flutter app; no scaffold yet
  supabase/    # Database migrations, edge functions, RLS/storage config
  docs/        # Operating documentation
  .github/     # CI, security, review, and dependency automation
```

## Boundaries

- `apps/web` owns all current product UI: marketing/public pages, user profile/submission/event flows, and admin dashboards.
- `apps/mobile` is a reserved boundary only. It should contain no Flutter files until mobile development starts.
- `supabase` is the shared backend source of truth for database schema, row-level security, storage policy, RPCs, and edge functions.
- `.github` owns pull request checks, release controls, security scanning, dependency update policy, and CODEOWNERS.
- `docs` is the operational source of truth for local setup, environment configuration, and release steps.

## Current Web Flow Ownership

- Public localized entry: `apps/web/src/app/[locale]`.
- User/auth/profile flows: `apps/web/src/app/[locale]/login`, `register`, `profile`, `complete-profile`, `reset-password`, and `callback`.
- User product surfaces: profile events, submissions, subscriptions, bookmarks, topics, repository, and verification.
- Admin surfaces: `apps/web/src/app/[locale]/admin` and `apps/web/src/components/admin`.
- Middleware guard layer: `apps/web/middleware.ts` and `apps/web/src/middleware`.

The future mobile app should reuse Supabase contracts and RLS permissions, not web UI code. Admin behavior remains web-only unless a separate product decision changes that.

## Deployment Model

- Web deploys from `apps/web` on the chosen web hosting platform.
- GitHub Actions validates the web app on pull requests and main branch pushes.
- Supabase deployments are manual GitHub Actions runs against protected GitHub Environments; the workflow applies database migrations and deploys all edge functions under `supabase/functions`.
- Mobile release automation targets GitHub Releases first. It is tag-driven and only works after a real Flutter project exists under `apps/mobile`.

## Runtime Health

- `GET /healthz` returns a static liveness response for uptime checks.
- `GET /readyz` returns a static readiness response for deployment checks.
- These endpoints are excluded from middleware auth/i18n guards.
