# Active Context

## Current Focus

With the internationalization issues for Forgot Password and Reset Password pages resolved, the immediate focus shifts to completing the remaining items in the **Authentication & Basic Profiles** phase.

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
*   **Completed Core Authentication Implementation:**
    *   Setup Supabase Browser Client & Auth Provider (`0285b53f`).
    *   Created Login Page & Form Component (`48dc807e`), including UI refinements and i18n fixes.
    *   Implemented Route Protection Middleware (`fdbbe239`), verifying redirects work as expected.
    *   Created Registration Page & Form Component (`cec629f6`), adding user type selection and resolving i18n issues (Zod schemas, message files).
*   **Resolved Internationalization (i18n) Issues:**
    *   Identified and fixed incorrect path to `ar.json` in `i18n.js`.
    *   Consolidated all Arabic translations into the root `messages/ar.json` file.
    *   Corrected usage of `getTranslations` and `createTranslator` in `forgot-password` and `reset-password` pages and their form components.
    *   Ensured `ForgotPasswordPage` and `ResetPasswordPage` translations are correctly loaded and displayed.
    *   Removed an unused/duplicate `ar.json` file from `src/i18n/messages/`.
    *   Cleaned up debugging logs and dummy routes used during the i18n troubleshooting.
*   Updated Memory Bank (`progress.md`, `systemPatterns.md`, `techContext.md`) to reflect DB completion and styling refactor.
*   **Successfully implemented Forgot Password and Reset Password pages with correct i18n.**

## Next Steps

Execute remaining tasks for the **Authentication & Basic Profiles** phase:
*   **Create Profile Data Fetching Hook** (`c8a7cbc3`): Implement hook to get user profile data (using Supabase client, handling `profiles`, `researcher_profiles`, `organizer_profiles`).
*   **Create Profile View Component & Page**: Display the user's profile information based on fetched data.
*   **Create Profile Edit Form (Common Fields & Location)**: Implement form for basic profile fields (`first_name`, `last_name`, `organization`, `phone_number`) and location selection (`wilaya_id`, `daira_id`).
*   **Add Role-Specific Fields to Edit Form**: Extend the edit form for researcher/organizer specific fields (`research_interests`, `domains`, `event_types`).

## Active Decisions & Considerations

*   The `i18n.js` file now correctly uses dynamic imports for message files.
*   The single source of truth for Arabic translations is `messages/ar.json` at the project root.
*   Profile data fetching hook needs to efficiently query the base `profiles` table and the relevant role-specific extension table (`researcher_profiles` or `organizer_profiles`) based on the user's `user_type`.
*   Profile view should adapt based on user type.
*   Profile edit form needs careful state management and validation, ensuring updates are sent correctly to Supabase.
*   **Strictly enforcing Arabic-only text input/display and RTL layout** for all profile UI components.
*   Location selection dropdowns must fetch and display **only** `wilayas.name_ar` and `dairas.name_ar` for MVP.
*   Prioritizing core auth flow (signup, login, logout).
*   Focusing on Researcher/Organizer profile structure based on the extended profile tables (`researcher_profiles`, `organizer_profiles`).
*   Planning how to fetch and display `wilayas`/`dairas` data (`name_ar` **only** for MVP) for location selection. 