# Release Process

All production changes should move through pull request review and required GitHub Actions checks.

## Web

1. Open a pull request to `main`.
2. Confirm the PR explains user/admin impact and environment changes.
3. Wait for the required GitHub Actions checks.
4. Review the hosting provider preview deployment if one is configured.
5. Merge to `main`.
6. The hosting provider deploys the `apps/web` project from `main`.
7. Check `/healthz` and `/readyz` on the deployed URL.

Rollback is handled by promoting or redeploying a previous successful web deployment on the chosen hosting platform.

## Supabase

1. Create migration files under `supabase/migrations`.
2. Test locally with Supabase CLI before opening the PR.
3. Open a pull request and explicitly document schema, RLS, storage, RPC, and edge function impact.
4. Merge only after application checks pass and reviewers accept the migration.
5. Run the `Supabase` GitHub Actions workflow manually for `staging`.
6. Confirm migrations and edge functions deployed successfully.
7. Smoke test staging.
8. Run the same workflow manually for `production`.
9. Approve the production GitHub Environment gate.

Do not apply staging or production migrations directly from a laptop. If a migration needs rollback behavior, commit a new forward migration that repairs the schema/data state.

## Mobile

Mobile starts with GitHub Releases, not store distribution.

When `apps/mobile` contains a real Flutter app:

1. Open a pull request with the mobile change.
2. Run the canonical mobile check set locally:

```powershell
cd C:\Users\raouf\projects\eventy360\apps\mobile
.\tool\check_mobile.ps1
```

3. Ensure mobile CI passes, including code generation and localization generation.
4. Merge to `main`.
5. Create and push a release tag:

```bash
git tag mobile-v0.1.0
git push origin mobile-v0.1.0
```

6. Confirm milestone manual validation evidence is complete for the target release candidate.
7. The `Mobile Release` workflow builds an Android release APK and creates a GitHub Release.

Signing, Play Store, and App Store automation are intentionally out of scope for the starter release path.
