# Eventy360: Academic Event & Research Discovery Platform

## Project Overview

Eventy360 is a comprehensive SaaS platform designed to revolutionize academic event management and research discovery in Algeria. The platform connects researchers with academic events, streamlines the submission process, and creates a centralized repository for research papers. It solves the critical problems of information fragmentation, lack of trust mechanisms, and inefficient submission workflows in the Algerian academic ecosystem.

## Core Problems Solved

1. **Information Fragmentation** - Academic events are announced across disparate channels (university websites, social media, notice boards), making discovery difficult and time-consuming
2. **Limited Trust Mechanisms** - Researchers struggle to distinguish reputable events from questionable ones without formal verification
3. **Manual Submission Processes** - Paper submissions often involve email attachments and manual tracking
4. **Access Barriers** - Finding research papers post-event requires personal connections or navigating multiple disconnected repositories
5. **Workflow Inefficiency** - Event organizers handle submissions, reviews, and communication through disconnected tools

## Target Audience

- **Researchers**: Students, professors, scientists seeking academic events and research opportunities
- **Organizing Institutions**: Universities, research centers, and academic departments hosting events
- **Administrators**: Platform managers ensuring quality, processing verifications, and maintaining the system

## Key Features

### User Management
- Three distinct user types: researchers, organizers, and administrators
- Comprehensive profile systems for each user type
- Verification system with institutional validation
- Multilingual user interface (Arabic, French, English)

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
- Centralized storage of accepted papers
- Metadata-based search and discovery
- Download tracking and analytics
- Associated event context for each paper

### Search and Discovery
- Multilingual full-text search
- Advanced filtering capabilities
- Topic-based recommendations
- Saved searches and bookmarking

### Verification System
- Institutional email verification
- Document proof upload and review
- Verified badges for trusted accounts

### Notification System
- Email-based notifications for key events
- Template-based for consistency
- Status change triggers
- Language-specific templates

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
- Row Level Security policies
- Database functions and triggers
- Soft delete functionality

### Deployment
- Vercel for frontend hosting
- Supabase Cloud for backend services
- GitHub Actions for CI/CD

## Database Schema

### ENUMs

The database uses PostgreSQL ENUMs for strictly typed data categorization:

1. **user_type_enum**: `researcher`, `organizer`, `admin`
2. **language_enum**: `ar`, `fr`, `en`
3. **institution_type_enum**: `university`, `university_center`, `national_school`, `research_center`, `research_laboratory`, `activities_service`, `research_team`
4. **event_type_enum**: `scientific_event`, `cultural_event`, `sports_event`, `competition`
5. **event_format_enum**: `physical`, `virtual`, `hybrid`
6. **event_status_enum**: `published`, `active`, `completed`, `canceled`
7. **submission_status_enum**: `received`, `under_review`, `accepted`, `rejected`
8. **subscription_status_enum**: `free`, `paid`, `trial`, `expired`
9. **payment_status_enum**: `pending`, `verified`, `rejected`
10. **payment_method_enum**: `bank`, `check`, `cash`, `online`
11. **verification_status_enum**: `submitted`, `under_review`, `approved`, `rejected`
12. **file_type_enum**: `abstract`, `full_paper`
13. **billing_period_enum**: `monthly`, `quarterly`, `biannual`, `annual`

### Tables

The database schema includes the following core tables:

1. **profiles**: Core user information with user type and language preference
   - Primary fields: id, email, user_type, preferred_language, is_verified

2. **researcher_profiles**: Extended information for researcher users
   - Primary fields: profile_id, name, institution, academic_position, bio, profile picture, wilaya, daira

3. **organizer_profiles**: Extended information for organizer users
   - Primary fields: profile_id, name, type, bio, profile picture, wilaya, daira

4. **admin_profiles**: Extended information for admin users
   - Primary fields: profile_id, name

5. **subscriptions**: Subscription information for users
   - Primary fields: profile_id, tier, subscription_status and dates

6. **payments**: Payment tracking for subscriptions
   - Primary fields: subscription_id, reference_code, amount, currency, status, payment_method, payment_proof, verified_by, verified_at

7. **topics**: Research and event topics for categorization
   - Primary fields: id, slug, name

8. **user_topics**: Many-to-many relationship between users and topics
   - Primary fields: profile_id, topic_id

9. **verification_requests**: Requests for researcher and organizer verification
   - Primary fields: profile_id, status, institutional_email, proof_document, processed_by, processed_date

10. **events**: Core event information
    - Primary fields: created_by, status, who_organizes, event_name, event_subtitle (optional), problem_statement, submission_guidelines, event_axes, event_objectives, target_audience, scientific_committees, speakers_keynotes (optional), event_type, event_date, event_end_date, submission_deadline, submission_verdict_deadline, full_paper_deadline, location, format, logo_url (optional), email, phone, website (optional), price (if paid), qr_code (optional), brochure (optional)

11. **event_topics**: Many-to-many relationship between events and topics
    - Primary fields: event_id, topic_id

12. **saved_events**: Many-to-many relationship for user bookmarks of events
    - Primary fields: profile_id, event_id

13. **submissions**: Paper submissions for events
    - Primary fields: event_id, submitted_by, status, language, title, abstract, abstract_file related fields, full_paper related fields, submission_date, review_date

14. **submission_topics**: Many-to-many relationship between submissions and topics
    - Primary fields: submission_id, topic_id

15. **email_queue**: Email notification queue with tracking
    - Primary fields: to_email, template_id, subject, body, data, language, status, and tracking fields (opened_at, clicked_at, bounced_at)

## Payment Strategy

### Current Implementation (Priority)
- Offline payment tracking system for traditional methods
- Manual verification workflow by administrators
- Email notifications for payment instructions and status updates

### Future Implementation
- Chargily Pay integration for Algerian online payment methods
- Automated payment verification

## Multilingual Support

- Full interface support for Arabic, French, and English
- RTL layout for Arabic content
- Language-specific formatting for dates, numbers, and currency
- User language preference persistence

## Feature Differentiation By Tier

### Free Researcher Tier
- Access to event listings and details
- Event bookmarking
- 1 month trial of premium features

### Paid Researcher Tier
- Paper submission capabilities
- Repository access with download tracking
- Verification badge (after approval)
- Submission tracking and management

### Paid Organizer Tier
- Event creation (up to 5 active events)
- Submission management and review tools
- Verified organizer status
- Event analytics dashboard

## User Flows

### Researcher User Flows

#### Registration & Verification Flow
1. User selects "Researcher" role and registers with email/password
2. User completes researcher profile
3. System automatically assigns free tier with 1-month trial access
4. User receives welcome email with trial information
5. User can optionally request verification:
   - Submits institutional email
   - Uploads proof document
   - Waits for admin verification
   - Receives verification badge upon approval

#### Subscription Activation Flow
1. User selects paid researcher subscription tier
2. System shows payment instructions
3. User makes payment via traditional method (bank, check, cash)
4. User uploads payment proof
5. Administrator verifies payment
6. System activates paid subscription
7. User receives confirmation email

#### Event Discovery Flow
1. User searches for events using keywords, topics, location, or dates
2. User views detailed event information
3. User saves interesting events to their bookmarks (if subscribed)
4. User receives email notifications about upcoming deadlines for saved events (if subscribed)

#### Paper Submission Flow (Paid tier)
1. User navigates to an event accepting submissions
2. User creates a new submission with title, abstract, and topic selection
3. User uploads abstract file in required format
4. System confirms submission with status "received"
5. User receives email notification when submission status changes
6. If accepted, user uploads full paper before deadline
7. User tracks submission status through personal dashboard

### Organizer User Flows

#### Registration & Verification Flow
1. User selects "Organizer" role and registers with email/password
2. User completes organizer profile
3. System automatically assigns free tier with 1-month trial access
4. User receives welcome email with trial information
5. User submits verification request with institutional proof
6. Administrator reviews and approves verification
7. User receives verified organizer badge

#### Subscription Activation Flow
1. User selects paid organizer subscription tier
2. System shows payment instructions
3. User makes payment via traditional method (bank, check, cash)
4. User uploads payment proof
5. Administrator verifies payment
6. System activates paid subscription
7. User receives confirmation email

#### Event Creation & Management Flow
1. Verified organizer creates new event with required details
2. Organizer associates event with relevant topics
3. System publishes event and makes it searchable
4. Organizer receives email notifications when researchers submit papers
5. Organizer reviews submissions and updates their status
6. After event completion, organizer changes event status to "completed"
7. organizer can extend or cancel
8. after event completion the accepted papers are displayed in the event page
9. accepted papers for completed events are accessible throught the repository

### Administrator User Flows

#### Verification Processing Flow
1. Admin views pending verification requests
2. Admin examines institutional email and proof documents
3. Admin approves or rejects verification request
4. System updates user verification status and sends email notification
5. Verified users receive verification badge

#### Payment Verification Flow
1. Admin views pending payment verifications
2. Admin checks payment proof
3. Admin approves or rejects payment
4. System activates subscription for approved payments
5. User receives email notification about payment status

#### Platform Management Flow
1. Admin manages users
2. Admin manages topics
3. Admin manages platform content
4. admin manages submissions