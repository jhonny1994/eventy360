# Admin Routes Implementation Plan

## Overview
This document outlines the plan for implementing and enhancing the admin routes in Eventy360, with a focus on simplifying the user interface and improving admin workflow.

## Routes Implementation Status

### Users Route (`/users`)
- [x] Create basic list page with user type filter
- [x] Implement search by name functionality
- [x] Add columns: profile photo, name, email, user type, verification status
- [x] Add "View Verification" button linking to verification detail page
- [x] Add "View Subscription" button linking to current subscription detail page
- [x] Add basic pagination
- [x] Add translations to `ar.json` for Users route

### Verifications Route (`/verifications`) - ✅ Exists
- [x] List page with filtering
- [x] Detail page implementation
- [x] Add direct link button to detail page from list view
- [x] Improve mobile responsiveness
- [x] Update translations in `ar.json` for new verification features

### Payments Route (`/payments`) - ✅ Exists
- [x] List page with filtering
- [x] Detail page implementation
- [x] Add direct link button to detail page from list view
- [x] Improve mobile responsiveness
- [x] Update translations in `ar.json` for new payment features

### Events Route (`/events`) - ✅ Exists
- [x] Create basic list page with status filter
- [x] Implement search by name functionality
- [x] Add columns: event name, date, organizer, status
- [x] Add view details modal
- [x] Add basic pagination
- [x] Add translations to `ar.json` for Events route

### Submissions Route (`/submissions`) - ✅ Exists
- [x] Create basic list page with status filter
- [x] Add columns: title, author, event, status
- [x] Implement view details modal (view-only)
- [x] Add download option for papers
- [x] Add basic pagination
- [x] Add translations to `ar.json` for Submissions route

### Topics Route (`/topics`) - ✅ Exists
- [x] List page implementation
- [x] Create/Edit modals
- [x] Delete functionality
- [x] Translations in `ar.json` exist

### Email Templates Route (`/email-templates`)
- [ ] Create basic list page with search
- [ ] Add columns: template key, description
- [ ] Implement view details modal (view-only)
- [ ] Display multilingual content in modal
- [ ] Add basic pagination
- [ ] Add translations to `ar.json` for Email Templates route

### Email Logs Route (`/email-logs`)
- [ ] Create basic list page with status filter
- [ ] Add columns: date, recipient, subject, status
- [ ] Implement view details modal (view-only)
- [ ] Display error details if applicable
- [ ] Add basic pagination
- [ ] Add translations to `ar.json` for Email Logs route

## Shared Components

### DetailLinkButton Component
- [ ] Create reusable button component for linking to detail pages
- [ ] Implement consistent styling
- [ ] Add disabled state handling
- [ ] Ensure RTL support
- [ ] Add common translations to `ar.json` for detail buttons

### AdminDetailModal Component
- [ ] Create reusable modal component for view-only details
- [ ] Implement consistent header, body, footer sections
- [ ] Add size options (sm, md, lg, xl)
- [ ] Ensure RTL support
- [ ] Add common translations to `ar.json` for modals

## Database Integration

### Users & Verifications
- [ ] Join `profiles` table with `verification_requests`
- [ ] Use existing verification detail pages

### Submissions
- [ ] Use `submissions` table with related `submission_versions`
- [ ] Display data from `paper_analytics` for view/download counts

### Email Templates
- [ ] Use `email_templates` table directly
- [ ] Display multilingual content from `subject_translations` and `body_html_translations`

### Email Logs
- [ ] Use `email_log` table directly
- [ ] Show related template information when available

## Translation Management

### Translation Keys Structure
- [ ] Create consistent naming convention for admin route translations
- [ ] Organize keys by route (e.g., `AdminUsers`, `AdminSubmissions`)
- [ ] Include common sections in each route namespace:
  - [ ] Table headers
  - [ ] Filter labels
  - [ ] Button texts
  - [ ] Modal content
  - [ ] Status labels
  - [ ] Error messages

### Translation Process
- [ ] Extract translatable strings during each route implementation
- [ ] Add English strings to the default locale
- [ ] Add Arabic translations to `ar.json` after each route is completed
- [ ] Test translations in RTL layout

## Testing & Quality Assurance
- [ ] Test all routes with different user types
- [ ] Verify RTL support for Arabic language
- [ ] Test all translations in context
- [ ] Test mobile responsiveness
- [ ] Verify all database queries are optimized
- [ ] Test error handling scenarios

## Deployment
- [ ] Deploy changes incrementally by route
- [ ] Monitor performance after each deployment
- [ ] Document new features for admin users
- [ ] Verify translations in production environment 