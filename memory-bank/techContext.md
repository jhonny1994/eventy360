# Technical Context: Eventy360

## 1. Core Technologies

*   **Frontend Framework**: Next.js (App Router) ✅ IMPLEMENTED
*   **UI Language**: React with TypeScript ✅ IMPLEMENTED
*   **Styling**: Tailwind CSS v4 ✅ IMPLEMENTED
*   **UI Components**: Flowbite ✅ IMPLEMENTED
*   **Theme Switching**: `next-themes` (managing light/dark mode) ✅ IMPLEMENTED
*   **Internationalization**: `next-intl` (Arabic locale with RTL support for MVP) ✅ IMPLEMENTED
*   **Forms**: React Hook Form with Zod validation ✅ IMPLEMENTED
*   **Backend Platform**: Supabase ✅ IMPLEMENTED
    *   **Database**: PostgreSQL with ENUMs, Functions, Triggers, and RLS ✅ IMPLEMENTED
    *   **Authentication**: Supabase Auth ✅ IMPLEMENTED
    *   **File Storage**: Supabase Storage ✅ IMPLEMENTED
    *   **Serverless Functions**: Supabase Edge Functions (Deno) ✅ IMPLEMENTED
    *   **Scheduling**: Supabase Cron Jobs ✅ IMPLEMENTED
*   **Email Service**: Resend API ✅ IMPLEMENTED

## 2. Development Environment & Setup

*   **Package Manager**: npm
*   **Node.js**: >= 18.x
*   **Supabase CLI**: Required for local development
*   **Code Repository**: Git (GitHub)
*   **Environment Variables**: Managed via `.env.local` for local development
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `RESEND_API_KEY`
    *   `SUPABASE_DB_PASSWORD` (local dev)

## 3. Deployment & Infrastructure

*   **Frontend**: Vercel (connected to GitHub repo)
*   **Backend**: Supabase Cloud
*   **CI/CD**: GitHub Actions workflow for automated deployments

## 4. Key Technical Constraints

*   **Arabic Language & RTL**: Required throughout UI, data handling, and configuration for MVP ✅ IMPLEMENTED
*   **Manual MVP Processes**: Admin-driven verification and payment workflows ✅ IMPLEMENTED
*   **RLS Complexity**: Careful design of policies for all user roles ✅ IMPLEMENTED
*   **Edge Function Limitations**: Deno runtime with execution limits
*   **Database Migrations**: Managed via Supabase CLI ✅ IMPLEMENTED
*   **Loading State Strategy**: ✅ IMPLEMENTED
    *   App Router loading files
    *   Client-side loading states
*   **Error Handling Strategy**: ✅ IMPLEMENTED
    *   App Router error boundaries
    *   Client component error handling
    *   Edge function standardized responses
*   **Security**: Protected keys, validated inputs, secure file handling ✅ IMPLEMENTED

## 5. Data Handling Specifics

*   **User Profile State**: Uses `is_extended_profile_complete` flag for workflow control ✅ IMPLEMENTED
*   **Translatable Content**: JSONB columns with Arabic as primary language ✅ IMPLEMENTED
*   **Location Data**: Uses separate text columns for languages ✅ IMPLEMENTED
*   **File Uploads**: Type and size validation with structured storage paths ✅ IMPLEMENTED

## 6. Custom Hooks & Standardization ✅ IMPLEMENTED

*   **useAuth**: Authentication state and Supabase client access
*   **useUserProfile**: Profile data access
*   **useSubscription**: Subscription data and status
*   **useSubscriptionCheck**: Premium feature protection
*   **useTranslations**: i18n translations
*   **useLocale**: Locale-specific data
*   **Wrapper Components**:
    *   ProfileDataProvider: Wrapper for useUserProfile
    *   PremiumFeatureGuard: Wrapper for useSubscriptionCheck 