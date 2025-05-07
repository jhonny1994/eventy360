# Project Progress: Eventy360

## Current Status

*   **Phase**: Implementing Robust Multi-Step User Onboarding Flow
*   **Overall Progress**: Core authentication features (Login, Register, Forgot Password, Reset Password) are implemented. A comprehensive plan for a multi-step onboarding flow (email confirmation, profile completion) is in place and is the current focus.

## What Works (Functionality Implemented)

*   Memory Bank files created and refined.
*   Next.js (App Router) project initialized.
*   Essential dependencies installed.
*   Supabase project setup and environment variables configured.
*   `next-intl` configured for Arabic (`ar`) locale and RTL. All known i18n issues resolved.
*   Git repository established.
*   **Full MVP Database Schema Applied**: All required tables (`wilayas`, `dairas`, `profiles`, `subscriptions`, `payments`, `events`, `submissions`, `topics`, `bookmarks`, profile extensions, email tables) and ENUMs created via migrations.
*   **Location Data Seeded**: `wilayas` and `dairas` populated from `wilayas.json` (via user-executed script).
*   **Core DB Automation Implemented**: `handle_new_user` and `handle_payment_verification` functions/triggers created.
*   **Initial RLS Policies Applied**: Security enabled for core tables with basic access rules.
*   **Core Authentication Implemented**:
    *   Setup Supabase Browser Client & Auth Provider (`AuthProvider`, `useAuth` hook).
    *   Implemented Login page (`/login`) with form (`LoginForm`), validation (i18n Zod), loading/error states (Toast, Alert, inline), and redirects.
    *   Implemented Registration page (`/register`) with form (`RegisterForm`), validation (i18n Zod), user type selection (Researcher/Organizer), loading/error states, and success feedback (Toast, Alert).
    *   Implemented Route Protection Middleware (`middleware.ts`) handling unauthenticated/authenticated redirects.
    *   **Implemented Forgot Password page (`/forgot-password`) with form, validation, and i18n.**
    *   **Implemented Reset Password page (`/reset-password`) with form, validation, and i18n.**
    *   **Resolved all i18n issues** related to message loading, namespaces, and file paths.
    *   **Updated `LoginForm.tsx` to redirect to `/profile` after successful login.**

## What's Left to Build (MVP Focus - High-Level)

1.  **Database Implementation (Largely Completed - Ongoing for RLS & New Objects)**
    *   *(New/In Progress)*: Finalize and apply the refined `handle_new_user` trigger (dynamic `user_type`).
    *   *(New/In Progress)*: Add `is_extended_profile_complete` flag to `public.profiles` table (migration).
    *   *(New/In Progress)*: Create `public.complete_my_profile` RPC function (migration).
    *   *(In Progress/Future Task)*: Design and implement comprehensive RLS policies for all tables, including enforcing `is_extended_profile_complete` for feature access.
    *   *(Future Task)*: Implement application-layer query logic for i18n fields (`->> 'ar'`) where needed.

2.  **Robust Multi-Step User Onboarding Flow (Current Focus - Supersedes previous "Authentication & Basic Profiles" sub-tasks)**:
    *   ~~Setup Supabase Browser Client & Auth Provider~~ (Completed)
    *   ~~Create Login Page & Form Component~~ (Completed, redirect updated)
    *   ~~Create Registration Page & Form Component~~ (Completed, success handling to be modified)
    *   ~~Implement Basic Route Protection Middleware~~ (Completed, to be enhanced)
    *   ~~Implement Forgot Password Flow~~ (Completed)
    *   ~~Implement Reset Password Flow~~ (Completed)
    *   ~~Resolve all i18n loading/display issues~~ (Completed)
    *   **(In Progress)** Modify `RegisterForm.tsx` success handling (no redirect, persistent message, resend email option).
    *   **(Todo)** Create `/[locale]/auth/confirm-email-notice/page.tsx` (for users with unconfirmed email).
    *   **(Todo)** Create `/[locale]/auth/complete-profile/page.tsx` & `ui/CompleteProfileForm.tsx` (dynamic form for role-specific profile data, calls RPC, redirects to `/profile`). Includes Zod schemas for profile data.
    *   **(Todo)** Enhance `middleware.ts` to enforce sequential flow (Authenticated -> Email Confirmed -> Profile Complete) with redirects and profile state checks.
    *   **(Implied)** Ensure **strict** Arabic/RTL compliance in all new UI and data handling.

3.  **User Profile Viewing & Editing (Post-Onboarding)**:
    *   *(Todo - Follows onboarding)* Create Profile Data Fetching Hook (efficiently gets `profiles` and role-specific extended profile).
    *   *(Todo - Follows onboarding)* Create Profile View Component & Page (displays combined profile data).
    *   *(Todo - Follows onboarding)* Create Profile Edit Form & Functionality (allows users to edit their common and role-specific profile data after initial completion).

4.  **Manual Verification & Payment/Subscription Workflow (Core Logic)**:
    *   Implement Admin Panel UI controls to update user `is_verified` status.
    *   Implement Admin Panel UI to record payment details (`payments` table) and mark status as `verified`.
    *   Ensure `handle_payment_verification` trigger correctly updates/creates `subscriptions` record.
    *   Display verification status/badge on user profiles.
    *   Implement scheduled function `check-subscriptions-expiry`.
    *   Implement loading/error states for Admin actions.

5.  **Event Management (Core)**:
    *   Implement Event creation form for Organizers (respecting tier limits). Include form validation, loading/error states.
    *   Implement public Event listing and detail pages, including `loading.tsx` and `error.tsx` boundaries.
    *   Implement Organizer dashboard view for their events, with loading/error states.

6.  **Submission System (Core)**:
    *   Implement Submission form for paid Researchers (abstract upload). Include validation, loading/error states for submission & file upload.
    *   Implement file upload logic (client-side validation + Edge Function handler for Supabase Storage) with progress/error feedback.
    *   Implement Organizer view for submissions (list, download files, update status, add rejection feedback), with loading/error states.
    *   Implement Researcher view for their submission status, with loading/error states.

7.  **Notification System (Core)**:
    *   Setup `email_templates`, `email_log`, `notification_queue` tables.
    *   Populate `email_templates` with **strictly** Arabic content in the `ar` key of the JSONB columns.
    *   Implement DB triggers to populate `notification_queue` for key events.
    *   Implement `send-email` internal Edge Function logic using Resend (fetching **only** `ar` text from templates), including error handling and logging to `email_log`.
    *   Implement `process-notification-queue` scheduled Edge Function, including error handling.

8.  **Admin Panel (MVP Features)**:
    *   Implement basic CRUD/Management interfaces as defined in `projectbrief.md`. Input/Display **strictly** Arabic content only where applicable (e.g., Topic names, Email templates `ar` key).
    *   Ensure all Admin actions have appropriate loading indicators and error feedback.

9.  **Deployment & CI/CD**: Setup Vercel deployment, Supabase environment variables, basic GitHub Actions workflow.

## Known Issues & Blockers

*   None currently identified.

## Completed Milestones

*   Memory Bank Initialized & Refined
*   Core Project Setup Completed
*   **Full MVP DB Schema & Automation Defined & Applied** (Migrations: `init_core_schema`, `implement_handle_new_user_trigger`, `implement_handle_payment_verification_trigger`, `define_initial_rls_policies`, `define_secondary_schema`) - [Current Date]
*   **Location Data Seeded** (Manually by user) - [Current Date]
*   **Styling & Theme Implementation**: Upgraded to Tailwind v4, integrated Flowbite, implemented custom theme with dynamic light/dark mode using `next-themes`.
*   **Core Authentication Flows (Login, Register, Forgot/Reset Password) with i18n Fully Implemented.**
*   **Planned Robust Multi-Step User Onboarding Flow.** 