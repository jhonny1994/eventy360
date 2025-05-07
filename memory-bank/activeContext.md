# Active Context

## Current Focus

**Diagnosing Middleware Redirection Failure:** The primary focus is identifying why the main `middleware.ts` is failing to redirect authenticated users with confirmed emails but incomplete profiles (`is_extended_profile_complete = false`) from `/[locale]/profile` to `/[locale]/complete-profile` immediately after login. The user is incorrectly landing on the profile page.

## Recent Changes

*   **Middleware Logic Refined:** The logic within `middleware.ts` to check `is_extended_profile_complete` and redirect was implemented and made robust (handling query errors, missing profiles).
*   **Extensive Debugging Attempts (Unsuccessful):**
    *   Added detailed, step-by-step logging throughout `middleware.ts`.
    *   Temporarily broadened the middleware `matcher` config to `/.*`.
*   **Key Debugging Finding:** Despite server logs showing the `GET /[locale]/profile 200` request hitting the server after login, the `console.log` statements added *within* the `middleware` function were **not appearing** in the server terminal for that specific request. This strongly suggests the middleware function is either not running at all for that path transition, or is exiting/erroring before the logs.
*   **`LoginForm.tsx` Modification:** Temporarily commented out `router.refresh()` after `router.push('/profile')` - this did not resolve the issue.
*   **`updateSession` Utility (`@/utils/supabase/middleware.ts`) Reviewed:** The utility function appears standard based on a previous read, but its interaction immediately post-login remains a potential factor.
*   **Middleware Reverted:** All debugging logs and the temporary matcher change have been removed from `middleware.ts`, restoring the intended logic.
*   **Translation Keys Added:** Missing keys identified during debugging (`selectPlaceholder`, `loading`, `welcome`) were added to `messages/ar.json`.

## Next Steps

1.  **Adopt New Diagnostic Strategy:** Since direct logging within the middleware failed to provide insights for the `/profile` path post-login, a new approach is needed. Potential strategies include:
    *   **Simplify Redirect Target:** Test changing `router.push('/profile')` in `LoginForm.tsx` to `router.push('/complete-profile')` to see if direct navigation works, isolating the issue to the handling of the `/profile` path by the middleware.
    *   **Verify RLS Policies:** Double-check the RLS policy on the `public.profiles` table ensures the `select('is_extended_profile_complete')` query within the middleware (using anon key + JWT) is guaranteed to succeed for the authenticated user.
    *   **Test without Turbopack:** Run the dev server using standard Webpack (`npm run dev` without `--turbopack`) to rule out Turbopack-specific middleware/logging behavior.
    *   **Inspect `updateSession` More Closely:** Add logging *inside* `updateSession` if other steps fail.
2.  **Resolve the Middleware Execution/Redirection Issue.**
3.  **Thoroughly Test the Onboarding Flow.**

## Active Decisions & Considerations

*   The core logic in `middleware.ts` *should* enforce the redirect based on `is_extended_profile_complete=false`, but it is not being triggered or executed correctly for the `/profile` path immediately after login.
*   The absence of expected logs in the server console is the primary indicator that the middleware execution is flawed for this transition.
*   The `updateSession` utility's behavior in the instant after `signInWithPassword` sets cookies is a potential area of timing/race conditions.
*   The `matcher` config in `middleware.ts` is less likely to be the issue now that it's reverted, but interactions with i18n routing could still be a factor.

## Current Task Focus: Implement "Robust Multi-Step User Onboarding Flow"

**Last Major Action:** The `CompleteProfileForm.tsx` component has been updated:
1.  The `getInitialValues` helper function was modified to provide appropriate empty string `''` defaults for fields that are now required by the database and Zod schemas (e.g., `name`, `institution`, `wilaya_id`, `daira_id` for researchers; `organization_name_ar`, `institution_type`, `wilaya_id`, `daira_id` for organizers).
2.  Type safety for accessing the `errors` object from `react-hook-form` was improved by using more specific type assertions `(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: '...' }>>).fieldName` within conditional rendering blocks for researcher and organizer specific fields. This resolved previous linter errors.

**Immediate Next Steps & Current State of `complete-profile` Page (Phase 3.2):**

1.  **Apply Database Migrations (User Action):** The user MUST apply the updated database migrations (`20250503171204_define_secondary_schema.sql`) to their local Supabase instance. These migrations enforce `NOT NULL` constraints on newly required fields in `researcher_profiles`, `organizer_profiles`, etc.

2.  **Thorough Testing of `CompleteProfileForm.tsx`:** This is the primary active task.
    *   **Objective:** Verify that the form correctly validates, submits, and saves data for both "Researcher" and "Organizer" user types, respecting all new `NOT NULL` constraints and Zod validations.
    *   **Specific Test Cases Needed:**
        *   Attempt to submit the form with required fields left empty (expect validation errors).
        *   Enter invalid data for fields with specific formats (e.g., `profile_picture_url` if it still has URL validation).
        *   Successfully submit the form with all required fields filled and optional fields empty.
        *   Successfully submit the form with all fields (required and optional) filled.
        *   Verify data integrity in the Supabase database (`researcher_profiles` and `organizer_profiles` tables) after successful submissions.
        *   Check that `is_extended_profile_complete` in the `profiles` table is set to `true` after successful submission via the `complete_my_profile` RPC.

3.  **Verify `/[locale]/complete-profile/page.tsx` Logic:**
    *   Ensure it correctly fetches user data (`user_type`, `is_extended_profile_complete`).
    *   Confirm redirection to `/[locale]/profile` if `is_extended_profile_complete` is already true.

**Overall Onboarding Flow Status:**
*   **Phase 1 (DB Prerequisites):** DONE
*   **Phase 2 (Signup Modification):** DONE
*   **Phase 3 (New Pages - Confirm Email & Complete Profile):**
    *   `confirm-email` page: DONE
    *   `complete-profile` page: In Progress (Development of form UI/logic/schemas is complete; thorough testing required).
*   **Phase 4 (Middleware):** Partially Implemented (Redirect logic for `complete-profile` is present).
*   **Phase 5 (Profile Page):** Not Started.
*   **Phase 6 (Testing & Refinements):** Not Started (focused testing of `CompleteProfileForm` is part of Phase 3.2 now).

**Open Issues/Questions:**
*   None directly related to `CompleteProfileForm` at this moment, pending testing results.

**Next actions are heavily dependent on the user applying migrations and the results of testing the `CompleteProfileForm`.** 