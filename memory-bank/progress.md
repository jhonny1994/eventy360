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
**Phase 2: Event Management & Topic Control** - Implementing topic management, event creation, and event discovery features.

## High-Level Status (Against New 6-Phase Plan)

| Phase                                                              | Status      | Notes                                                                                                                               |
| :----------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-Plan Work (Auth & Profile Foundation)**                        | ✅ Complete | Core authentication, profile completion, basic profile display, i18n, styling, DB schema foundation.                               |
| **Phase 1: Subscription Backbone & Core Admin**                    | ✅ Complete | Admin authentication, Verification system with emails, User Payment Reporting Components, Payment Management, Subscription System with caching and route protection |
| **Phase 2: Event Management & Topic Control**                      | 🟡 In Progress | Beginning implementation of topic management and event creation features |
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

### Subscription System (Complete) ✅
- **Server-side Protection:**
  - `subscriptionMiddleware.ts` for checking subscription status
  - `applySubscriptionGuard.ts` for middleware integration
  - Different restriction types (REQUIRE_PAID, REQUIRE_RESEARCHER, REQUIRE_ORGANIZER, ACCEPT_TRIAL)
  - Middleware integration in main Next.js middleware file
- **Client-side Protection:**
  - `withSubscriptionGuard.tsx` HOC for protecting components
  - `useSubscription.ts` hook with caching for subscription data
  - `useSubscriptionCheck.ts` hook for middleware integration
- **Performance Optimization:**
  - LocalStorage-based caching with 15-minute TTL
  - Strategic cache clearing on subscription status changes
  - Cache invalidation in critical user flows (payment verification, upload)
- **UI Components:**
  - `SubscriptionStatusIndicator.tsx` with RTL support
  - Consistent styling and badge display for subscription status
- **Payment Management:**
  - Admin payment verification interface
  - Manual payment recording functionality
  - User payment history display
  - Payment proof upload with secure storage
  - Subscription billing period handling
- **Database Integration:**
  - Enhanced `handle_payment_verification` trigger
  - Email notifications for payment events
  - Proper cascade of subscription status changes

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
- **Payment Components**:
    - User-facing payment reporting with detailed `PaymentHistoryDisplay` component
    - Multi-step `ReportPaymentForm` with validation and document upload
    - `PaymentSection` component in user profile for unified payment management
    - Enhanced `PaymentInstructionsDisplay` with better UX and detailed guidance
    - Robust `PaymentProofUpload` component with file validation and error handling

## 🚀 In-Progress Features (Phase 2)

### A. Topic Management System
- 🔄 Admin UI for creating and managing topics
- 🔄 Database schema for topics and topic associations
- 🔄 Topic selection and linking for events
- 🔄 Topic subscription mechanism for researchers

### B. Event Creation Interface
- 🔄 Event creation form for organizers
- 🔄 Backend logic for event storage
- 🔄 Subscription-based restrictions
- 🔄 Event lifecycle management

### C. Event Discovery
- 🔄 Event listing and filtering interface
- 🔄 Detailed event view pages
- 🔄 Search functionality
- 🔄 Event bookmarking for users

## 📅 Planned Features

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
The project has successfully completed Phase 1, implementing the subscription backbone and core admin functionality. This includes user authentication, profile completion, verification system, payment management, subscription protection for routes and components, and email notifications. With the subscription system now fully operational, the focus has shifted to Phase 2: implementing topic management and event creation features.

## Next Immediate Tasks
1. Implement topic management in admin panel
2. Create event creation interface for organizers
3. Develop event discovery components

## 4. Known Issues & TODOs

- Callback route warning in console (low priority, no functionality impact)
- Email templates need testing with various device sizes
- Ensure comprehensive end-to-end testing is conducted for all new features as they are implemented (as part of each Phase and culminating in Phase 6).
- Refine UI/UX based on user feedback from testing (ongoing).