# Project Progress: Eventy360

## Project Overview
Eventy360 is a Next.js application with Supabase backend, offering multilingual support (English, French, Arabic) for connecting researchers and event organizers in academia. The project follows a detailed 6-Phase MVP Development Plan.

**Conceptual Model**
- User Verification (`is_verified`) is a visual badge only and does not gate features
- Feature access for Free/Expired subscription tiers is explicitly defined:
  - No topic emails for expired researchers
  - Read-only access for expired organizers on event management
- Topic deletion by Admins cascades to `event_topics`

## Current Focus
**Phase 1: Subscription Backbone & Core Admin** - Payment and subscription management implementation.

## High-Level Status (Against New 6-Phase Plan)

| Phase                                                              | Status      | Notes                                                                                                                               |
| :----------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-Plan Work (Auth & Profile Foundation)**                        | ✅ Complete | Core authentication, profile completion, basic profile display, i18n, styling, DB schema foundation.                               |
| **Phase 1: Subscription Backbone & Core Admin**                    | 🟡 In Progress | **Completed:** Admin authentication, Verification system with emails (including bug fixes for duplicate notifications)<br>**In Progress:** Payment/subscription management               |
| **Phase 2: Event Management & Topic Control**                      | ⚪ Planned   |                                                                                                                                     |
| **Phase 3: Submission System**                                     | ⚪ Planned   |                                                                                                                                     |
| **Phase 4: Comprehensive Notification System & Email Management**    | ⚪ Planned   | Email notification foundations in place with Arabic language support and duplicate prevention. Further enhancements planned in Phase 4.                                                                                                                                 |
| **Phase 5: Value-Added MVP Features & Admin Panel Consolidation**  | ⚪ Planned   |                                                                                                                                     |
| **Phase 6: Testing, Deployment Preparation & Launch**              | ⚪ Planned   | Testing is also an ongoing activity throughout all phases.                                                                          |

## Current Issues

**Minor Issue: Callback Route Warning**  
- Console shows: `Route "/[locale]/callback" used params.locale. params should be awaited...`
- Doesn't break functionality, low priority

## ✅ Completed Features

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
- Verification documents bucket with proper RLS policies
- Verification request table with triggers for status changes
- Performance optimization with appropriate indexes for verification queries
- Language column for user profiles with Arabic default
- Fixed duplicate notification issues in database triggers

### Authentication System
- Login and registration with email/password
- Password reset flow (forgot/reset password)
- Session management with Supabase auth
- Route protection via middleware
- Email verification and callback handling
- Admin authentication flow (login, invitation, account creation)

### Localization System
- Translation files for English, French, Arabic
- Arabic translations with proper orthography and terminology (general pass completed)
- **Targeted Arabic Translation Refinement**: Enhanced professionalism and academic tone for `PaymentInstructions` and `PricingModal` sections.
- **New Translation Keys Added**: For `PricingModal` features (`featuresLabel`, `noPlanForUserType`).
- Consistent validation messages and placeholders across languages
- RTL layout support for Arabic
- Added translations for verification and admin components
- Fixed email notification language to properly default to Arabic

### User Onboarding Flow (Complete)
- Registration with user type selection (Researcher/Organizer)
- Email confirmation page and verification flow
- Callback handling and proper redirection
- Profile completion form with dynamic fields based on user type
- Middleware redirection to enforce onboarding sequence
- Basic profile page and edit functionality, including profile picture upload.
- Verification document upload for organizers

### Verification System (Complete) ✅
- Document upload interface for organizers
- Secure storage in Supabase with proper RLS policies
- Admin verification review interface with pagination
- Document preview and download functionality
- Approval and rejection workflow with notes/reasons
- Database triggers to update user verification status
- Bug fix for enum casting in database functions
- Email notifications for verification status changes
- Performance optimizations with database indexes for common query patterns
- Pagination implementation for verification request listings
- Fixed duplicate email issue when admin approves verification requests

### Email Notification System (Foundation Complete) ✅
- Core email sending Edge Functions implemented
- Notification queue system with appropriate triggers
- Email templates for verification status changes
- Fixed language selection logic to default to Arabic
- Improved trigger functions to prevent duplicate notifications
- Proper error handling and logging

### UI Components & Refinements
- **`PricingModal.tsx`**: 
    - Enhanced UI/UX: Increased width, standardized button colors, improved internal content alignment and spacing.
    - Simplified Logic: Removed tier selection, now directly shows plans based on `userType` prop.
    - Translation Integration: Removed obsolete trial info, added new keys for features and user type messages.
- **Admin Dashboard**:
    - Standardized navigation components with proper i18n support
    - Responsive design with collapsible sidebar
    - Consistent styling and error handling
    - Verification management interface with pagination and filtering

## 🚀 In-Progress Features (Phase 1)

### A. User Account & Profile Foundations
- ✅ Verification badge display on profile page

### B. Admin Panel - Core MVP Operations
- ✅ **Basic Admin Access & Layout:** Secure routes, standardized navigation components (`AdminNavbar`, `AdminSidebar`), and dashboard layout with proper internationalization and RTL support.
- ✅ **Admin Authentication Flow:** Standardized authentication components for admin login, account creation, error handling, and redirects with centralized exports via index files.
- ✅ **User Management/Verification System:** Admin interface for reviewing verification requests, approving/rejecting with notes, viewing documents, with pagination and performance optimizations.
- 🔄 Payment & Subscription Management (Admin UI: List payments, record new manual payment via RPC, update payment status via RPC).
- 🔄 Verify/Refine `handle_payment_verification()` DB function.
- 🔄 `admin_actions_log` table creation and logging integration for admin user/payment actions.

### C. Subscription Lifecycle & User Communication
- 🔄 Frontend: Display clear instructions for manual offline payment for upgrades (Partially addressed by `PricingModal` and `PaymentInstructionsDisplay` refinements).
- 🔄 Backend: `check_subscriptions_expiry` Edge Function implementation/verification.
- 🔄 Frontend: Display Payment History in user profiles.
- 🔄 Admin Panel: Display Payment History for users.

### D. Initial Notification Framework Setup
- ✅ Core email sending Edge Functions (`send-email`, `process-notification-queue`) setup/verification.
- ✅ Populate initial Arabic email templates in `email_templates` (User Verified Badge, Payment/Subscription status, Trial Expiry, Admin Invitation).
- ✅ Initial notification queueing logic integration (including for Admin Invitation).
- ✅ Email notifications for verification status changes (approved/rejected).
- ✅ Fixed language preferences to properly default to Arabic.
- ✅ Fixed duplicate notification issues in database triggers.

## 📅 Planned Features

### Phase 2: Event Management & Topic Control
- Admin Topic Management (CRUD, cascade delete policy, logging).
- Organizer Event Creation (form, backend logic, subscription checks, `event_topics` linking).
- Organizer Event Dashboard (basic list).
- Public/Researcher Event Discovery (listing, search/filter, detail page).
- Event Bookmarking (for active subscriptions, read-only for expired).
- Admin Event Oversight (view/edit all events).
- Event-related Notifications (new event to topic subscribers - no emails for free/expired, deadline reminders to organizers).

### Phase 3: Submission System
- Researcher Submission (form, backend logic with subscription checks, file uploads to Storage).
- Researcher Submission Tracking (UI, read-only for expired).
- Organizer Submission Management (view submissions for own events, download files securely, update status/feedback).
- Admin Submission Oversight (view all).
- Submission-related Notifications (to researcher & organizer).

### Phase 4: Comprehensive Notification System & Email Management
- Full review and robust implementation of email sending Edge Functions (`send-email`, `process-notification-queue`, `retry-failed-emails`).
- Complete population of all Arabic `email_templates`.
- System-wide review and implementation of notification queueing logic (ensure no topic emails for free/expired).
- Admin Email Management (template edit, log viewing, logging template edits).

### Phase 5: Value-Added MVP Features & Admin Panel Consolidation
- Research Repository (event flag, UI, backend RPC).
- Global Search Bar (Events, Repository) & FTS optimization.
- Admin Panel Central Dashboard (stats, navigation).
- Admin Panel UI/UX Refinement.

### Phase 6: Testing, Deployment Preparation & Launch
- Comprehensive Testing Cycles (Unit, Integration, E2E, UAT).
- Performance & Security Review.
- Deployment Preparation (Prod environments, data seeding, CI/CD, backups).
- Launch & Post-Launch Monitoring.

## Current Status Summary
The project has successfully implemented foundational user authentication, profile completion, basic profile viewing/editing features, admin authentication, and the complete verification system with email notifications (including a bug fix for duplicate emails). With the verification system now fully operational, the focus has shifted to implementing payment and subscription management as part of Phase 1 completion.

## Next Immediate Tasks
1. Implement payment management in admin panel
2. Create admin actions logging system
3. Develop payment history display for users and admins

## 4. Known Issues & TODOs

- Complete the payment and subscription management features in the admin panel
- Investigate and resolve the persistent linter error related to the dependency array in `EditProfileForm.tsx` (though the user applied a manual fix, understanding the root cause could be beneficial for future development).
- Ensure comprehensive end-to-end testing is conducted for all new features as they are implemented (as part of each Phase and culminating in Phase 6).
- Refine UI/UX based on user feedback from testing (ongoing).