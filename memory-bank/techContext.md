# Technical Context: Eventy360

## 1. Core Technologies

*   **Frontend Framework**: Next.js (App Router)
*   **UI Language**: React with TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI
*   **Internationalization (i18n)**: `next-intl` (Configured for Arabic `ar` locale **only in MVP**, supporting RTL via `dir="rtl"` attribute on `<html>` or relevant container). English/French locales to be added later.
*   **Forms**: React Hook Form
*   **Validation**: Zod (Used with React Hook Form for client-side and potentially Edge Function input validation).
*   **Backend Platform**: Supabase (Cloud hosted)
    *   **Database**: PostgreSQL (Version provided by Supabase), utilizing ENUMs, Functions (PL/pgSQL), Triggers, and Row Level Security (RLS) policies.
    *   **Authentication**: Supabase Auth (Email/Password)
    *   **File Storage**: Supabase Storage
    *   **Serverless Functions**: Supabase Edge Functions (Deno Runtime, TypeScript)
    *   **Scheduling**: Supabase Cron Jobs
*   **Email Service**: Resend (API integrated via `send-email` Edge Function logic).

## 2. Development Environment & Setup

*   **Package Manager**: `npm` (or `yarn`, confirm project setup)
*   **Node.js**: Specify required version range (e.g., >= 18.x).
*   **Supabase CLI**: Required for local development (DB migrations, local function testing, environment management).
*   **Code Repository**: Git, hosted on GitHub.
*   **Environment Variables**: Managed via `.env.local` (ignored by Git) for local development and Vercel/Supabase UI for deployment.
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY` (Server-side/Edge Function use only)
    *   `RESEND_API_KEY` (Server-side/Edge Function use only)
    *   `SUPABASE_DB_PASSWORD` (For local dev via Supabase CLI)
    *   Potentially others (e.g., JWT secret if needed beyond Supabase Auth defaults).

## 3. Deployment & Infrastructure

*   **Frontend**: Vercel (connected to GitHub repo).
*   **Backend**: Supabase Cloud.
*   **CI/CD**: GitHub Actions workflow:
    *   Triggered on push/merge to main branch.
    *   Builds Next.js application.
    *   Deploys frontend to Vercel.
    *   (Optional/Manual initially) Deploys Supabase migrations/functions if changes detected.

## 4. Key Technical Constraints & Considerations

*   **Arabic Language & RTL**: Requires careful implementation in UI components, CSS, and `next-intl` configuration.
*   **Manual MVP Processes**: Backend logic must correctly handle state changes initiated by admin actions reflecting offline verification/payment.
*   **RLS Complexity**: Requires thorough design and testing of policies for all user roles and data interactions.
*   **Edge Function Environment**: Deno runtime, specific available APIs, cold starts, execution limits (time/memory).
*   **Database Migrations**: Strict adherence to using Supabase CLI (`supabase db diff`, `supabase migration new`, apply locally/remotely) for schema evolution.
*   **State Management (Frontend)**: Choose appropriate strategy (e.g., React Context, Zustand, Valtio) if global state beyond basic props/hooks is needed. Libraries like SWR/TanStack Query manage their own request state.
*   **Loading State Strategy**:
    *   **App Router (`loading.js`/`tsx`)**: Use the built-in Next.js file convention to show instant loading UI (e.g., Skeletons from Shadcn UI) while Server Component data loads. Define `loading.tsx` in relevant route segments.
    *   **Client Components (Data Fetching)**: Use loading states provided by data fetching libraries (e.g., `isLoading` from SWR/TanStack Query) or manual `useState` hooks to conditionally render loading indicators (spinners, skeletons).
    *   **Client Components (Mutations/Forms)**: Use `useState` (e.g., `isSubmitting`) to track the state of form submissions or other mutations. Disable buttons and show indicators while loading.
*   **Error Handling Strategy**:
    *   **Frontend (App Router Boundaries)**: Implement `error.tsx` (must be Client Component) in route segments to catch errors from nested Server Components, display fallback UI (use Shadcn Alert/Toast), and provide a `reset` function. Implement `global-error.tsx` for the root layout.
    *   **Frontend (Not Found)**: Use `notFound()` from `next/navigation` within Server Components when data fetching returns no result for a required resource (e.g., viewing a specific event by ID).
    *   **Frontend (Client Components)**: Use `try...catch` in event handlers/async functions. Manage error state with `useState`. Display errors using Shadcn Toast or Alert components. Data fetching libraries (SWR/TanStack Query) provide `error` objects.
    *   **Frontend (Forms)**: Use React Hook Form with Zod for client-side validation errors shown inline. Handle submission errors via state management as above.
    *   **Backend (Edge Functions)**: Wrap logic in `try...catch`. Return standardized JSON error objects (`{ "error": "Error message" }`) with appropriate HTTP status codes (e.g., 400, 401, 403, 404, 500). Use `console.error` for logging detailed errors to Supabase logs.
    *   **Backend (Input Validation)**: Use Zod or similar validation within Edge Functions for request bodies/params, return 400 status on failure.
*   **Security**: Protect service role keys, manage RLS policies carefully, validate inputs (client & server), handle file uploads securely.

## 5. Data Handling Specifics

*   **Translatable Content (Dynamic)**: Fields like event names/descriptions, topic names, profile bios use `JSONB` columns (e.g., `event_name_translations JSONB`).
    *   JSONB structure designed for `{"ar": "...", "en": "...", "fr": "..."}`.
    *   **MVP Implementation**: Only the `ar` key is populated and queried (e.g., `{"ar": "نص عربي"}`).
    *   Application layer queries `translations_column ->> 'ar'` for MVP.
    *   **Fallback Mechanism (Future Requirement for JSONB fields)**: When `en`/`fr` support is added, queries must implement fallback to `ar` if the requested locale is missing.
        ```sql
        -- Example for future use
        SELECT COALESCE(translations_column ->> :user_locale, translations_column ->> 'ar') AS translated_text FROM ...;
        ```
    *   Data input forms for MVP provide fields only for Arabic content for these fields.
*   **Location Data (`wilayas`, `dairas`)**: Static data seeded from `wilayas.json`.
    *   Uses standard `TEXT` columns: `name_ar` and `name_other`.
    *   Seeding script populates these columns directly from `arabic_name` and `name` fields in the JSON.
    *   MVP Application queries `name_ar` for display.
    *   Future i18n will use the `name_other` field for French/English display.
*   **File Uploads**: Validate file type (PDF, DOC, DOCX) and size (max 5MB) on both client and server (Edge Function). Store files in Supabase Storage under structured paths (e.g., `submissions/{event_id}/{submission_id}/abstract.pdf`). Store URL and potentially metadata (`filesize`, `mimetype`, `uploaded_at`) in the database (`submissions` table fields). 