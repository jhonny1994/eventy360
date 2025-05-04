# Active Context

## Current Focus

Initiating the **Authentication & Basic Profiles** phase. Tasks involve setting up Supabase Auth UI components and creating the initial profile view/edit pages for researchers and organizers.

## Recent Changes

*   Completed the **Database Implementation** phase.
    *   Initial schema, core automation (triggers/functions), and RLS policies applied.
    *   Secondary schema migration applied, defining all remaining MVP tables and ENUMs.
    *   Location data (`wilayas`/`dairas`) seeded manually by user.
*   Updated Memory Bank (`progress.md`, `systemPatterns.md`, `techContext.md`) to reflect DB completion.

## Next Steps

*   Plan and define tasks for the **Authentication & Basic Profiles** phase:
    *   Implement registration/login forms using Supabase Auth.
    *   Create profile display page.
    *   Create profile edit form (handling text inputs, location selection using seeded data).
    *   Implement loading/error states for auth and profile operations.

## Active Decisions & Considerations

*   Prioritizing core auth flow (signup, login, logout).
*   Focusing on Researcher/Organizer profile structure based on the extended profile tables (`researcher_profiles`, `organizer_profiles`).
*   Ensuring UI components handle Arabic text input/display and RTL layout correctly.
*   Planning how to fetch and display `wilayas`/`dairas` data (`name_ar`) for location selection. 