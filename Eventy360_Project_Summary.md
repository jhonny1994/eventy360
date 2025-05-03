# Eventy360: Academic Event & Research Discovery Platform

## Project Overview

Eventy360 is a comprehensive SaaS platform designed to revolutionize academic event management and research discovery in Algeria. It connects researchers with academic events, streamlines submissions, and creates a centralized research repository, addressing information fragmentation, trust issues, and inefficient workflows in the Algerian academic sphere.

## Core Problems Solved

1. **Information Fragmentation** - Event discovery is difficult due to scattered announcements
2. **Limited Trust** - Difficulty distinguishing reputable events
3. **Manual Submissions** - Paper submissions rely on email and manual tracking
4. **Access Barriers** - Finding post-event research papers is challenging
5. **Workflow Inefficiency** - Organizers use disconnected tools

## Target Audience

- **Researchers**: Students, professors, scientists seeking academic events and research opportunities
- **Organizing Institutions**: Universities, research centers, and academic departments hosting events
- **Administrators**: Platform managers ensuring quality, processing verifications, and maintaining the system

## Key Features

### User Management
- Three distinct user types: researchers, organizers, and administrators
- Comprehensive profiles for each user type
- Manual admin verification via email communication for MVP
- User interface in **Arabic only for MVP** (Full RTL support)

### Subscription System
- Tiered model: free (researcher, organizer), paid (researcher, organizer), trial (researcher, organizer)
- A month trial period for all new users
- Payment processing (bank, check, cash) offline initially
- Manual verification by administrators for paid users with verification badge
- Clear feature differentiation between tiers

### Event Management
- Detailed event creation with comprehensive information fields
- Support for multiple event types and formats
- Topic association for improved discoverability
- Event lifecycle management (published → active → completed)

### Submission System
- Streamlined paper submission workflow
- Abstract and full paper handling
- Status tracking and email notifications

### Research Repository
- Centralized storage of accepted papers.
- Metadata-based search and filtering:
    - **MVP Scope:** Search by `title`, `abstract`; Filter by `topic`, `event_id`.
- Download tracking (future enhancement).
- Associated event context.

### Search and Discovery
- Arabic full-text search (**MVP focuses on searching Arabic content**)
- Advanced filtering capabilities
- Topic-based recommendations
- Saved searches and bookmarking

### Verification System
- Manual admin check based on email communication for MVP
- Admin updates verification status via interface controls
- Verified badges applied by admin for trusted accounts

### Notification System
- Email-based notifications for key events, using **Arabic language templates only for MVP**.
- **Key Notification Triggers (MVP):**
    - **User Related:**
        - Welcome email upon registration (Researcher/Organizer).
        - Verification status update (Admin action).
        - Paid subscription activation confirmation (Admin action).
        - Password reset request (Implicit standard feature).
    - **Submission Related (Researcher):**
        - Submission status changes (e.g., Accepted, Rejected) with organizer feedback.
    - **Submission Related (Organizer):**
        - Notification of new paper submission received for their event.
    - **Event Related:**
        - Event deadline changes (sent to submitters).
        - Event cancellation (sent to submitters).
        - **Scheduled:**
            - Upcoming event deadline reminders (e.g., submission, full paper).
            - User trial period expiration warnings.
            - Automated updates for expired trials/subscriptions (status change).
- **Implementation Approach (MVP):**
    - **Templates:** Stored in a dedicated database table (`email_templates`) allowing admin management (view/edit subject & body) via the Admin Panel. Specific variables needed for each template defined during implementation and documented.
    - **Logging:** All send attempts recorded in a database table (`email_log`) with status (`attempted`, `sent`, `failed`), error messages, and Resend message ID.
    - **Sending:** Handled by a core internal Edge Function logic (`send-email`) responsible for fetching templates, personalization, and calling the Resend API.
    - **Triggers:**
        - **Database Triggers:** Key database events (e.g., user registration completion, status updates in `profiles`, `payments`, `submissions`, `events`) will trigger insertion of tasks into a dedicated `notification_queue` table. This table stores details like recipient, template key, and required data.
        - **Direct Invocation:** Some immediate, user-initiated actions like password resets might directly invoke the necessary logic, including queuing or sending.
        - **Scheduled Queue Processing:** A scheduled Edge Function (`process-notification-queue`) runs frequently (e.g., every minute) via Supabase Cron. It reads pending tasks from `notification_queue`, calls the `send-email` logic for each, and updates the task status.
        - **Scheduled Checks:** Separate scheduled Edge Functions (e.g., `check-deadlines`, `check-subscriptions-expiry`) run periodically (e.g., daily) to identify events needing notifications (like deadline reminders or expiry warnings) and insert corresponding tasks into the `notification_queue`.
    - **Failure Handling:** A separate scheduled Edge Function (`retry-failed-emails`) automatically attempts to resend emails marked as 'failed' in `email_log` once. The final status is logged.
    - **Admin Visibility:** Admin Panel includes an Email Log viewer to track send status and errors.

## Technical Stack

### Frontend
- Next.js (App Router)
- React with TypeScript
- Tailwind CSS with Shadcn UI
- next-intl for internationalization
- React Hook Form with Zod validation

### Backend
- Supabase Platform:
  - PostgreSQL database
  - Supabase Auth
  - Supabase Storage
  - Supabase Edge Functions
  - Supabase Realtime
  - Row Level Security (RLS)

### Database
- Comprehensive PostgreSQL schema
- ENUMs for data categorization
- Row Level Security policies: Implemented incrementally. Strategy: Users manage own data; Organizers manage their events/submissions; Admins have broader access defined per operation.
- Database functions and triggers
- Soft delete functionality
- **i18n Strategy Note:** To facilitate future multi-language support (`en`, `fr`), dynamic text fields intended for users (e.g., names, titles, descriptions) use `JSONB` columns (e.g., `field_translations`). **For MVP, only the `ar` key will be populated and queried.** Application logic handles querying `ar` text. Static UI text uses `next-intl` (configured for `ar` only in MVP).

### Deployment
- Vercel for frontend hosting
- Supabase Cloud for backend services
- GitHub Actions for CI/CD

### UI/UX Approach
- Utilize Shadcn UI components as building blocks.
- Prioritize functional implementation based on user flows.
- Ensure RTL support (`dir="rtl"`) for Arabic from the start.
- Implement clear loading indicators (e.g., skeletons, spinners) during data fetching and operations.
- Provide user-friendly feedback for errors (e.g., toasts, inline messages).
- Detailed visual design (mockups/wireframes) is part of a separate design phase/process.

### Error Handling Strategy (MVP)
- **Frontend Forms:** Client-side validation (React Hook Form + Zod) with inline field errors.
- **Frontend Data Fetching/API Calls:** Use `try...catch` in client components/event handlers; display user-friendly feedback (Toasts/Alerts); utilize Next.js App Router `error.js` boundaries for Server Component errors.
- **Backend Functions (Edge Functions):** Use `try...catch`; return structured JSON errors with appropriate HTTP status codes (4xx, 5xx); log details via `console.error`.
- **Not Found:** Use `notFound()` from `next/navigation` in Server Components when required data is missing.
- **File Uploads:** Client-side (size/type) and server-side validation; clear UI feedback on progress/errors.

## Database Schema

### ENUMs

The database uses PostgreSQL ENUMs for strictly typed data categorization:

1. **user_type_enum**: `researcher`, `organizer`, `admin`
2. **institution_type_enum**: `university`, `university_center`, `national_school`, `research_center`, `research_laboratory`, `activities_service`, `research_team`
3. **event_type_enum**: `scientific_event`, `cultural_event`, `sports_event`, `competition`
4. **event_format_enum**: `physical`, `virtual`, `hybrid`
5. **event_status_enum**: `published`, `active`, `completed`, `canceled`
6. **submission_status_enum**: `received`, `under_review`, `accepted`, `rejected`
7. **payment_status_enum**: `pending_verification`, `verified`, `rejected`
8. **payment_method_enum**: `bank`, `check`, `cash`, `online`
9. **billing_period_enum**: `monthly`, `quarterly`, `biannual`, `annual`
10. **subscription_tier_enum**: `free`, `paid_researcher`, `paid_organizer`, `trial`
11. **subscription_status_enum**: `active`, `expired`, `trial`, `cancelled`

### Tables

The database schema includes the following core tables:

1. **profiles**: Core user information with user type
   - Primary fields: id (UUID, FK to auth.users), email, user_type (user_type_enum), is_verified (BOOLEAN)

2. **wilayas**: Stores Wilaya information, populated from `wilayas.json`.
   - Primary fields: id (INT, PK), name_ar (TEXT, NOT NULL), name_other (TEXT, NOT NULL) - *Note: ar name is for arabic language only, other name is for all other languages*

3. **dairas**: Stores Daira information, populated from `wilayas.json`.
   - Primary fields: id (INT, PK), wilaya_id (INT, FK references wilayas.id, NOT NULL), name_ar (TEXT, NOT NULL), name_other (TEXT, NOT NULL) - *Note: ar name is for arabic language only, other name is for all other languages*

4. **researcher_profiles**: Extended information for researcher users
   - Primary fields: profile_id (FK to profiles), name (TEXT), institution (TEXT), academic_position (TEXT), bio (TEXT -> **bio_translations JSONB**), profile_picture_url (TEXT, nullable), wilaya_id (FK to wilayas), daira_id (FK to dairas)

5. **organizer_profiles**: Extended information for organizer users
   - Primary fields: profile_id (FK to profiles), name (TEXT -> **name_translations JSONB**), institution_type (institution_type_enum), bio (TEXT -> **bio_translations JSONB**), profile_picture_url (TEXT, nullable), wilaya_id (FK to wilayas), daira_id (FK to dairas)

6. **admin_profiles**: Extended information for admin users
   - Primary fields: profile_id (FK to profiles), name (TEXT) - *Likely internal, translation may not be needed.*

7. **topics**: Research and event topics for categorization
   - Primary fields: id (UUID, PK), slug (TEXT, UNIQUE), name (TEXT -> **name_translations JSONB**)

8. **events**: Core event information
   - Primary fields: id (UUID, PK), created_by (FK to profiles), status (event_status_enum), who_organizes (TEXT -> **who_organizes_translations JSONB**), event_name (TEXT -> **event_name_translations JSONB**), event_subtitle (TEXT, nullable -> **event_subtitle_translations JSONB**), problem_statement (TEXT -> **problem_statement_translations JSONB**), submission_guidelines (TEXT -> **submission_guidelines_translations JSONB**), event_axes (TEXT -> **event_axes_translations JSONB**), event_objectives (TEXT -> **event_objectives_translations JSONB**), target_audience (TEXT -> **target_audience_translations JSONB**), scientific_committees (TEXT -> **scientific_committees_translations JSONB**), speakers_keynotes (TEXT, nullable -> **speakers_keynotes_translations JSONB**), event_type (event_type_enum), event_date (TIMESTAMPZ), event_end_date (TIMESTAMPZ), submission_deadline (TIMESTAMPZ), submission_verdict_deadline (TIMESTAMPZ), full_paper_deadline (TIMESTAMPZ), wilaya_id (FK to wilayas), daira_id (FK to dairas), format (event_format_enum), logo_url (TEXT, nullable), email (TEXT), phone (TEXT), website (TEXT, nullable), price (NUMERIC, nullable), qr_code_url (TEXT, nullable), brochure_url (TEXT, nullable)

9. **bookmarks**: Many-to-many relationship for user bookmarks of events
   - Primary fields: profile_id (FK to profiles), event_id (FK to events)

10. **submissions**: Paper submissions for events
    - Primary fields: id (UUID, PK), event_id (FK to events), submitted_by (FK to profiles), status (submission_status_enum), title (TEXT -> **title_translations JSONB**), abstract (TEXT -> **abstract_translations JSONB**), abstract_file_url (TEXT), abstract_file_metadata (JSONB, optional), full_paper_file_url (TEXT, nullable), full_paper_file_metadata (JSONB, optional), submission_date (TIMESTAMPZ), review_date (TIMESTAMPZ, nullable), review_feedback (TEXT, Nullable -> **review_feedback_translations JSONB** - *Mandatory only if status is 'rejected'*)

11. **subscriptions**: Tracks user subscription status and lifecycle.
    - Primary fields: id (UUID, PK), user_id (FK to profiles), tier (subscription_tier_enum), status (subscription_status_enum), start_date (TIMESTAMPZ), end_date (TIMESTAMPZ, nullable), trial_ends_at (TIMESTAMPZ, nullable)

12. **payments**: Records manual payment verification details.
    - Primary fields: id (UUID, PK), user_id (FK to profiles), subscription_id (FK to subscriptions, nullable), status (payment_status_enum), amount (NUMERIC), billing_period (billing_period_enum), payment_method_reported (payment_method_enum), reported_at (TIMESTAMPZ), verified_at (TIMESTAMPZ, nullable), admin_verifier_id (FK to admin profiles, nullable), admin_notes (TEXT) - *Likely internal, translation may not be needed.*

13. **email_templates**: Stores editable email templates.
    - Primary fields: template_key (TEXT, UNIQUE), subject (TEXT -> **subject_translations JSONB**), body_html (TEXT -> **body_html_translations JSONB**), description (TEXT -> **description_translations JSONB**), available_placeholders (TEXT[]) - *Admin panel edits only `ar` content for MVP.*

14. **email_log**: Tracks email sending attempts and status.
    - Primary fields: id (UUID, PK), created_at, recipient_email, template_key, payload (JSONB), status (ENUM: 'attempted', 'sent', 'failed', 'retry_attempted'), attempted_at, last_attempt_at, retry_count, error_message (TEXT), resend_message_id (TEXT, nullable)

## Payment Strategy

#### Current Implementation (Priority)
- Manual, email-driven process: Users email admin for verification and payment.
- Admin verifies identity/payment offline via email.
- Admin uses the platform interface to record payment details (in `payments` table) and mark payment as 'verified'.
- Verifying a payment triggers the creation/update of the corresponding user record in the `subscriptions` table, setting the correct tier, status ('active'), and calculating the `end_date` based on the billing period.
- Email notifications triggered by related admin actions.
- **Automated Expiry:** Scheduled functions run daily to check `subscriptions` table for expired trials (`trial_ends_at`) or active subscriptions (`end_date`) and update their status accordingly (e.g., to 'expired').

#### Future Implementation
- Chargily Pay integration for Algerian online payment methods
- Automated payment verification

## Arabic Language Support

- Full interface support for Arabic **(MVP Scope)**
- RTL layout for Arabic content
- Arabic-specific formatting for dates, numbers, and currency
- **Note:** English and French language support planned for future phases.

## Feature Differentiation By Tier

- **Tier Limits:** Enforced via backend checks (e.g., Edge Functions) before performing limited actions like event creation/publishing.
### Free Researcher Tier
- Access to event listings and details
- Event bookmarking
- 1 month trial of premium features

### Paid Researcher Tier
- Paper submission capabilities
- Repository access with download tracking
- Verification badge (after approval)
- Submission tracking and management

### Free Organizer Tier
- Event creation (up to 1 active event)
- Submission management and review tools
- Verified organizer status
- Event analytics dashboard
- 1 month trial access

### Paid Organizer Tier
- Event creation (up to 5 active events)
- Submission management and review tools
- Verified organizer status
- Event analytics dashboard

## User Flows

### Researcher User Flows

#### Registration & Verification Flow
1. User selects "Researcher" role, registers with email/password.
2. User completes researcher profile (Arabic), selecting location from data sourced from `wilayas.json`.
3. System assigns free tier + 1-month trial.
4. User receives welcome email with instructions to email admin for verification/payment.
5. User emails admin (details/proof per admin request).
6. Admin reviews details via email.
7. Admin uses platform interface to mark user as verified and/or activate paid tier.
8. System applies badge/activates tier upon admin action; user notified.
9. Verification (one-time) and payment (recurring) are separate processes.

#### Subscription Activation Flow
1. User needs paid subscription.
2. User emails admin to inquire about payment.
3. Admin emails payment instructions (bank, check, cash).
4. User pays and confirms via email.
5. Admin verifies payment offline.
6. Admin uses platform interface to activate paid tier.
7. User receives email confirmation triggered by admin action.

#### Event Discovery Flow
1. User searches for events using keywords, topics, location, or dates
2. User views detailed event information
3. User saves interesting events to their bookmarks (if subscribed)
4. User receives email notifications about upcoming deadlines for saved events (if subscribed)

#### Paper Submission Flow (Paid tier)
1. User finds an event accepting submissions.
2. User creates submission (title, abstract, topic).
3. User uploads abstract file (PDF, DOC, DOCX; max 5MB).
4. System confirms submission and sets initial status (e.g., 'Received'). **Submissions cannot be edited after this point.**
5. User receives email notifications for status changes. If rejected, the notification includes mandatory feedback from the organizer.
6. If accepted, user uploads full paper (PDF, DOC, DOCX; max 5MB) by deadline.
7. User tracks submission status on dashboard.
8. User can download their own submitted files (abstract/full paper) at any time from their profile/dashboard area after uploading.

### Organizer User Flows

#### Registration & Verification Flow
1. User selects "Organizer" role, registers with email/password.
2. User completes organizer profile (Arabic), selecting location via separate Wilaya and Daira dropdowns populated from the database (initially sourced from `wilayas.json`).
3. System assigns free tier + 1-month trial.
4. User receives welcome email with instructions to email admin for verification/payment.
5. User emails admin (institutional proof per admin request).
6. Admin reviews proof via email.
7. Admin uses platform interface to mark user as verified and/or activate paid tier.
8. User receives badge/tier activation upon admin action; user notified.
9. Verification (one-time) and payment (recurring) are separate processes.

#### Subscription Activation Flow
1. User needs paid subscription.
2. User emails admin to inquire about payment.
3. Admin emails payment instructions (bank, check, cash).
4. User pays and confirms via email.
5. Admin verifies payment offline.
6. Admin uses platform interface to activate paid tier.
7. User receives email confirmation triggered by admin action.

#### Event Creation & Management Flow
1. An organizer creates a new event with required details. **Event details cannot be edited after publishing in MVP.** Tier limits (e.g., max active events) are checked before creation/publishing.
2. Organizer associates event with topics.
3. System publishes event.
4. Organizer receives email notifications when researchers submit papers.
5. Organizer uses dedicated tools to review submissions:
    - Download abstract/full paper files.
    - Update submission status (e.g., accepted, rejected).
    - Provide mandatory feedback in a dedicated text field *only* when rejecting a submission. This feedback is saved and included in the notification email to the researcher.
6. After event completion, organizer changes event status to "completed".
7. Organizer can extend event deadlines:
    - Interface shows future dates (submission deadline, verdict deadline, full paper deadline, event start/end).
    - Organizer edits dates.
    - System updates dates and notifies submitters.
8. Organizer can cancel an event:
    - Event status changes to 'Canceled'.
    - Event and associated submissions/files are soft-deleted (hidden).
    - Submitters are notified of the cancellation.
    - After a grace period (e.g., 30 days), a scheduled function (`purge-deleted-events`) permanently deletes event and associated data.
9. Accepted papers from completed events are displayed on the event page and repository.

### Administrator User Flows

#### Verification Processing Flow
1. Admin receives verification request emails from users.
2. Admin communicates with users via email to obtain necessary information/proof.
3. Admin logs into the platform.
4. Admin navigates to the user management section, finds the user.
5. Admin uses a simple control (e.g., button, toggle) to set the user's verification status to 'Approved' or 'Rejected'.
6. System updates user status, applies badge if approved, and triggers notification email. Admin may optionally add internal notes.

#### Payment Verification Flow
1. Admin receives payment confirmation emails from users.
2. Admin verifies payment offline (checking bank records, etc.).
3. Admin logs into the platform.
4. Admin navigates to a dedicated payment management section or the user's profile.
5. Admin records the payment details in the `payments` table (amount, period, method) and marks the payment status as 'verified'.
6. This action automatically creates/updates the relevant `subscriptions` record for the user, setting status to 'active' and calculating the `end_date`.
7. System triggers notification email to the user confirming subscription activation.

#### Platform Management Flow (MVP Scope)
1. **Dashboard:** Overview display of key metrics (user counts by type, total events, total submissions, active paid subscription count).
2. **User Management:**
    - Read: View user list with basic filtering (e.g., by type, status). View detailed profiles (including subscription status/history).
    - Update: Suspend users. Manually update user verification status (individual controls).
3. **Payment Management:**
    - Read: View list of payment records.
    - Create/Update: Manually create/update payment records and mark status as 'verified' to trigger subscription activation.
    - Delete: Allow deletion for correction purposes.
4. **Subscription Management:**
    - Read: View list of subscriptions. *(Managed implicitly via Payment verification, but viewable)*.
5. **Event Management:**
    - Read: View event list with basic filtering (e.g., by status).
    - Update: Edit event details (**Admins can edit published events for critical cases; Organizers cannot in MVP**. Organizers needing critical changes must contact an admin).
    - Delete: Delete non-completed events (and associated submissions).
6. **Submission Management:**
    - Read: View submissions list. Download submitted files.
7. **Topic Management:**
    - Create, Read, Update, Delete (Full basic CRUD).
8. **Email Template Management:**
    - Read: View template list/details.
    - Update: Edit subject and body. *(Create/Delete deferred post-MVP)*.
9. **Email Log Management:**
    - Read: View email log with filtering/sorting.

## MVP Implementation Strategy

This section outlines the planned approach for implementing core functionalities, aiming to leverage Supabase features effectively while minimizing Edge Function complexity where feasible.

### Solved Primarily by Direct Query (Client-Side with RLS)

These actions can generally be performed directly by the frontend application using Supabase client libraries, relying heavily on well-defined Row Level Security (RLS) policies for data access control.

*   Authenticate user login and manage sessions.
*   Fetch profile data for the current user.
*   Update simple profile data fields.
*   Display verification status/badge (read `is_verified`).
*   Retrieve and filter lists of published events.
*   Retrieve full details for a specific event.
*   Retrieve lists of submissions (for researcher or organizer).
*   Get download URLs for submission/paper files (Storage client).
*   Perform repository search for accepted papers.
*   Bookmark/unbookmark events and list bookmarks.
*   Retrieve email templates/logs (Admin Panel display).
*   Admin: Update user verification status (`is_verified`).
*   Admin: Record payment details.
*   Admin: Mark payment as 'verified'.
*   Admin: Retrieve simple dashboard metrics.
*   Admin: Retrieve lists of users, payments, subscriptions, events, submissions, templates, logs.
*   Admin: Suspend/unsuspend user accounts.
*   Admin: CRUD operations for payments and topics.
*   Admin: Update email template content.

### Solved Primarily by DB Function/Trigger

These operations involve database-level automation, complex checks, or ensuring data integrity through PostgreSQL functions and triggers, often coupled with RLS.

*   **RLS Policies:** Core data access control logic.
*   **`handle_new_user()` (DB Function - Triggered by Auth Hook):** Handles creation of profile records (`profiles`, specific type profile) and initial subscription setup upon new user registration via Supabase Auth.
*   **`handle_payment_verification()` (DB Function - Triggered by `payments` update):** Automatically creates/updates `subscriptions` when a payment is marked 'verified'. Potentially queues email notification task.
*   **Tier Limit Checks (Trigger/Constraint):** Enforce limits (e.g., active events) during event creation/publishing.
*   **Notification Queue Triggers:** Insert tasks into a `notification_queue` table upon specific data changes (user verification, submission status, event updates) for later processing by an Edge Function.
*   **(Data Seeding Utility):** A one-time script (e.g., Node.js/Python) reads `wilayas.json` and populates the `wilayas` and `dairas` tables via the Supabase client library. This is run during initial setup.

### Requires Edge Function

These functions handle tasks involving external services (email, file storage), asynchronous processing, complex setup logic, or scheduled tasks triggered by Supabase Cron.

*   **Password Reset Flow:** Manage token lifecycle and trigger password reset email (likely invokes internal `send-email` logic).
*   **Process Notification Queue (Scheduled Function - Supabase Cron):** Periodically reads `notification_queue`, calls `send-email` logic, updates queue status.
*   **`send-email` (Internal Logic):** Core email sending via Resend API, including logging. Not directly exposed; called by DB triggers (via queue) or other Edge Functions.
*   **Handle File Uploads:** Secure endpoint for validating and uploading files to Supabase Storage.
*   **`check-deadlines` (Scheduled Function - Supabase Cron):** Periodically checks event deadlines and queues necessary reminder notifications.
*   **`check-subscriptions-expiry` (Scheduled Function - Supabase Cron):** Periodically checks for expiring/expired trials and subscriptions, updates their status in the `subscriptions` table, and queues necessary notification tasks.
*   **`purge-deleted-events` (Scheduled Function - Supabase Cron):** Periodically performs permanent deletion of old canceled events.
*   **(Optional) Complex Admin Dashboard Metrics:** For metrics unsuitable for direct client queries.
