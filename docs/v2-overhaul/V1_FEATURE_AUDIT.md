# V1 Feature Audit

This document lists all existing features in the V1 application to ensure 100% parity in V2.

## 1. Public Pages & Authentication
- **Landing Page (`/`)**: Hero, Pathway, Features, Pricing, CTA, Footer.
- **Authentication**:
  - Login (`/login`)
  - Register (`/register`)
  - Forgot Password (`/forgot-password`)
  - Reset Password (`/reset-password`)
  - Email Confirmation (`/confirm-email`)
  - Auth Callback (`/auth/callback`, `/callback`)
- **Onboarding**:
  - Complete Profile (`/complete-profile`) - Extended profile data collection.

## 2. User Workspace (`/profile`)
- **Dashboard**: Main user overview.
- **Events**:
  - My Events (`/profile/events`)
  - Create Event (`/events/create`) - *Requires Subscription*
  - Manage Event (`/events/manage`) - *Requires Subscription*
  - Edit Event (`/events/[id]/edit`) - *Requires Subscription*
- **Submissions**:
  - My Submissions (`/profile/submissions`)
  - Submission Management (`/profile/events/[id]/submissions`)
- **Repository**:
  - My Repository (`/profile/repository`)
- **Bookmarks**:
  - Saved Events/Items (`/profile/bookmarks`)
- **Topics**:
  - Topic Interests (`/profile/topics`)
- **Subscriptions**:
  - Plan Management (`/profile/subscriptions`)
- **Settings**:
  - Edit Profile (`/profile/edit`)
  - Security (`/profile/security`)
  - Verification (`/profile/verification`) - Document upload.

## 3. Admin Dashboard (`/admin`)
- **Auth**:
  - Admin Login (`/admin/login`)
  - Create Admin Account (`/admin/create-account`)
  - Invite Admin (`InviteAdminButton`, `InviteAdminModal`)
- **Dashboard (`/admin/dashboard`)**:
  - **Overview**: Main stats and charts.
  - **Admins**: Manage admin users (`/admin/admins`).
  - **Users**: Manage platform users (`/admin/users`).
  - **Events**: Approve/Reject events (`/admin/events`).
  - **Payments**: Record and view payments (`/admin/payments`).
  - **Submissions**: Global submission oversight (`/admin/submissions`).
  - **Topics**: Manage research topics (`/admin/topics`).
  - **Verifications**: Review user verification documents (`/admin/verifications`).

## 4. Event Features
- **Discovery**: Event listing, search, filtering.
- **Details Page**:
  - Header (Title, Date, Location)
  - Description
  - Timeline/Schedule
  - Location Map
  - Actions (Register, Submit, etc.)
- **Creation Flow**: Multi-step form (`/components/events/creation`).

## 5. Submission System
- **Submission Form**: For authors to submit papers.
- **Review System**:
  - Abstract Review
  - Full Paper Review
  - Revision Review

## 6. Integrations & Infrastructure
- **Supabase Auth**: User management, RLS.
- **Supabase Database**: Core data.
- **Supabase Storage**: Profile pictures, Verification docs, Submission files.
- **i18n**: Internationalization (ar/en/fr implied).
- **Subscription Guards**: Middleware protection for premium features.
