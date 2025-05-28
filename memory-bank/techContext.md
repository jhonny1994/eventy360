# Technical Context: Eventy360

## 1. Core Technologies

*   **Frontend Framework**: Next.js (App Router)
*   **UI Language**: React with TypeScript
*   **Styling**: Tailwind CSS v4
*   **UI Components**: Flowbite
*   **Theme Switching**: `next-themes` (managing light/dark mode)
*   **Internationalization**: `next-intl` (Arabic locale with RTL support for MVP)
*   **Forms**: React Hook Form with Zod validation
*   **Backend Platform**: Supabase
    *   **Database**: PostgreSQL with ENUMs, Functions, Triggers, and RLS
    *   **Authentication**: Supabase Auth
    *   **File Storage**: Supabase Storage
    *   **Serverless Functions**: Supabase Edge Functions (Deno)
    *   **Scheduling**: Supabase Cron Jobs
*   **Email Service**: Resend API

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

*   **Arabic Language & RTL**: Required throughout UI, data handling, and configuration for MVP
*   **Manual MVP Processes**: Admin-driven verification and payment workflows
*   **RLS Complexity**: Careful design of policies for all user roles
*   **Edge Function Limitations**: Deno runtime with execution limits
*   **Database Migrations**: Managed via Supabase CLI
*   **Loading State Strategy**:
    *   App Router loading files
    *   Client-side loading states
*   **Error Handling Strategy**:
    *   App Router error boundaries
    *   Client component error handling
    *   Edge function standardized responses
*   **Security**: Protected keys, validated inputs, secure file handling

## 5. Data Handling Specifics

*   **User Profile State**: Uses `is_extended_profile_complete` flag for workflow control
*   **Translatable Content**: JSONB columns with Arabic as primary language
*   **Location Data**: Uses separate text columns for languages
*   **File Uploads**: Type and size validation with structured storage paths 