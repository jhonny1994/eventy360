# Active Context

## Current Focus

**Primary Task: Executing Phase 1 of the Eventy360 MVP Development Plan.**
- Focus on implementing the foundational Subscription Backbone & Core Admin tools for manual MVP operations as outlined in the new 6-phase development plan.

**Secondary Task: Continuous Testing & Quality Assurance (Ongoing)**
- Implement unit and integration tests for features developed in Phase 1.
- Prepare for E2E testing of core Phase 1 user flows.

## Recent Changes

- ✅ **Development Plan Restructured**: A new comprehensive 6-phase development plan for the Eventy360 MVP has been formulated and adopted. This plan details logical phases, steps, and ecosystem integrations.
- ✅ **Policy Decisions Finalized**:
    - User verification (`is_verified` flag) is now purely a visual badge and does not gate any features.
    - Feature access for Free/Expired subscription tiers has been explicitly defined (e.g., no new topic emails for expired researchers, read-only access to event management for expired organizers).
    - Topic deletion by Admins will now cascade delete associations in `event_topics`, effectively removing the topic from events and stopping related notifications.
- ✅ **Refined Profile Notifications Implemented & Tested**: Implemented specific success and error toast notifications for profile updates in `EditProfileForm.tsx`, including Supabase error parsing and translation integration. The implementation was end-to-end tested and verified.
- ✅ **Comprehensive Arabic Translations Updated**: A comprehensive review and update of all Arabic translations in `messages/ar.json` was completed to ensure professionalism, accuracy, and cultural relevance.
- ✅ **Profile Picture Upload Implemented & Cleaned**: Successfully added profile picture upload to `EditProfileForm.tsx`. This includes:
    - UI for file selection (Flowbite `FileInput`) and preview (Flowbite `Avatar` with Next.js `Image`).
    - Image upload to Supabase Storage at `avatars/USER_ID.EXT`, adhering to RLS policies.
    - Update of `profile_picture_url` in role-specific tables (`researcher_profiles` or `organizer_profiles`).
    - Invocation of `clean-orphan-avatars` Edge Function to remove old avatars.
    - Ensured `next.config.ts` permits the Supabase storage domain for images.
    - Added `priority` prop to the preview `Image` for LCP optimization.
    - Resolved associated linter errors, type issues, and React Hook dependencies.
    - Added necessary i18n translations for new UI elements (e.g., in `messages/ar.json`).
    - Removed all debugging `console.log` and `console.warn` statements from `EditProfileForm.tsx` and the `clean-orphan-avatars` Edge Function.

**Full User Journey Implemented:**
- ✅ Registration with user type selection is working
- ✅ Login system with proper redirection is complete
- ✅ Email confirmation flow functions correctly
- ✅ Profile completion form with conditional fields is working
- ✅ Middleware redirection enforces proper flow sequence
- ✅ Password reset functionality (forgot/reset) is working
- ✅ Comprehensive profile page implemented with dashboard layout

**Profile Page Enhancements:**
- Implemented professional dashboard UI with Flowbite components
- Added collapsible sidebar with responsive design for mobile and desktop
- Created role-specific metric cards (different for researchers vs. organizers)
- Added subscription status card with upgrade options
- Implemented verification status display
- Enhanced UI spacing, layouts, and responsive design
- Fixed internationalization for all UI elements
- Optimized sidebar layout with proper button positioning

**Translation System:**
- Fixed missing translations (e.g., `ProfilePage.logoutButton` in Arabic)
- Enhanced Arabic translations (improved orthography, terminology, phrasing)
- Standardized translations across all language files
- Established consistent validation message structure

**Key Decisions/Clarifications (Updated Section):**
- **Development Plan**: The project now follows a detailed 6-Phase MVP Development Plan. Refer to `projectbrief.md` for a high-level summary and internal documentation for full details.
- **User Verification Badge**: The `is_verified` flag in `profiles` table results in a visual badge on the user's profile. It does **not** restrict access to any platform features. Feature access is governed by `user_type` and `subscription` status/tier.
- **Feature Tier Definitions & Access (as per `productContext.md` and `systemPatterns.md` - reviewed for consistency with Verification Badge policy)**: 
    - **Researcher - Free/Expired Tier**: Can surf events, manage account, edit profile. Bookmarks are read-only. Topic subscriptions are read-only (no new emails based on them). Cannot submit papers. Past submissions are read-only.
    - **Researcher - Trial/Paid Tiers**: All Free Tier capabilities PLUS: can add new bookmarks, submit papers, track submissions, modify topic subscriptions, and receive topic-based event notifications.
    - **Organizer - Trial/Paid Tiers**: Full event creation/management (subject to tier limits, if any). Can add new bookmarks.
    - **Organizer - Post-Trial (Expired, Not Paid)**: Can log in, edit profile. Existing events remain publicly visible; Organizer has Read-Only access to their event details and submission lists. Event creation/management features disabled. Bookmarks are read-only.
- **Topic Deletion Policy**: Admins deleting a topic will also remove its associations from events (cascade delete from `event_topics`).

**Form Components:**
- Updated `CompleteProfileForm.tsx` with proper defaults for required fields
- Improved type safety for error handling
- Added proper validation aligned with database constraints

## Next Steps (Aligned with New Development Plan - Phase 1 Focus)

**Phase 1: Subscription Backbone & Core Admin for Manual MVP Operations - Key Tasks:**

*   **A. User Account & Profile Foundations:**
    *   Review existing Auth/Profile flows for consistency with policies (e.g., `is_verified` badge display).
*   **B. Admin Panel - Core MVP Operations:**
    *   Implement Basic Admin Access & Layout (secure routes, basic navigation).
    *   Implement User Management (Admin UI: List users, filter, award/remove `is_verified` badge via RPC).
    *   Implement Payment & Subscription Management (Admin UI: List payments, record new manual payment via RPC, update payment status via RPC).
    *   Verify/Refine `handle_payment_verification()` DB function.
    *   Implement `admin_actions_log` table and integrate logging for admin user/payment actions.
*   **C. Subscription Lifecycle & User Communication:**
    *   Frontend: Display clear instructions for manual offline payment for upgrades.
    *   Backend: Implement/Verify `check_subscriptions_expiry` Edge Function.
    *   Frontend: Display Payment History in user profiles.
    *   Admin Panel: Display Payment History for users.
*   **D. Initial Notification Framework Setup:**
    *   Setup/Verify core email sending Edge Functions (`send-email`, `process-notification-queue`).
    *   Populate initial Arabic email templates in `email_templates` (User Verified Badge, Payment/Subscription status, Trial Expiry).
    *   Integrate initial notification queueing logic.

*(Detailed tasks for subsequent phases (2-6) are outlined in the full development plan.)*

## Project Status Summary

**Completed:**
- ✅ Core authentication flows (Login, Register, Password Reset)
- ✅ Email confirmation flow and callback handling
- ✅ Complete-profile form with validation and submission
- ✅ Middleware redirection functionality
- ✅ Translation system improvements
- ✅ Database schema and constraints
- ✅ Minimal profile page for testing
- ✅ Refined Profile Notification System (Implementation and Testing)
- ✅ Comprehensive Arabic Translations Update
- ✅ Adoption of new 6-Phase MVP Development Plan and key policy decisions.

**In Progress:**
- **Executing Phase 1 of the MVP Development Plan:** Focusing on Subscription Backbone & Core Admin tools.

**Up Next (Post Phase 1):**
- Phase 2: Event Management & Topic Control
- Phase 3: Submission System
- Phase 4: Comprehensive Notification System & Email Management
- Phase 5: Value-Added MVP Features & Admin Panel Consolidation
- Phase 6: Testing, Deployment Preparation & Launch 