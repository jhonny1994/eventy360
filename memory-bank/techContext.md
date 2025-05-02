# Technical Context

## Database Schema

The Eventy360 platform is built on a comprehensive PostgreSQL database schema managed through Supabase with the following key components:

### Core Data Types
- **ENUMs**: We use PostgreSQL ENUMs for strictly typed data categorization:
  - `user_type_enum`: researcher, organizer, admin
  - `language_enum`: ar, fr, en
  - `institution_type_enum`: university, university_center, national_school, research_center, research_laboratory, activities_service, research_team
  - `event_type_enum`: scientific_event, cultural_event, sports_event, competition
  - `event_format_enum`: physical, virtual, hybrid
  - `event_status_enum`: published, active, completed, canceled
  - `submission_status_enum`: received, under_review, accepted, rejected
  - `subscription_tier_enum`: free_researcher, paid_researcher, paid_organizer
  - `subscription_status_enum`: active, inactive, pending, trial, expired
  - `payment_status_enum`: pending, verified, rejected
  - `payment_method_enum`: bank_transfer, check, cash, online_payment
  - `verification_status_enum`: submitted, under_review, approved, rejected
  - `verification_type_enum`: researcher, organizer
  - `file_type_enum`: abstract, full_paper
  - `template_type_enum`: welcome, verification, payment, submission, event
  - `email_status_enum`: pending, sent, failed

### Key Tables
- **User-related tables**: profiles, researcher_profiles, organizer_profiles, admin_profiles
- **Subscription-related tables**: subscriptions, payments
- **Event-related tables**: events, event_topics, saved_events
- **Submission-related tables**: submissions, submission_keywords, submission_files
- **Verification tables**: verification_requests
- **Topic management tables**: topics, user_interests
- **Email system tables**: email_templates, email_queue, email_logs
- **Analytics tables**: analytics_events, audit_logs

### Database Functions
The schema implements several PostgreSQL functions to automate common operations:
- `update_updated_at_column()`: Automatically updates timestamps
- `create_default_subscription()`: Creates a default subscription for new users
- `handle_verification_approval()`: Processes verification approvals
- `handle_payment_verification()`: Processes payment verifications 
- `generate_payment_reference()`: Creates unique payment reference codes
- `handle_submission_status_change()`: Manages submission status updates
- `check_active_events_limit()`: Enforces organizer event limits
- `soft_delete_record()`: Implements soft deletion

### Database Views
Pre-defined views for common access patterns:
- `upcoming_events`: Events with future dates
- `events_open_for_submissions`: Events with open submission deadlines
- `recent_submissions`: Latest submissions with event and researcher details
- `pending_verifications`: Verification requests awaiting review
- `pending_payments`: Payment verifications awaiting processing
- `user_dashboard_summary`: User-specific dashboard information

### Security Model
- Row Level Security (RLS) policies for all tables
- Policies based on user roles, subscription status, and ownership
- Soft deletion support for data retention
- Audit logging for critical operations

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Internationalization**: next-intl
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context
- **Component Architecture**: Mixture of Server and Client Components

### Backend
- **Supabase Platform**:
  - PostgreSQL database
  - Supabase Auth for authentication
  - Supabase Storage for file storage
  - Supabase Edge Functions for serverless functions
  - Supabase Realtime for live updates
  - Supabase Scheduled Functions for background tasks
  - Row Level Security (RLS) for access control

### Deployment
- **Frontend**: Vercel
- **Backend**: Supabase Cloud
- **CI/CD**: GitHub Actions

## Authentication & Authorization

### Authentication
- JWT-based authentication through Supabase Auth
- Email/password authentication
- Email verification
- Token refresh strategy
- Session management

### Authorization
- Role-based access control (researcher, organizer, admin)
- Subscription tier access limitations
- Row-level security policies
- Route protection with Next.js middleware
- Server-side authorization checks

## File Storage

- Supabase Storage for all file uploads
- Bucket organization:
  - `verification_documents`: For user verification documents
  - `submission_files`: For research paper uploads
  - `event_assets`: For event logos, banners, etc.
  - `payment_proofs`: For payment verification documents
- Access control via RLS policies
- File type validation
- Size limits enforcement
- File metadata tracking

## Internationalization

- Three supported languages: Arabic (ar), French (fr), English (en)
- RTL layout support for Arabic
- Translation files organized by feature
- Locale-specific formatting for:
  - Dates
  - Numbers
  - Currency (DZD)
- User language preference persistence

## Payment Processing

### Current Implementation
- Offline payment processing for traditional methods:
  - Bank transfers
  - Checks
  - Cash
- Manual verification workflow:
  1. User uploads payment proof
  2. Payment reference code is generated
  3. Admin verifies payment details
  4. Subscription is activated upon verification
- Email notifications for payment status updates

### Future Implementation
- Integration with Chargily Pay for online payment methods
- Automated payment verification

## Development Environment

### Required Tools
- Node.js (v16+)
- npm or yarn
- Git
- Supabase CLI
- VS Code with recommended extensions

### Local Setup
- Supabase local development
- Environment variable configuration
- Local database seeding
- Development server
- Hot module reloading

## Testing Strategy

- Component testing with React Testing Library
- API testing with Jest
- End-to-end testing with Playwright
- Database testing with Supabase test helpers
- Internationalization testing
- Mobile responsiveness testing

## Performance Optimization

- Server Components for improved rendering
- Image optimization with Next.js Image
- API route caching strategies
- Database query optimization
- Full-text search indexes
- Pagination for large datasets
- Lazy loading for components and routes

## Security Measures

- CSRF protection
- XSS prevention
- SQL injection protection through Supabase
- Content Security Policy (CSP)
- Rate limiting for sensitive operations
- HTTPS enforcement
- Regular security audits

## Technical Constraints

- Supabase limits for database and storage
- Vercel deployment constraints
- File size limitations for uploads
- Active events limit per organizer (5)
- API rate limiting