# Eventy360

Eventy360 is an academic events platform for discovering events, managing profiles, handling submissions, reviewing research work, tracking subscriptions and payments, and administering the platform.

This repository is organized as a simple production monorepo. The current product runs as a Next.js web application backed by Supabase. A Flutter mobile app is planned and has a reserved workspace, but it is intentionally not scaffolded yet.

## Repository Layout

```text
eventy360/
  apps/
    web/       Next.js app: public pages, user flows, and admin flows
    mobile/    Reserved for the future Flutter app
  supabase/    Migrations, edge functions, storage/RLS backend config
  docs/        Architecture, development, environment, and release runbooks
  .github/     CI, security scanning, dependency updates, review policy
```

The monorepo stays deliberately lightweight. The root owns policy, CI/CD, and release coordination; each application keeps its native tooling.

## Stack

- Web: Next.js 16, React 19, TypeScript, Tailwind CSS, next-intl
- Backend: Supabase Postgres, Auth, Storage, RPCs, Edge Functions
- Package manager: pnpm
- Mobile: Flutter, planned for `apps/mobile`
- CI/CD: GitHub Actions

## Getting Started

Prerequisites:

- Node.js 24.14.1 or newer
- pnpm 10.23 or newer
- Supabase CLI for local backend work

Run the web app:

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install:web
pnpm dev:web
```

Open the local URL printed by the Next.js dev server.

## Quality Checks

Run the full local web check:

```bash
pnpm check:repo
pnpm install:web
pnpm check:web
```

Individual commands:

```bash
pnpm lint:web
pnpm typecheck:web
pnpm build:web
```

## Deployment Model

- Web deploys from `apps/web` on the chosen hosting platform.
- Supabase migrations and edge functions deploy from `supabase/` through protected GitHub Actions environments.
- Mobile releases will publish Android APK artifacts to GitHub Releases from `mobile-v*` tags once the Flutter app exists.

Production releases should move through pull requests, required checks, review, and documented environment approvals.

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Environments](docs/environments.md)
- [Release Process](docs/release.md)

## Current Status

- `apps/web` contains the active product.
- `supabase` contains the shared backend contract and deployable edge functions.
- `apps/mobile` is reserved for the future user-facing Flutter app and should remain blank until mobile development starts.
