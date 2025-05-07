# System Patterns & Architecture: Eventy360

## 1. Overall Architecture

*   **Model**: Jamstack frontend + BaaS backend.
*   **Frontend**: Next.js (App Router) hosted on Vercel.
*   **Backend**: Supabase Platform (PostgreSQL DB, Auth, Storage, Edge Functions, Cron Jobs) hosted on Supabase Cloud.
*   **Communication**: Frontend uses Supabase client libraries (JS) for direct DB interaction (leveraging RLS), Auth, and Storage. Calls to Supabase Edge Functions via HTTPS for specific backend logic/external API interaction (Resend).
*   **Frontend Theming**: Uses Tailwind CSS v4. Base theme colors and fonts are defined in `globals.css` using the `@theme` directive. CSS variables are defined in `:root` and `.dark` within `@layer base` for theme switching logic. `next-themes` manages the application of the `.dark` class to the `<html>` tag. UI components from Flowbite utilize Tailwind utility classes generated from the `@theme` configuration and respond to the dark mode class.

## 2. Key Backend Components & Patterns (Supabase)

*   **Database (PostgreSQL)**:
    *   **Schema**: Relational model with tables like `profiles`, `events`, `submissions`, `subscriptions`, `payments`, `topics`, `email_templates`, `email_log`, `notification_queue`, `wilayas`, `dairas`. Includes `is_extended_profile_complete` flag in `profiles`.
    *   **Data Types**: Extensive use of PostgreSQL `ENUM` types (e.g., `user_type_enum`, `event_status_enum`, `subscription_tier_enum`, `payment_status_enum`) for data integrity.
    *   **Data Seeding**: `wilayas` and `dairas` tables populated initially from `wilayas.json` via a one-time script (Node.js/Python recommended).
    *   **Security**: Row Level Security (RLS) is the primary authorization mechanism. Policies grant users access to their own data, organizers to their event data, and admins broader access based on defined needs. Policies implemented for initial tables (`wilayas`, `dairas`, `profiles`, `subscriptions`, `payments`).
    *   **Automation**: DB Functions & Triggers (PL/pgSQL):
        *   `handle_new_user()`: Triggered by Supabase Auth Hook on new sign-ups to create corresponding profile (dynamically setting `user_type` from signup metadata) and initial trial subscription records.
        *   `handle_payment_verification()`: Triggered by admin updating `payments` status to 'verified'; creates/updates the `subscriptions` record accordingly.
        *   `billing_period_to_interval()`: Helper function used by `handle_payment_verification`.
        *   `is_admin()`: Helper function used within RLS policies to check admin status.
        *   `complete_my_profile()` (RPC): Called by frontend to atomically create/update role-specific extended profile data (e.g., in `researcher_profiles` or `organizer_profiles` via UPSERT) and set `profiles.is_extended_profile_complete` to true. Uses `auth.uid()` internally.
        *   *(Future)* Notification Triggers: Inserts tasks into `notification_queue` upon relevant data changes (e.g., new user, payment verified, submission status update, event change).
    *   **Data Integrity**: Foreign key constraints, `NOT NULL` where applicable.
    *   **Metadata**: `JSONB` used for flexible data like file metadata (`submissions` table).
*   **Authentication**: Supabase Auth for email/password login and session management.
*   **Storage**: Supabase Storage for user uploads (profile pics, event logos, submission files - PDF/DOC/DOCX, 5MB limit).
*   **Edge Functions (Deno Runtime)**:
    *   `send-email`: Internal core logic (not directly exposed) called by other functions/triggers (via queue) to fetch templates from `email_templates`, personalize, and send emails via Resend API. Logs results to `email_log`.
    *   `process-notification-queue` (Scheduled via Supabase Cron - e.g., every minute): Reads pending tasks from `notification_queue`, invokes `send-email`, updates task status.
    *   `check-deadlines` (Scheduled via Supabase Cron - e.g., daily): Queries `events` for upcoming deadlines, inserts tasks into `notification_queue`.
    *   `check-subscriptions-expiry` (Scheduled via Supabase Cron - e.g., daily): Queries `subscriptions` for expired/expiring trials/paid periods, updates status, inserts tasks into `notification_queue`.
    *   `retry-failed-emails` (Scheduled via Supabase Cron - e.g., hourly): Attempts to resend emails marked 'failed' in `email_log` (limited retries).
    *   `purge-deleted-events` (Scheduled via Supabase Cron - e.g., daily/weekly after grace period): Permanently deletes events marked 'canceled' and associated data.
    *   File Upload Handler: Secure endpoint to validate (size/type) and upload files to Storage.
    *   Password Reset Logic: Handles token generation/validation and triggers reset email (likely via `notification_queue`).
*   **Cron Jobs**: Supabase scheduled functions drive asynchronous tasks (queue processing, checks, retries, purging).

## 3. Key System Workflow Patterns

*   **Robust Multi-Step User Onboarding**: A sequential flow enforced by middleware and RLS:
    1.  **Signup**: User registers, `handle_new_user` trigger creates base profile with `user_type` and initial subscription.
    2.  **Email Confirmation**: User must confirm email via link. Middleware blocks access to most of app if email is unconfirmed, redirecting to a notice page.
    3.  **Extended Profile Completion**: After email confirmation, middleware checks `profiles.is_extended_profile_complete`. If false, redirects to a dedicated page to collect role-specific profile details. Submission calls `complete_my_profile` RPC.
    4.  **Full Access**: Granted only after email is confirmed and extended profile is complete.
*   **Manual Verification/Payment (MVP)**: Relies on Admin intervention. Email communication initiates the process, but the state change and subsequent logic (notifications, subscription activation) are triggered by the Admin updating records (`profiles.is_verified`, `payments.status`) via the Admin Panel.
*   **Asynchronous Email Notifications**: Decoupled sending via `notification_queue` table and scheduled processing function (`process-notification-queue`) for reliability.
*   **State Management**: Uses `ENUM` status fields in tables (`events`, `submissions`, `subscriptions`, `payments`) to track lifecycle, updated by user actions, admin actions, or scheduled jobs.
*   **Tier Limit Enforcement**: Checks implemented in backend logic (likely DB functions/triggers during event creation/publishing) based on organizer's `subscriptions` tier/status.
*   **Soft Deletion**: For canceled events, marked via status change, hidden via RLS/queries, then permanently removed by `purge-deleted-events` job.

## 4. Database Design Patterns

*   **Relational Schema**: Clear tables with foreign key relationships (e.g., `profiles` to `researcher_profiles`, `events` to `submissions`).
*   **Internationalization (i18n)**:
    *   **Strategy (Mixed)**:
        *   Use `JSONB` columns for dynamic, user-generated translatable text fields (e.g., `event_name_translations`, `topic_name_translations`, `profile_bio_translations`) to facilitate future multi-language support (`en`, `fr`).
        *   Use standard `TEXT` columns (`name_ar`, `name_other`) for static, seeded location data (`wilayas`, `dairas`).
    *   **JSONB Structure**: Store translations as key-value pairs (e.g., `{"ar": "...", "en": "...", "fr": "..."}`).
    *   **MVP Implementation (JSONB Fields)**: For the MVP, **strictly** only the Arabic (`ar`) key will be populated and queried in JSONB columns. This structure allows future expansion but **mandates** Arabic-only data handling initially.
    *   **MVP Implementation (TEXT Fields)**: `wilayas.name_ar`, `wilayas.name_other`, `dairas.name_ar`, `dairas.name_other` are populated directly during seeding.
    *   **Primary Language**: Arabic (`ar`) is the primary language. Its key **must** be present and populated in JSONB fields for MVP. `name_ar` must be populated for location tables.
    *   **Querying (MVP)**: Application logic **must** query `translations_column ->> 'ar'` for JSONB fields, and `name_ar` for location tables. No other keys are accessed.
    *   **Querying (Future - JSONB Fields)**: When `en`/`fr` are added to JSONB fields, application logic will query the requested locale (e.g., `translations_column ->> 'en'`) and **must** implement fallback logic to Arabic (`translations_column ->> 'ar'`) if the requested locale's value is null or the key is missing.
    *   **Querying (Future - TEXT Fields)**: `name_other` column in `wilayas`/`dairas` will be used for French/English display.
    *   **Indexing**: Utilize GIN indexes on JSONB columns. Standard indexes on `name_ar`, `name_other`.
*   **ENUM Types**: Extensive use of PostgreSQL ENUMs for constrained categorical data (e.g., `user_type_enum`, `event_status_enum`, `submission_status_enum`) ensures data integrity.
*   **Row Level Security (RLS)**: Primary mechanism for enforcing data access rules. Policies defined for initial tables (`wilayas`, `dairas`, `profiles`, `subscriptions`, `payments`) allow user self-management and admin oversight. Helper function `is_admin()` used.
*   **Database Functions & Triggers**: Used for automation and enforcing complex logic directly within the database:
    *   `handle_new_user()`: Triggered on new user authentication to create corresponding profile and initial subscription.
    *   `handle_payment_verification()`: Triggered on payment verification to update/create subscription records. Uses `billing_period_to_interval()` helper.
    *   `complete_my_profile()` (RPC): Called by frontend to atomically create/update role-specific extended profile data (e.g., in `researcher_profiles` or `organizer_profiles` via UPSERT) and set `profiles.is_extended_profile_complete` to true. Uses `auth.uid()` internally.
    *   *(Future)* Notification Queue Triggers: Insert tasks into `notification_queue` on relevant data changes.
*   **Soft Deletes**: Implemented for certain data types (e.g., canceled events) initially, with scheduled functions for eventual permanent deletion.
*   **JSONB for Metadata**: Storing flexible *non-translatable* metadata associated with files (e.g., `abstract_file_metadata`).
*   **Data Seeding**: Initial population of static data like `wilayas` and `dairas` from `wilayas.json` using a one-time script, populating their `name_ar` and `name_other` TEXT columns.

## 5. Key System Workflows & Patterns

*   **Manual Verification (MVP)**: Core processes like user verification and payment confirmation rely on administrator intervention via email communication and subsequent manual updates within the platform's admin interface. Platform actions (e.g., updating `is_verified`, marking `payments` as verified) trigger associated system logic (applying badges, updating subscriptions, sending notifications).
*   **Asynchronous Notifications**: A dedicated `notification_queue` table and scheduled Edge Functions (`process-notification-queue`) handle email sending asynchronously, improving resilience and decoupling email logic from core operations.
*   **Scheduled Tasks (Cron)**: Supabase Cron jobs drive regular maintenance and checks (deadline reminders, subscription expiry, failed email retries, data purging).
*   **Tiered Feature Access**: Logic checks (primarily backend/database level, potentially via RLS or DB functions/triggers) enforce feature limits based on user subscription tier (e.g., number of active events for organizers).
*   **State Management**: Event and Submission lifecycles are managed via status fields (`event_status_enum`, `submission_status_enum`) updated through user actions or automated processes.
*   **Internationalized Validation Schemas**: Zod schemas for forms are defined with a base structure and generated via a function that accepts the `next-intl` translation function (`t`). This allows validation error messages to be easily translated.
    *   Example: `getLoginSchema(t)` returns the Zod schema with messages like `t('Validations.email')`.
*   **Loading State Management**: Provide visual feedback during data fetching and asynchronous operations.
    *   **App Router (Server Components)**: Use Next.js convention `loading.js`/`tsx` files alongside pages for automatic Suspense boundaries.
    *   **Client Components/Forms**: Use React state (`useState`) or library features (e.g., SWR `isLoading`) to conditionally render loaders (spinners, skeletons).
*   **Error Handling**: Standardized approach across the stack.
    *   **Frontend (App Router)**: Use `error.js`/`tsx` for segment-level Server Component errors, `global-error.js`/`tsx` for root layout errors, `notFound()` for missing data.
    *   **Frontend (Client Components)**: Use `try...catch`, state management for errors, user-facing Toasts/Alerts.
    *   **Backend (Edge Functions)**: Use `try...catch`, return structured JSON error responses with appropriate HTTP status codes, log detailed errors.

## 6. Payment Strategy Pattern (MVP)

*   **Offline Payment**: Users initiate payment requests via email.
*   **Manual Admin Verification**: Admins verify payment receipt offline.
*   **Platform Record Keeping**: Admins record payment details (`payments` table) and mark as verified.
*   **Automated Subscription Activation**: A database trigger/function (`handle_payment_verification`) on the `payments` table manages the creation/update of the corresponding `subscriptions` record.
*   **Scheduled Expiry Management**: Cron job (`check-subscriptions-expiry`) handles automatic status updates for expired trials/subscriptions. 