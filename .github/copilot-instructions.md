# Eventy360 AI Instructions

## Active Development: V2 Overhaul
**CRITICAL:** We are currently executing the "V2 Overhaul" under strict protocol.
- **Strategy:** "Rename & Replace".
  - Legacy code is in `src/app-v1` and `src/components-v1`. **READ ONLY.**
  - New code goes into `src/app` and `src/components`.
  - **NEVER** import components/utils from `*-v1` folders into new V2 code. Copy and refactor instead.
- **Database:** "Additive Only".
  - Never delete/rename columns or tables.
  - New migrations must be applied to `main` branch first, then rebased into `v2-overhaul`.
  - After DB changes: `npx supabase gen types typescript --local > src/database.types.ts`.

## Tech Stack
- **Framework:** Next.js 16+ (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS 4, Flowbite React.
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions).
- **i18n:** `next-intl`.
- **Package Manager:** `pnpm`.

## Key Patterns & Conventions

### UI & Design System (Strict)
- **Source of Truth:** Follow `docs/v2-overhaul/DESIGN_SYSTEM.md` for all UI decisions.
- **Styling:** Tailwind CSS v4 + Flowbite React.
- **Icons:** Lucide React.
- **Principles:**
  - **Minimalist:** "Modern Academic" aesthetic. Content first.
  - **DRY:** Reuse components. Do not invent new styles.
  - **RTL-First:** Use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) instead of physical ones (`ml-`, `pl-`, `text-left`).
  - **Dark Mode:** Always implement `dark:` variants using semantic tokens (e.g., `bg-surface dark:bg-zinc-900`).

### Supabase Access
- **Server Components:**
  ```typescript
  import { createServerSupabaseClient } from "@/lib/supabase/server";
  const supabase = await createServerSupabaseClient();
  ```
- **Client Components:**
  ```typescript
  import { createClient } from "@/lib/supabase/client";
  const supabase = createClient();
  ```
- **Middleware:** Use `updateSession` from `@/lib/supabase/middleware`.

### Internationalization (i18n)
- **Strict Rule:** No hardcoded strings in UI.
- **Usage:**
  ```typescript
  import { useTranslations } from 'next-intl';
  const t = useTranslations('MyComponent'); // Key matches JSON structure
  <h1>{t('title')}</h1>
  ```
- **Structure:** Use `messages/{locale}.json`. Prefer creating a `v2` namespace for new features to avoid legacy clutter.

### Routing & Navigation
- Use `Link` from `next-intl/link` (or project wrapper) to handle locale prefixes automatically.
- **Redirects:** Ensure unauthenticated access to protected `/v2/*` routes redirects to the correct login page.

## Workflows
- **Task Management (CRITICAL):**
  - **Must Use MCP:** You must actively manage your work using the `mcp_agentic-tools`.
  - **Workflow:**
    1. Call `list_tasks` to find the next pending task.
    2. Call `update_task` to mark it `in-progress`.
    3. Execute the work.
    4. Call `update_task` to mark it `done`.
  - **Granularity:** If a task is too large, use `create_subtask` to break it down.
- **Testing:** Do not generate test files (unit, integration, e2e) unless explicitly requested.
- **Build:** `pnpm build`
- **Dev:** `pnpm dev`
- **Lint:** `pnpm exec eslint`
- **Type Check:** `pnpm prune` (ts-prune) or `tsc --noEmit`

## AI Behavior Rules
1. **Strict Protocol Adherence:** You are forbidden from modifying `src/app-v1` or `src/components-v1` (Read-Only).
2. **Database Safety:** You are forbidden from generating destructive migrations (drops/renames).
3. **Route Normalization:** Ensure no `/v2/` prefixes leak into the final user-facing URLs. The goal is to replace the root.
4. **Autonomy:** You are a senior engineer. Manage your own task state via MCP. Do not wait for the user to update the tracker.
