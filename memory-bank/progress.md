# Project Progress: Eventy360

## Project Overview
Eventy360 is a Next.js application with Supabase backend, offering multilingual support (English, French, Arabic) for connecting researchers and event organizers in academia. **The project now follows a detailed 6-Phase MVP Development Plan.**

**Conceptual Model Updates (Consistent with latest policies - 05/10/2025 - *replace with actual date*)**
- User Verification (`is_verified`) is a visual badge only and does not gate features.
- Feature access for Free/Expired subscription tiers is explicitly defined (e.g., no topic emails for expired researchers, read-only for expired organizers on event mgt).
- Topic deletion by Admins cascades to `event_topics`.
- These definitions are reflected in `projectbrief.md`, `productContext.md`, `systemPatterns.md`, and `activeContext.md`.

## Current Focus
**Executing Phase 1 of the MVP Development Plan:** Focusing on Subscription Backbone & Core Admin tools.

## High-Level Status (Against New 6-Phase Plan)

| Phase                                                              | Status      | Notes                                                                                                                               |
| :----------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-Plan Work (Auth & Profile Foundation)**                        | ✅ Complete | Core authentication, profile completion, basic profile display, i18n, styling, DB schema foundation.                               |
| **Phase 1: Subscription Backbone & Core Admin**                    | 🟡 In Progress | Focus on manual payment/verification admin tools, subscription lifecycle, initial notifications, payment history display.         |
| **Phase 2: Event Management & Topic Control**                      | ⚪ Planned   |                                                                                                                                     |
| **Phase 3: Submission System**                                     | ⚪ Planned   |                                                                                                                                     |
| **Phase 4: Comprehensive Notification System & Email Management**    | ⚪ Planned   |                                                                                                                                     |
| **Phase 5: Value-Added MVP Features & Admin Panel Consolidation**  | ⚪ Planned   |                                                                                                                                     |
| **Phase 6: Testing, Deployment Preparation & Launch**              | ⚪ Planned   | Testing is also an ongoing activity throughout all phases.                                                                          |

## Current Issues

**Minor Issue: Callback Route Warning**  
- Console shows: `Route "/[locale]/callback" used params.locale. params should be awaited...`
- Doesn't break functionality, low priority

## Completed Features (Categorized under Pre-Plan Work & Ongoing Refinements)

### Core Infrastructure
- Next.js App Router project with TypeScript
- Supabase integration for auth and database
- i18n setup with next-intl (English, French, Arabic)
- RTL support for Arabic
- Tailwind CSS and Flowbite components

### Database Implementation
- Complete schema with tables for profiles, events, submissions, etc.
- RLS policies for basic security
- Automated triggers (`handle_new_user`, `handle_payment_verification`)
- Location data (wilayas, dairas) seeded

### Authentication System
- Login and registration with email/password
- Password reset flow (forgot/reset password)
- Session management with Supabase auth
- Route protection via middleware
- Email verification and callback handling

### Localization System
- Translation files for English, French, Arabic
- Arabic translations with proper orthography and terminology (general pass completed)
- **Targeted Arabic Translation Refinement**: Enhanced professionalism and academic tone for `PaymentInstructions` and `PricingModal` sections.
- **New Translation Keys Added**: For `PricingModal` features (`featuresLabel`, `noPlanForUserType`).
- Consistent validation messages and placeholders across languages
- RTL layout support for Arabic

### User Onboarding Flow (Complete)
- Registration with user type selection (Researcher/Organizer)
- Email confirmation page and verification flow
- Callback handling and proper redirection
- Profile completion form with dynamic fields based on user type
- Middleware redirection to enforce onboarding sequence
- Basic profile page and edit functionality, including profile picture upload.

### UI Components & Refinements
- **`PricingModal.tsx`**: 
    - Enhanced UI/UX: Increased width, standardized button colors, improved internal content alignment and spacing.
    - Simplified Logic: Removed tier selection, now directly shows plans based on `userType` prop.
    - Translation Integration: Removed obsolete trial info, added new keys for features and user type messages.

## In-Progress Features (Corresponds to Phase 1 of New Plan)

*   **A. User Account & Profile Foundations (Review & Badge Display):**
    *   Review existing Auth/Profile flows for consistency with new policies (e.g., `is_verified` badge display on profile page).
*   **B. Admin Panel - Core MVP Operations:**
    *   Basic Admin Access & Layout (secure routes, basic navigation).
    *   **New Tasks Added: Admin Authentication Flow (Invitation, Account Creation, Dedicated Login)**
    *   User Management (Admin UI: List users, filter, award/remove `is_verified` badge via RPC).
    *   Payment & Subscription Management (Admin UI: List payments, record new manual payment via RPC, update payment status via RPC).
    *   Verify/Refine `handle_payment_verification()` DB function.
    *   `admin_actions_log` table creation and logging integration for admin user/payment actions.
*   **C. Subscription Lifecycle & User Communication:**
    *   Frontend: Display clear instructions for manual offline payment for upgrades (Partially addressed by `PricingModal` and `PaymentInstructionsDisplay` refinements).
    *   Backend: `check_subscriptions_expiry` Edge Function implementation/verification.
    *   Frontend: Display Payment History in user profiles.
    *   Admin Panel: Display Payment History for users.
*   **D. Initial Notification Framework Setup:**
    *   Core email sending Edge Functions (`send-email`, `process-notification-queue`) setup/verification.
    *   Populate initial Arabic email templates in `email_templates` (User Verified Badge, Payment/Subscription status, Trial Expiry, Admin Invitation).
    *   Initial notification queueing logic integration (including for Admin Invitation).

## Planned Features (Phases 2-6 of New Plan)

1.  **Phase 2: Event Management & Topic Control**
    *   Admin Topic Management (CRUD, cascade delete policy, logging).
    *   Organizer Event Creation (form, backend logic, subscription checks, `event_topics` linking).
    *   Organizer Event Dashboard (basic list).
    *   Public/Researcher Event Discovery (listing, search/filter, detail page).
    *   Event Bookmarking (for active subscriptions, read-only for expired).
    *   Admin Event Oversight (view/edit all events).
    *   Event-related Notifications (new event to topic subscribers - no emails for free/expired, deadline reminders to organizers).
2.  **Phase 3: Submission System**
    *   Researcher Submission (form, backend logic with subscription checks, file uploads to Storage).
    *   Researcher Submission Tracking (UI, read-only for expired).
    *   Organizer Submission Management (view submissions for own events, download files securely, update status/feedback).
    *   Admin Submission Oversight (view all).
    *   Submission-related Notifications (to researcher & organizer).
3.  **Phase 4: Comprehensive Notification System & Email Management**
    *   Full review and robust implementation of email sending Edge Functions (`send-email`, `process-notification-queue`, `retry-failed-emails`).
    *   Complete population of all Arabic `email_templates`.
    *   System-wide review and implementation of notification queueing logic (ensure no topic emails for free/expired).
    *   Admin Email Management (template edit, log viewing, logging template edits).
4.  **Phase 5: Value-Added MVP Features & Admin Panel Consolidation**
    *   Research Repository (event flag, UI, backend RPC).
    *   Global Search Bar (Events, Repository) & FTS optimization.
    *   Admin Panel Central Dashboard (stats, navigation).
    *   Admin Panel UI/UX Refinement.
5.  **Phase 6: Testing, Deployment Preparation & Launch**
    *   Comprehensive Testing Cycles (Unit, Integration, E2E, UAT).
    *   Performance & Security Review.
    *   Deployment Preparation (Prod environments, data seeding, CI/CD, backups).
    *   Launch & Post-Launch Monitoring.

## 1. What Works (Completed Features/Areas - Includes Pre-Plan Foundational Work & Ongoing Refinements)

- Core authentication flows (Login, Register, Password Reset)
- Email confirmation flow and callback handling
- Complete-profile form with validation and submission
- Middleware redirection functionality
- Translation system improvements (including comprehensive Arabic translation update, targeted refinements for pricing/payment, and new key additions)
- Database schema and constraints (initial)
- Minimal profile page for testing
- Refined Profile Notification System (Implementation and Testing)
- Profile Picture Upload (Implementation and Cleanup)
- `PricingModal.tsx` UI/UX and logic enhancements.

## 2. What's Left to Build (Now tracked by Phases 1-6 of the New Plan)

- All tasks outlined in Phases 1 through 6 of the new MVP Development Plan.

## 3. Current Status
The project has successfully implemented foundational user authentication, profile completion, and basic profile viewing/editing features. **A new 6-Phase MVP Development Plan has been adopted. Work is commencing on Phase 1: Subscription Backbone & Core Admin tools.**

## 4. Known Issues & TODOs

- Investigate and resolve the persistent linter error related to the dependency array in `EditProfileForm.tsx` (though the user applied a manual fix, understanding the root cause could be beneficial for future development).
- Ensure comprehensive end-to-end testing is conducted for all new features as they are implemented (as part of each Phase and culminating in Phase 6).
- Refine UI/UX based on user feedback from testing (ongoing).