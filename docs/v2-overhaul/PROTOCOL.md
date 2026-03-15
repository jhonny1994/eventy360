# V2 Overhaul: Feature Branch Protocol

**Branch Name:** `v2-overhaul`
**Parent Branch:** `main`
**Strategy:** Rename & Replace + Additive Database

This document defines the strict protocol for developing the `v2` UI overhaul. All developers must adhere to these rules to ensure a clean, conflict-free history and a stable `main` branch.

---

## 1. Core Strategy: "Rename & Replace"

We are **not** building v2 in a subdirectory. We are replacing the application root.

### The Procedure (Executed in Phase 1)
1.  **Rename v1:**
    *   `src/app` -> `src/app-v1`
    *   `src/components` -> `src/components-v1`
2.  **Create v2:**
    *   Create new `src/app` (This is v2)
    *   Create new `src/components` (This is v2)
3.  **Reference:**
    *   Use `src/app-v1` and `src/components-v1` as read-only references.
    *   **DO NOT** import components from `*-v1` into the new `src`. Copy and refactor if necessary, but prefer rebuilding from scratch with new UI patterns.

---

## 2. Database Strategy: "Additive Only"

The `v2-overhaul` branch must **never** contain database migrations that break `v1`.

### Rules
1.  **Additive Changes Only:** You may add tables (e.g., `notifications`) or nullable columns. You may **not** rename columns, delete columns, or change constraints in a way that breaks existing queries.
2.  **Apply to Main Immediately:**
    *   When a DB change is needed (e.g., creating the `notifications` table), create the migration on a separate branch (e.g., `feat/notifications-schema`).
    *   Merge that branch into `main` **immediately**.
    *   Rebase `v2-overhaul` on `main` to pick up the changes.
    *   **Reason:** This prevents "schema drift" and ensures `v1` (production) is always compatible with the underlying DB, even if it doesn't use the new tables yet.
3.  **Type Generation:**
    *   After applying a migration, run: `npx supabase gen types typescript --local > src/database.types.ts`
    *   Commit the updated types.

---

## 3. Middleware & Routing

The `middleware.ts` file is shared between v1 and v2.

### Rules
1.  **Do Not Break v1:** Existing logic for `/login`, `/profile`, etc., must remain untouched.
2.  **v2 Specifics:**
    *   Add specific checks for `/v2/*` routes if they diverge from v1 logic.
    *   Ensure unauthenticated access to `/v2` routes redirects to `/v2/login` (once implemented), not the v1 `/login`.
    *   Update `subscriptionGuardsConfig` to include v2 paths (e.g., `/v2/organizer/manage`).

---

## 4. Coding Standards (Strict)

### Supabase Client
*   **Server Components:**
    ```typescript
    import { createServerSupabaseClient } from "@/lib/supabase/server";
    const supabase = await createServerSupabaseClient();
    ```
*   **Client Components:**
    ```typescript
    import { createClient } from "@/lib/supabase/client";
    const supabase = createClient();
    ```
*   **Middleware:**
    *   Use `updateSession` from `@/lib/supabase/middleware`.

### Environment Variables
*   Use `process.env.NEXT_PUBLIC_*` for client-side.
*   Use `process.env.*` for server-side.
*   **Edge Functions:** Use `Deno.env.get("VAR_NAME")`.
*   **Critical Vars:**
    *   `ADMIN_INVITE_REDIRECT_URL`: Ensure this points to the correct destination.

### Internationalization (i18n)
*   **New Structure:** Use `messages/v2.json` (or a `v2` namespace in `ar.json` if preferred) to avoid the "messy" v1 strings.
*   **Strictness:** No hardcoded strings. All text must be in the translation file.

---

## 5. Git Workflow

### Daily Routine
1.  `git checkout v2-overhaul`
2.  `git fetch origin main`
3.  `git rebase origin/main`
    *   *Resolve conflicts immediately. This is crucial to avoid a "merge hell" at the end.*
4.  `git push origin v2-overhaul --force-with-lease` (required after rebase)

### Merging to Main (End Game)
*   When v2 is complete:
    1.  Delete `src/app-v1` and `src/components-v1`.
    2.  Squash and Merge `v2-overhaul` into `main`.
