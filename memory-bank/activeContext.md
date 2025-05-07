# Active Context

## Current Focus

The primary focus is now on implementing a **Robust Multi-Step User Onboarding Flow**. This flow will ensure users sign up, confirm their email, and complete an extended profile before gaining full access to the platform's features. This supersedes the previous piecemeal approach to profile completion.

## Recent Changes

*   Completed the **Database Implementation** phase.
    *   Initial schema, core automation (triggers/functions), and RLS policies applied.
    *   Secondary schema migration applied, defining all remaining MVP tables and ENUMs.
    *   Location data (`wilayas`/`dairas`) seeded manually by user.
*   Refactored Styling & Theming:
    *   Upgraded to Tailwind CSS v4.
    *   Replaced Shadcn UI with Flowbite.
    *   Implemented new custom theme palette via `@theme` and CSS variables in `globals.css`.
    *   Configured `next-themes` for dynamic light/dark mode switching.
*   **Completed Core Authentication Implementation (Login, Register, Forgot/Reset Password):**
    *   Setup Supabase Browser Client & Auth Provider.
    *   Implemented Login, Registration, Forgot Password, and Reset Password pages with forms, validation, and i18n.
    *   Implemented basic Route Protection Middleware.
    *   Refined `handle_new_user` trigger concept to dynamically use `user_type` from signup metadata.
    *   Updated `LoginForm.tsx` to redirect to `/profile` after login.
*   **Resolved all outstanding Internationalization (i18n) issues** for existing auth pages.
*   Updated Memory Bank (`progress.md`, `systemPatterns.md`, `techContext.md`) to reflect DB completion and styling refactor.
*   **Planned a comprehensive multi-step onboarding flow.**

## Next Steps

Implement the **Robust Multi-Step UserOnboarding Flow** by tackling the following phases:

1.  **Database Prerequisites:**
    *   Finalize and apply the refined `handle_new_user` trigger.
    *   Add `is_extended_profile_complete BOOLEAN NOT NULL DEFAULT false` to `public.profiles` table via migration.
    *   Create and apply the `public.complete_my_profile` RPC function (idempotent UPSERT to role-specific table + update to `profiles.is_extended_profile_complete`).
2.  **Frontend - Signup Modification:**
    *   Modify `RegisterForm.tsx`: On success, do not redirect; show persistent message about email confirmation and offer a "Resend Confirmation Email" button.
3.  **Frontend - New Pages:**
    *   Create `/[locale]/auth/confirm-email-notice/page.tsx`: Displays notice for unconfirmed email, "Resend Confirmation" button, "Logout" button.
    *   Create `/[locale]/auth/complete-profile/page.tsx` & `ui/CompleteProfileForm.tsx`: Dynamic form based on `user_type` (from `profiles`), calls `complete_my_profile` RPC, redirects to `/[locale]/profile` on success. Includes step indication.
4.  **Middleware Enhancements:**
    *   Update `middleware.ts` to enforce the sequential flow: Authenticated -> Email Confirmed -> Profile Complete. Implement redirects to notice/completion pages as needed. Fetch `profileData (user_type, is_extended_profile_complete)` for decision making.
5.  **Row Level Security (RLS):**
    *   Design and implement RLS policies for `profiles`, role-specific profile tables, and the `complete_my_profile` RPC.
    *   Enforce `is_extended_profile_complete = true` in RLS for accessing core application features.
6.  **Thorough Testing:**
    *   Conduct end-to-end testing of all onboarding paths, redirects, states, error handling, and RLS policies.

## Active Decisions & Considerations

*   The onboarding flow is sequential and enforced by middleware: Signup -> Email Confirmation -> Extended Profile Completion -> Full Access.
*   A new flag `is_extended_profile_complete` in `public.profiles` will track profile completion status.
*   A new RPC function `public.complete_my_profile` will handle the atomic creation/update of role-specific profile data and the setting of the `is_extended_profile_complete` flag. This RPC will be idempotent (using UPSERT).
*   The `handle_new_user` trigger correctly sets the `user_type` in `public.profiles` based on data provided during signup.
*   RLS policies are critical and will be implemented to secure data and enforce the onboarding state for feature access.
*   All new UI will adhere to existing Flowbite/Tailwind styling, Arabic-first, and RTL requirements.
*   Supabase "Site URL" must be correctly configured for email confirmation redirects.
*   Clear user messaging and feedback (loading states, errors, success notifications using Toasts/Alerts) are paramount throughout the flow.
*   The tasks previously listed for "Create Profile Data Fetching Hook", "Create Profile View Component & Page", "Create Profile Edit Form", and "Add Role-Specific Fields to Edit Form" are now largely encompassed or transformed by the "Complete Profile" page implementation and the subsequent full profile view/edit features (which will be planned after this onboarding flow is complete). 