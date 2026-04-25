# Development

## Prerequisites

- Node.js 24.14.1 or newer. The repo includes `.nvmrc`.
- pnpm 10.23 or newer.
- Supabase CLI for local backend work.

## Repository Commands

Run from the repository root:

```bash
pnpm check:repo
pnpm install:web
pnpm dev:web
```

`check:repo` validates the expected monorepo structure. `install:web` installs the web app using the committed `apps/web/pnpm-lock.yaml`.

## Website

```bash
cd apps/web
pnpm install --frozen-lockfile
pnpm dev
```

Useful checks:

```bash
cd apps/web
pnpm lint
pnpm typecheck
pnpm build
```

The web app uses `apps/web/.env.local` for local public Supabase values and other local-only secrets. Start from `apps/web/.env.example`; `.env.local` is ignored by git.

## Mobile

`apps/mobile` is reserved for the future Flutter app. It should stay as a blank folder with `.gitkeep` until mobile development starts.

When mobile starts, add Flutter files in `apps/mobile`. The existing mobile release workflow expects:

- `apps/mobile/pubspec.yaml`
- `apps/mobile/lib/`
- a buildable Android target

Mobile releases are created by pushing a tag named `mobile-vX.Y.Z`. The first release target is a GitHub Release APK artifact, not App Store or Play Store distribution.

## Supabase

Supabase remains at the repo root:

```bash
supabase start
supabase db reset
```

Use migrations for schema changes and commit the migration files under `supabase/migrations`.

Production and staging migrations must not be applied from a developer laptop. Use the GitHub Actions Supabase workflow and protected GitHub Environments. That workflow deploys migrations and every edge function directory under `supabase/functions`.

## Known Product Routes

The current web app intentionally does not ship these linked destinations yet:

- `/:locale/profile/events/:id/edit`
- `/:locale/terms`
- `/:locale/privacy`
- `/:locale/contact`

They are tracked as product gaps, not monorepo or CI/CD issues. Before a production launch, either implement these pages or remove the links/buttons that point to them.
