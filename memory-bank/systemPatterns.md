# System Patterns & Architecture: Eventy360

## 1. Overall Architecture

*   **Model**: Jamstack frontend + BaaS backend.
*   **Frontend**: Next.js (App Router) hosted on Vercel.
*   **Backend**: Supabase Platform (PostgreSQL DB, Auth, Storage, Edge Functions, Cron Jobs) hosted on Supabase Cloud.
*   **Communication**: Frontend uses Supabase client libraries for direct DB interaction (leveraging RLS), Auth, and Storage.
*   **Frontend Theming**: Uses Tailwind CSS v4 with theme colors and fonts defined in `globals.css`.

## 2. Key Backend Components

*   **Database (PostgreSQL)**:
    *   **Schema**: Relational model with tables for profiles, events, submissions, subscriptions, payments, topics, etc.
    *   **Data Types**: Uses PostgreSQL `ENUM` types for categorical data integrity.
    *   **Security**: Row Level Security (RLS) for authorization.
    *   **Automation**: DB Functions & Triggers for workflows (user creation, payment verification, etc.).
    *   **Data Integrity**: Foreign key constraints, NOT NULL constraints.
    *   **Metadata**: JSONB for flexible data storage.
*   **Authentication**: Supabase Auth for email/password login and session management.
*   **Storage**: Supabase Storage for file uploads (profile pics, submissions, etc.).
*   **Edge Functions**:
    *   `send-email`: Core email sending logic using Resend API.
    *   `process-notification-queue`: Scheduled function to process notification queue.
    *   Other scheduled functions for checking deadlines, subscription expiry, etc.
*   **Cron Jobs**: Scheduled functions for asynchronous tasks.

## 3. Key System Workflow Patterns

*   **Multi-Step User Onboarding**: ✅ IMPLEMENTED
    1.  Signup and profile creation
    2.  Email confirmation
    3.  Extended profile completion
    4.  Full access granted
*   **Manual Verification/Payment**: Admin-driven workflows for user verification and payment processing. ✅ IMPLEMENTED
*   **Asynchronous Email Notifications**: Decoupled sending via queue system. ✅ IMPLEMENTED
*   **State Management**: Status fields in database tables to track lifecycle of events, submissions, etc. ✅ IMPLEMENTED
*   **Tier Limit Enforcement**: Checks in backend logic based on subscription status. ✅ IMPLEMENTED
*   **Soft Deletion**: For canceled events with scheduled permanent removal. ✅ IMPLEMENTED

## 4. Database Design Patterns

*   **Relational Schema**: Clear tables with foreign key relationships. ✅ IMPLEMENTED
*   **Internationalization (i18n)**: ✅ IMPLEMENTED
    *   **JSONB Strategy**: Translatable user-generated content stored in JSONB columns.
    *   **TEXT Strategy**: Static location data uses separate text columns for languages.
    *   **Primary Language**: Arabic is primary, with structure to support future languages.
    *   **Indexing**: Appropriate indexes for performance optimization.
*   **ENUM Types**: For constrained categorical data. ✅ IMPLEMENTED
*   **Row Level Security**: Policies to enforce data access rules. ✅ IMPLEMENTED
*   **Database Functions & Triggers**: For automation and complex logic. ✅ IMPLEMENTED
*   **Soft Deletes**: Status-based approach for certain data types. ✅ IMPLEMENTED
*   **JSONB for Metadata**: For storing flexible non-translatable metadata. ✅ IMPLEMENTED

## 5. Admin Authentication Flow ✅ IMPLEMENTED

1.  **Admin Invitation**: Backend creates admin user and generates secure token.
2.  **Email Invitation**: System email with unique link sent to invited admin.
3.  **Account Creation**: Invited user sets password and completes profile.
4.  **Dedicated Admin Login**: Separate login flow with specific security checks.

## 6. Admin Dashboard Architecture ✅ IMPLEMENTED

*   **Layout Components**: Standardized structure with `AdminLayout`, `AdminNavbar`, `AdminSidebar`.
*   **Component Organization**: Centralized exports and consistent props interfaces.
*   **Dashboard Security**: Authentication checks and protected routes.
*   **Internationalization Support**: Translation keys for all UI elements with RTL support.
*   **UI Standardization**: Consistent styling, responsive design, and error handling.