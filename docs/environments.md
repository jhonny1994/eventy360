# Environments

## Local

- Web local environment lives in `apps/web/.env.local`.
- Supabase local development uses the root `supabase/` directory.
- Do not commit `.env`, `.env.local`, or platform secrets.

Minimum local web variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

Use `apps/web/.env.example` as the committed template and `apps/web/.env.local` for local values.

## Production

Do not duplicate secrets across platforms unless a platform actually runs the workload that needs them. Web runtime variables belong in the web hosting platform. Supabase deployment credentials belong in GitHub because GitHub Actions runs the Supabase deployment workflow.

Expected GitHub repository secrets for Supabase deployments:

- `SUPABASE_ACCESS_TOKEN`

Expected GitHub repository variables for Supabase deployments:

- `SUPABASE_PROJECT_REF`

`SUPABASE_PROJECT_REF` is the Supabase project reference for the target environment. It is configuration, not a database credential. The deployment workflow links the project and runs migrations with `supabase db push --linked`, so GitHub does not need the database password.

Expected web hosting platform variables for the `apps/web` deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

`NEXT_PUBLIC_APP_URL` must be the canonical deployed web origin for the environment. Do not use a local development URL in staging or production.

The GitHub web CI workflow uses non-production fallback values only to prove that the Next.js app compiles in pull requests. Real staging and production web values should stay in the hosting platform unless GitHub Actions becomes responsible for deploying the web app.

Add any additional application secrets to the platform that consumes them, never to committed files.

## Web Hosting

Configure the chosen web hosting platform with:

- Application Root: `apps/web`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Start Command: `pnpm start` when the platform requires an explicit server start command
- Output Directory: leave as the framework default unless the platform requires otherwise

Preview and production deployment behavior depends on the chosen provider. The invariant is that pull requests must pass GitHub Actions before promotion to production.

Health checks:

- `/healthz`
- `/readyz`

## Supabase

The Supabase GitHub Actions workflow deploys:

- database migrations from `supabase/migrations`
- edge functions from `supabase/functions`

Set function secrets in the Supabase project, not GitHub, unless they are needed by the deployment command itself. Current edge functions expect Supabase-managed runtime variables plus these project secrets where applicable:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_INVITE_REDIRECT_URL`

## Mobile GitHub Releases

The mobile release workflow publishes Android APK artifacts to GitHub Releases when a tag matching `mobile-v*` is pushed.

The workflow is intentionally dormant while `apps/mobile` is blank. Once Flutter is scaffolded, configure mobile runtime values in Flutter build configuration and document them here before the first release tag.
