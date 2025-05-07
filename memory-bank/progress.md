# Project Progress: Eventy360

## Current Status

*   **Phase**: Debugging Multi-Step User Onboarding Flow
*   **Overall Progress**: Core authentication, DB setup, and UI for confirm-email/complete-profile pages are mostly done. However, the middleware logic intended to enforce the onboarding sequence is not working correctly after login.

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
    *   Implemented Login page (`/login`) with form (`LoginForm`), validation (i18n Zod), loading/error states (Toast, Alert, inline).
    *   Implemented Registration page (`/register`) with form (`RegisterForm`), validation (i18n Zod), user type selection (Researcher/Organizer), loading/error states.
    *   Implemented Route Protection Middleware (`middleware.ts`) handling basic unauthenticated/authenticated redirects.
    *   **Implemented Forgot Password page (`/forgot-password`) with form, validation, and i18n.**
    *   **Implemented Reset Password page (`/reset-password`) with form, validation, and i18n.**
    *   **Resolved all i18n issues** related to message loading, namespaces, and file paths.
    *   **Updated `LoginForm.tsx` to attempt redirect to `/profile` after successful login.**
*   **(NEW)** Implemented Database Prerequisites for Onboarding (refined `handle_new_user`, `is_extended_profile_complete` flag, `complete_my_profile` RPC).
*   **(NEW)** Modified `RegisterForm.tsx` for onboarding flow (persistent message, resend email option).
*   **(NEW)** Implemented `/[locale]/confirm-email/page.tsx` (displays notice for unconfirmed email, shows success state, button links to complete-profile).
*   **(NEW)** Implemented `/[locale]/callback/route.ts` for handling email confirmation links.
*   **(NEW)** Implemented `/[locale]/complete-profile/page.tsx` and `ui/CompleteProfileForm.tsx` (including schemas, conditional rendering, RPC call).
*   **(NEW)** Updated DB schema to enforce `NOT NULL` constraints on required profile fields.

## What's Left to Build (MVP Focus - High-Level)

1.  **Database Implementation (Largely Completed)**
    *   *(Future Task)*: Design and implement comprehensive RLS policies for all tables, including enforcing `is_extended_profile_complete` for feature access.

2.  **Robust Multi-Step User Onboarding Flow (Debugging)**:
    *   ~~Setup Supabase Browser Client & Auth Provider~~ (Completed)
    *   ~~Create Login Page & Form Component~~ (Completed)
    *   ~~Create Registration Page & Form Component~~ (Completed)
    *   ~~Implement Forgot Password Flow~~ (Completed)
    *   ~~Implement Reset Password Flow~~ (Completed)
    *   ~~Resolve all i18n loading/display issues~~ (Completed)
    *   ~~Modify `RegisterForm.tsx` success handling~~ (Completed)
    *   ~~Create `/[locale]/confirm-email/page.tsx`~~ (Completed)
    *   ~~Create `/[locale]/auth/callback/route.ts`~~ (Completed)
    *   ~~Create `/[locale]/complete-profile/page.tsx` & `ui/CompleteProfileForm.tsx`~~ (Completed)
    *   ~~Update Database Schema for required fields~~ (Completed)
    *   **(Blocked/Debugging)** Enhance `middleware.ts` to enforce sequential flow (Authenticated -> Email Confirmed -> Profile Complete) **reliably after login**. The logic exists but isn't executing correctly for users needing profile completion.
    *   **(Implied)** Ensure **strict** Arabic/RTL compliance in all new UI and data handling.

3.  **User Profile Viewing & Editing (Post-Onboarding)**:
    *   *(Todo - Follows onboarding fix)* Create Profile Data Fetching Hook (efficiently gets `profiles` and role-specific extended profile).
    *   *(Todo - Follows onboarding fix)* Create Profile View Component & Page (displays combined profile data).
    *   *(Todo - Follows onboarding fix)* Create Profile Edit Form & Functionality (allows users to edit their common and role-specific profile data after initial completion).

4.  **Manual Verification & Payment/Subscription Workflow (Core Logic)**: (Future Task)
5.  **Event Management (Core)**: (Future Task)
6.  **Submission System (Core)**: (Future Task)
7.  **Notification System (Core)**: (Future Task)
8.  **Admin Panel (MVP Features)**: (Future Task)
9.  **Deployment & CI/CD**: (Future Task)

## Known Issues & Blockers

*   **(BLOCKER)** **Middleware Incorrect Redirect:** Authenticated users with confirmed email but incomplete profiles (`is_extended_profile_complete=false`) are incorrectly routed to `/profile` after login, instead of `/complete-profile`. Debugging logs added to `middleware.ts` did not appear in the server console for the `/profile` request, suggesting the middleware is not running/executing as expected for this path transition.
*   **(Minor Console Error)** `Route "/[locale]/callback" used `params.locale`. `params` should be awaited...` appears in console after callback, but doesn't seem to break functionality (Needs investigation later).

## Completed Milestones

*   Memory Bank Initialized & Refined
*   Core Project Setup Completed
*   **Full MVP DB Schema & Automation Defined & Applied**
*   **Location Data Seeded**
*   **Styling & Theme Implementation**
*   **Core Authentication Flows (Login, Register, Forgot/Reset Password) with i18n Fully Implemented.**
*   **Planned Robust Multi-Step User Onboarding Flow.**
*   **Implemented Database Prerequisites for Onboarding.**
*   **Modified `RegisterForm.tsx` for onboarding.**
*   **Implemented `confirm-email` notice page & success state.**
*   **Implemented email confirmation callback route (`/[locale]/callback/route.ts`).**
*   **Implemented `complete-profile` page and form.**
*   **Updated DB Schema constraints.**

## Feature: Robust Multi-Step User Onboarding Flow

**Overall Goal:** Guide users through a seamless process from initial signup to a fully functional profile, ensuring all necessary data is collected at the appropriate stages and access to platform features is managed based on profile completeness.

**Status:** Blocked (Debugging Middleware)

### Phase 1: Database Prerequisites
- **Status:** DONE
- **Task 1.1:** Add `is_extended_profile_complete` (boolean, default `false`) to `profiles` table. (DONE - Verified)
- **Task 1.2:** Create/Update `handle_new_user` trigger to set `is_extended_profile_complete` to `false` for new users. (DONE - Verified)
- **Task 1.3:** Create `researcher_profiles` table. (DONE - Verified)
- **Task 1.4:** Create `organizer_profiles` table. (DONE - Verified)
- **Task 1.5:** Create `admin_profiles` table. (DONE - Verified)
- **Task 1.6:** Create RPC function `complete_my_profile(profile_data JSONB)`.
    - Takes user-specific profile data.
    - Upserts into `researcher_profiles` or `organizer_profiles` based on `profiles.user_type`.
    - Updates `profiles.is_extended_profile_complete` to `true`.
    - Returns success/failure. (DONE - Verified)

### Phase 2: Frontend - Signup Modification
- **Status:** DONE
- **Task 2.1:** Modify `RegisterForm.tsx` (`src/app/[locale]/register/ui/RegisterForm.tsx`).
    - On successful signup, DO NOT redirect to `/profile` immediately.
    - Show a persistent success message (e.g., using a toast or an inline alert) informing the user that a confirmation email has been sent.
    - Include a "Resend Confirmation Email" button that appears after a short delay or on user action if the message is dismissible. (DONE - Verified, redirect to callback handled, email sent message shown on confirm-email page after callback)

### Phase 3: Frontend - New Pages for Email Confirmation & Profile Completion
- **Status:** DONE (UI/Logic Implemented, but flow is broken)
- **Task 3.1:** Create `/[locale]/confirm-email/page.tsx`.
    - Handles the Supabase callback if `code` is present (now handled by `/[locale]/callback/route.ts`).
    - Displays messages: "Confirming email...", "Email confirmed successfully! You can now complete your profile.", or "Invalid or expired confirmation link."
    - If email is confirmed, provides a clear "Continue to Complete Profile" button linking to `/[locale]/complete-profile`. (DONE - Verified, button now links to complete-profile)
- **Task 3.2:** Create `/[locale]/complete-profile/page.tsx`.
    - **Status:** In Progress (Form UI and basic logic implemented, schema updated, DB constraints updated. Needs thorough testing).
    - Fetches user data (including `user_type` and `is_extended_profile_complete` from `profiles`).
    - If `is_extended_profile_complete` is true, redirect to `/[locale]/profile`.
    - Renders `CompleteProfileForm.tsx`.
    - **Sub-Task 3.2.1:** Define Zod schemas for researcher and organizer profiles (in `src/lib/schemas/profile.ts`). (DONE, aligned with new DB constraints)
    - **Sub-Task 3.2.2:** Create `CompleteProfileForm.tsx` UI (`src/app/[locale]/complete-profile/ui/CompleteProfileForm.tsx`). (DONE, initial values and error handling updated)
        - Dynamically renders fields based on `user_type`.
        - Uses Zod schemas for validation.
        - On submit, calls the `complete_my_profile` RPC.
        - On success, redirects to `/[locale]/profile` and shows success toast.
        - Handles RPC errors and shows error messages.
    - **Sub-Task 3.2.3:** Update Database Schema (`define_secondary_schema.sql`) to enforce `NOT NULL` constraints for logically required fields in `researcher_profiles`, `organizer_profiles`, `admin_profiles`, and `events`. (DONE)

### Phase 4: Middleware Enhancements for Profile Completion
- **Status:** Blocked / In Debugging
- **Task 4.1:** Update `middleware.ts`.
    - **Issue:** Logic to redirect users with `profile.is_extended_profile_complete = false` to `/[locale]/complete-profile` is not executing correctly immediately after login when navigating to `/profile`.

### Phase 5: Frontend - Profile Page (`/[locale]/profile`)
- **Status:** Not Started (Blocked by middleware issue)
- **Task 5.1:** Develop/Update `ProfilePage.tsx` (`src/app/[locale]/profile/page.tsx`).
    - Displays user's full profile information based on their `user_type` and data from `profiles`, `researcher_profiles`, or `organizer_profiles`.
    - Provides options to edit profile information (future enhancement, separate feature).

### Phase 6: Testing & Refinements
- **Status:** Not Started (Blocked by middleware issue)
- **Task 6.1:** End-to-end testing of the entire onboarding flow.
- **Task 6.2:** UX review and adjustments for clarity and smoothness.
- **Task 6.3:** Code cleanup and optimization.

---

## Completed Features:

### Email Confirmation Redirect Issue
- **Status:** DONE
- **Issue:** User redirected to `http://localhost:3000/?code=...` (404) after email confirmation.
- **Resolution:**
    - Modified `RegisterForm.tsx` to include `emailRedirectTo: window.location.origin + '/[locale]/callback'`.
    - Created `src/app/[locale]/callback/route.ts` to handle the code exchange with Supabase and redirect to `/[locale]/confirm-email`.
    - Updated `ConfirmEmailPage.tsx` to remove auto-redirect, show success message longer, and include a "Continue" button to `/[locale]/complete-profile`.

### Auth Pages Code Cleanup
- **Status:** DONE
- **Task:** Removed unused imports and minor code refinements in `LoginForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`. 