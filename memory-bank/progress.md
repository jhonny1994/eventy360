# Project Progress: Eventy360

## Current Status

*   **Phase**: Initialization & Setup
*   **Overall Progress**: Memory Bank refined. Project structure setup is the next immediate step.

## What Works (Functionality Implemented)

*   Memory Bank files created and refined with project-specific details.

## What's Left to Build (MVP Focus - High-Level)

1.  **Core Project Setup**:
    *   Initialize Next.js (App Router) project.
    *   Setup Supabase project (DB, Auth, Storage).
    *   Implement base Tailwind CSS configuration with Shadcn UI.
    *   Configure `next-intl` for Arabic (`ar`) locale and RTL **only**. Static UI text goes in `messages/ar.json`.
    *   Establish Git repository on GitHub and initial commit.
2.  **Database Implementation**:
    *   Define and apply initial DB schema using Supabase migrations. Use `JSONB` columns (e.g., `name_translations`) for dynamic translatable fields; use `TEXT` columns (`name_ar`, `name_other`) for `wilayas`/`dairas`.
    *   Create seeding script (Node.js/Python) to populate `wilayas` and `dairas` (`name_ar`, `name_other`). **Populate only `ar` key for JSONB fields in other tables for MVP.**
    *   Implement DB functions: `handle_new_user`, `handle_payment_verification`.
    *   Define initial RLS policies.
    *   Implement query logic (in application layer) using `->> 'ar'` for JSONB fields and selecting `name_ar` for location tables for MVP.
3.  **Authentication & Basic Profiles**:
    *   Implement Supabase Auth for email/password registration and login.
    *   Create basic profile pages (view/edit) for Researcher and Organizer roles, inputting/displaying Arabic text only. Location selection uses seeded `wilayas`/`dairas` data (displaying `name_ar`).
    *   Implement loading state UI (e.g., skeletons) for profile data fetching.
    *   Implement error handling UI (e.g., toasts) for profile updates.
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
    *   Populate `email_templates` with Arabic content in the `ar` key of the JSONB columns.
    *   Implement DB triggers to populate `notification_queue` for key events.
    *   Implement `send-email` internal Edge Function logic using Resend (fetching `ar` text from templates), including error handling and logging to `email_log`.
    *   Implement `process-notification-queue` scheduled Edge Function, including error handling.
8.  **Admin Panel (MVP Features)**:
    *   Implement basic CRUD/Management interfaces as defined in `projectbrief.md`. Input/Display Arabic content only where applicable (e.g., Topic names, Email templates).
    *   Ensure all Admin actions have appropriate loading indicators and error feedback.
9.  **Deployment & CI/CD**: Setup Vercel deployment, Supabase environment variables, basic GitHub Actions workflow.

## Known Issues & Blockers

*   None currently identified.

## Completed Milestones

*   Memory Bank Initialized & Refined ([Current Date]) 