# Active Context

## Current Focus

Initiating the **Authentication & Basic Profiles** phase. Tasks involve setting up Supabase Auth UI components and creating the initial profile view/edit pages for researchers and organizers.

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
*   Updated Memory Bank (`progress.md`, `systemPatterns.md`, `techContext.md`) to reflect DB completion and styling refactor.

## Next Steps

*   Execute planned tasks for the **Authentication & Basic Profiles** phase:
    1.  **Setup Supabase Browser Client & Auth Provider**: Configure Supabase client and React Context for auth state.
    2.  **Create Login Page & Form Component**: Implement the login UI and logic.
    3.  **Create Registration Page & Form Component**: Implement the registration UI and logic.
    4.  **Implement Route Protection Middleware**: Secure profile/dashboard routes.
    5.  **Create Profile Data Fetching Hook**: Implement hook to get user profile data.
    6.  **Create Profile View Component & Page**: Display the user's profile information.
    7.  **Create Profile Edit Form (Common Fields & Location)**: Implement form for basic profile fields and location selection.
    8.  **Add Role-Specific Fields to Edit Form**: Extend the edit form for researcher/organizer specific fields.

## Active Decisions & Considerations

*   Prioritizing core auth flow (signup, login, logout).
*   Focusing on Researcher/Organizer profile structure based on the extended profile tables (`researcher_profiles`, `organizer_profiles`).
*   Ensuring UI components handle Arabic text input/display and RTL layout correctly.
*   Planning how to fetch and display `wilayas`/`dairas` data (`name_ar`) for location selection. 