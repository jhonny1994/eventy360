# Eventy360 Payment & Subscription Implementation Plan

## Overview
This document outlines the implementation plan for the payment and subscription management features of Eventy360. It serves as a tracking tool to monitor progress and ensure all components are properly implemented.

## Core Requirements

- **Production-Ready Implementation**: All code must be robust, well-tested, and free of errors
- **Minimal Existing Code Changes**: Leverage existing patterns and minimize modifications to working code
- **Arabic Language Support**: All user-facing text must support Arabic localization
- **Complete Admin Logging**: All admin actions must be properly logged
- **Email Notifications**: Comprehensive email notifications for all significant events
- **Security & Access Control**: Enforce proper permissions throughout the system
- **UI Consistency**: Follow existing UI patterns, component structure, and design language
- **Supabase Singleton**: Use the existing Supabase singleton pattern for all database interactions

## Subscription System Structure

### Tier and Status System
The subscription system has the following dimensions:

#### Subscription Tiers (`subscription_tier_enum`)
- `free`: Basic access tier
- `paid_researcher`: Enhanced access for researchers
- `paid_organizer`: Enhanced access for event organizers
- `trial`: Temporary full access for evaluation

#### Subscription Status (`subscription_status_enum`)
- `active`: Valid, paid subscription
- `expired`: Previously valid subscription that has ended
- `trial`: Within trial period
- `cancelled`: Deliberately terminated subscription

#### Billing Periods (`billing_period_enum`)
- `monthly`: Standard monthly billing
- `quarterly`: 3-month billing with discount (5%)
- `biannual`: 6-month billing with larger discount (10%)
- `annual`: 12-month billing with maximum discount (15%)

### Payment Workflow
- User uploads payment proof (similar to verification document upload)
- Payment status initially set to `pending_verification`
- Admin reviews payment proof and approves/rejects
- If approved, status becomes `verified` and subscription is activated/extended
- If rejected, status becomes `rejected` and user is notified
- Payment methods include bank transfer, check, cash, and online payments
- Payment records linked to subscriptions and users

### Pricing System
Configured in `app_settings` table:
- Base prices for different user types (`base_price_researcher_monthly`, `base_price_organizer_monthly`)
- Discounts for longer billing periods (`discount_quarterly`, `discount_biannual`, `discount_annual`)
- Payment information for bank transfers (`account_holder`, `bank_name`, `account_number_rib`, `payment_email`)

## Existing Database Components

### Tables
- `subscriptions`: Tracks user subscription details, status, and validity periods
- `payments`: Records payment history with verification status
- `app_settings`: Stores system-wide settings including pricing information
- `admin_actions_log`: Logs admin actions related to payments and subscriptions

### Triggers
- [x] `payment_verification_trigger`: Sends notifications when payment is verified
- [x] `on_payment_verified`: Updates subscription when payment status changes to verified
- [x] `payment_reported_trigger`: Processes newly reported payments
- [x] `on_payment_verified_update_subscription`: Updates subscription based on verified payment

### Functions
- [x] `billing_period_to_interval`: Converts billing periods to PostgreSQL intervals
- [x] `handle_payment_verification`: Sends notifications for verified payments
- [x] `handle_payment_reported`: Processes and notifies about new payment reports
- [x] `check_subscriptions_expiry`: Manages trial expiration and notifications
- [x] `is_admin`: Security function to verify admin status

## Implementation Phases

The implementation will proceed in logical phases, each requiring review and approval before moving to the next:

### Phase 1: Backend Foundation
- [x] Create/adapt Edge Function for payment proof upload
- [x] Implement core RPC functions:
  - [x] Payment verification
  - [x] Manual payment recording
  - [x] Subscription pricing calculation
- [x] Update database triggers as needed

### Phase 2: Admin Payment Verification UI
- [ ] Create admin payment verification dashboard
- [ ] Implement payment list and detail views
- [ ] Add approval/rejection functionality
- [ ] Implement admin logging

### Phase 3: User Payment Reporting
- [ ] Create payment proof upload component
- [ ] Implement payment reporting form
- [ ] Build payment instructions display
- [ ] Add payment history view for users

### Phase 4: Subscription Management
- [ ] Implement subscription status display
- [ ] Create feature access controls
- [ ] Add tier-specific feature guards
- [ ] Integrate with user profiles

### Phase 5: Email Notifications & Internationalization
- [ ] Create/update email templates
- [ ] Implement Arabic translations
- [ ] Ensure RTL layout support
- [ ] Configure notification triggers

### Phase 6: Testing & Production Preparation
- [ ] Complete unit and integration tests
- [ ] Perform security review
- [ ] Optimize performance
- [ ] Prepare deployment artifacts

## Detailed Implementation Plan

### 1. Backend Functions

#### Payment Document Upload
- [x] Create or adapt Edge Function for payment proof upload
  - [x] Similar to `upload-verification-document` Edge Function
  - [x] Store payment proof in appropriate storage bucket
  - [x] Return secure URL for the uploaded document
  - [x] Include appropriate error handling and validation
  - [x] Use Supabase singleton pattern for storage interactions

#### Admin Payment Management
- [x] Create `verify_payment` RPC function
  - [x] Parameters: payment_id, verify_status, admin_notes, rejection_reason (if applicable)
  - [x] Validates admin privileges
  - [x] Updates payment status
  - [x] Logs admin action to `admin_actions_log` table with detailed context
  - [x] Updates subscription if payment verified
  - [x] Triggers appropriate email notifications
  - [x] Returns updated payment details

- [x] Create `record_manual_payment` RPC function (for admin-initiated payments)
  - [x] Parameters: target_user_id, amount, billing_period, payment_method, admin_notes
  - [x] Validates admin privileges
  - [x] Creates verified payment record
  - [x] Logs admin action to `admin_actions_log` table with detailed context
  - [x] Triggers appropriate email notifications
  - [x] Returns payment ID and subscription details

#### Subscription Management
- [x] Create `get_subscription_pricing` RPC function
  - [x] Parameters: user_type, billing_period
  - [x] Calculates price based on app_settings and applicable discounts
  - [x] Returns calculated price and discount information in both Arabic and default language formats

- [x] Create `get_subscription_details` helper function
  - [x] Retrieves comprehensive subscription information for a user
  - [x] Includes trial/expiry information, tier, status, and associated payments

### 2. Admin UI Components

#### Payment Verification Dashboard
- [ ] Create `/admin/payments/pending` page
  - Follow existing admin page layout patterns
  - List of payments awaiting verification (similar to verification requests)
  - Payment proof viewer/previewer
  - Approval/rejection interface
  - Pagination and filtering
  - Clear success/error messages

- [ ] Create `AdminPaymentVerificationList` component
  - Match existing admin list component styling
  - Similar to verification request list
  - Shows payment amount, date, user, and status
  - Quick actions for approve/reject
  - Sorting and filtering
  - Proper loading states and empty states

- [ ] Create `PaymentVerificationDetail` component
  - Match existing detail component patterns
  - Payment proof document viewer
  - User information
  - Payment details (amount, billing period, method)
  - Approval form with notes field
  - Rejection form with reason field
  - Admin action logging confirmation

#### Payment Management Dashboard
- [ ] Create `/admin/payments` page
  - Use existing admin dashboard layout
  - List of all payments with filtering and search
  - Status indicators and quick actions
  - Pagination and sorting
  - Export functionality

- [ ] Create `AdminPaymentList` component
  - Consistent with other admin list components
  - Tabular display of payments
  - Status indicators
  - Action buttons
  - Sorting and filtering controls

- [ ] Create payment detail view
  - Follow existing detail view patterns
  - Payment information
  - Associated subscription details
  - Payment proof document
  - Status history and admin notes
  - Admin action log for this payment

#### Manual Payment Recording
- [ ] Create `RecordPaymentForm` component for admin use
  - Match existing form styling and validation patterns
  - User selection with search
  - Amount and billing period inputs
  - Payment method selection
  - Admin notes field
  - Submission handler with error states
  - Success confirmation with logging details

### 3. User-Facing Components

#### Payment Proof Upload
- [ ] Create `PaymentProofUpload` component
  - Mirror verification document upload component
  - File selector with validation
  - Preview capability
  - Upload progress indicator
  - Success confirmation
  - Error handling with helpful messages
  - All text in both Arabic and default language

#### Subscription Status Display
- [ ] Create `SubscriptionStatusIndicator` component
  - Match existing status indicator patterns
  - Visual indicator of current status
  - Expiry countdown for active/trial subscriptions
  - Upgrade prompts for free/expired users
  - Fully localized status messages in Arabic

- [ ] Create `PaymentHistoryDisplay` component
  - Consistent with other history display components
  - List of user's payment history
  - Status indicators
  - Payment proof thumbnails/links
  - Verification status
  - Localized date formats and status messages

#### Payment Reporting
- [ ] Create `ReportPaymentForm` component
  - Follow existing form patterns
  - Payment amount and billing period selection
  - Payment method selection
  - Reference information input
  - Payment proof upload integration
  - Submission handler with confirmation
  - All labels and messages in Arabic
  - Proper validation with localized error messages

- [ ] Create `PaymentInstructionsDisplay` component
  - Match existing instruction display patterns
  - Display of bank information from app_settings
  - Instructions based on payment method
  - Reference number handling
  - Instructions in Arabic with proper RTL support

### 4. Feature Access Controls

- [ ] Create `withSubscriptionGuard` Higher-Order Component
  - Utilize existing HOC patterns
  - Wraps premium features with subscription checks
  - Redirects or shows upgrade prompts for ineligible users
  - Localized messages explaining access restrictions

- [ ] Create `useSubscription` hook
  - Follow existing hook patterns
  - Provides subscription status and details to components
  - Exposes helper methods for subscription-based UI decisions
  - Handles loading states and error conditions

- [ ] Implement tier-specific feature flags
  - Researcher-specific features
  - Organizer-specific features
  - Premium vs. free features
  - Clear UI indicators for feature access levels

### 5. Internationalization

- [ ] Implement Arabic translations for all new UI components
  - Use existing translation system and patterns
  - Ensure proper Right-to-Left (RTL) layout support
  - Include translation keys for all user-facing strings
  - Support number formatting in Arabic

- [ ] Create multilingual email templates
  - Payment verification notifications
  - Payment rejection notifications
  - Subscription status updates
  - Trial expiry warnings

- [ ] Ensure proper date/time formatting for Arabic locale
  - Subscription expiry dates
  - Payment dates
  - Trial period countdowns

### 6. Email Notification System

- [ ] Create or update email templates in the database
  - `payment_reported_confirmation`: Sent when user reports payment
  - `payment_verified_notification`: Sent when payment is verified
  - `payment_rejected_notification`: Sent when payment is rejected
  - `subscription_activated`: Sent when subscription is activated/extended
  - `trial_ending_soon`: Sent when trial is about to expire
  - `trial_expired`: Sent when trial has expired

- [ ] Ensure all templates have proper translations
  - Arabic content with appropriate RTL formatting
  - Placeholders for dynamic content
  - Consistent styling with existing emails

- [ ] Update notification triggers as needed
  - Ensure payments table triggers generate appropriate notifications
  - Configure proper scheduling for trial expiry notifications

### 7. Admin Logging

- [ ] Ensure all admin actions are logged to `admin_actions_log` table
  - Payment verification actions (approve/reject)
  - Manual payment recording
  - Subscription status changes
  - Include detailed context in the `details` JSON field

- [ ] Create admin log viewer component
  - Match existing admin components
  - Filter by action type
  - Filter by admin user
  - Filter by target user
  - Show detailed information on each action

- [ ] Implement logging confirmations
  - Confirmation messages after admin actions
  - Include logging ID for reference
  - Allow adding additional notes to logs

## Integration Points

- [ ] Update user profile page with subscription information
- [ ] Add subscription status to navigation/header
- [ ] Integrate feature guards throughout application
- [ ] Connect payment proof upload to subscription management
- [ ] Implement admin workflows for payment verification (similar to document verification)
- [ ] Maintain UI consistency with verification features
- [ ] Ensure RTL layout works correctly throughout new components

## Testing Strategy

- [ ] Unit tests for RPC functions
  - Test admin privilege validation
  - Test payment status transitions
  - Test subscription updates
  - Test price calculations

- [ ] Integration tests for payment-subscription interactions
  - Test payment verification workflow
  - Test subscription activation/extension
  - Test trial expiry logic
  - Test notification generation

- [ ] UI component tests with mocked subscription states
  - Test component rendering in different states
  - Test form validation logic
  - Test Arabic language display
  - Test RTL layout rendering

- [ ] End-to-end tests for payment proof upload and verification workflows
  - Test complete user payment reporting flow
  - Test admin verification flow
  - Test rejection flow and notifications
  - Test manual payment recording

- [ ] Security tests for admin functions
  - Test permission validations
  - Test access control mechanisms
  - Test data integrity constraints

## Production Readiness Checklist

- [ ] Code Quality
  - No TypeScript/ESLint errors or warnings
  - Consistent code style following project conventions
  - Comprehensive error handling
  - Performance optimizations (pagination, indexing)

- [ ] Database Considerations
  - Proper indexes on frequently queried fields
  - Transaction management for critical operations
  - RLS policies for security
  - No breaking schema changes

- [ ] Security Measures
  - Proper input validation and sanitization
  - Role-based access control throughout
  - Security review of file upload/storage
  - Protection against common vulnerabilities

- [ ] Resilience
  - Graceful error handling
  - Retry mechanisms for critical operations
  - Fallback states for UI components
  - Consistent loading and error states

- [ ] Deployment Preparation
  - Database migrations reviewed and tested
  - RPC functions deployed and tested
  - UI components verified in staging
  - Email templates verified
  - Subscription status transitions tested
  - Payment verification workflow validated
  - File storage for payment proofs configured correctly
  - Internationalization verified

## Progress Tracking

- Phase 1 (Backend Foundation): 100%
- Phase 2 (Admin Payment Verification UI): 0%
- Phase 3 (User Payment Reporting): 0%
- Phase 4 (Subscription Management): 0%
- Phase 5 (Email Notifications & Internationalization): 0%
- Phase 6 (Testing & Production Preparation): 0%
- Overall progress: 16.67% 