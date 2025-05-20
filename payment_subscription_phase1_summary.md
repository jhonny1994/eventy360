# Payment & Subscription Phase 1 Implementation Summary

This document summarizes the backend foundation established for the payment and subscription features. Phase 1 has been completed, implementing all necessary database structures and functionality.

## Components Implemented

### 1. Storage Bucket for Payment Proofs

A new `payment_proofs` storage bucket has been created with the following characteristics:
- Maximum file size: 10MB
- Allowed file types: PDF, JPEG, PNG
- Private (not public) with appropriate RLS policies
- Users can only access their own payment proofs
- Admins can view all payment proofs

File organization follows the pattern: `payment_proofs/{user_id}/{timestamp}_{filename}` for easy organization and user-specific access controls.

### 2. Payments Table Structure Updates

The `payments` table has been enhanced with new fields:
- `proof_document_path`: Path to the uploaded payment proof document
- `reference_number`: Optional reference number for tracking payments (especially bank transfers)
- `payer_notes`: Additional notes provided by the user when reporting a payment

### 3. Edge Function for Payment Proof Upload

Created an Edge Function (`upload-payment-proof`) that:
- Accepts a file upload and payment details via form data
- Validates file type, size, and authorization
- Securely stores the file in the payment_proofs bucket
- Creates a payment record with status "pending_verification"
- Returns success response with payment ID and document path

### 4. RPC Functions

#### 4.1. `verify_payment`
Admin function to approve or reject a payment:
- Parameters: `payment_id`, `verify_status`, `admin_notes`, `rejection_reason`
- Validates admin privileges
- Updates payment status to "verified" or "rejected"
- Sets verification timestamp and admin ID
- Logs admin action to `admin_actions_log`
- Returns success response with payment details

#### 4.2. `record_manual_payment`
Admin function to directly record a payment:
- Parameters: `target_user_id`, `amount`, `billing_period`, `payment_method`, `admin_notes`
- Validates admin privileges
- Creates a new payment record with status "verified"
- Logs admin action to `admin_actions_log`
- Returns success response with payment and subscription IDs

#### 4.3. `get_subscription_pricing`
Calculates subscription pricing based on user type and billing period:
- Parameters: `user_type`, `billing_period`
- Retrieves pricing settings from `app_settings`
- Applies appropriate discounts for longer billing periods
- Returns comprehensive pricing details (base price, discount, final price)

#### 4.4. `get_subscription_details`
Retrieves comprehensive subscription information for a user:
- Parameters: `target_user_id` (optional, defaults to current user)
- Validates permissions (users can only view their own details, admins can view any)
- Retrieves subscription status, tier, expiry information
- Includes recent payment history
- Returns comprehensive subscription details as JSON

### 5. App Settings Updates

Added pricing fields to the `app_settings` table:
- `base_price_researcher_monthly`: Monthly subscription price for researchers
- `base_price_organizer_monthly`: Monthly subscription price for organizers
- `discount_quarterly`: Percentage discount for 3-month subscriptions
- `discount_biannual`: Percentage discount for 6-month subscriptions 
- `discount_annual`: Percentage discount for 12-month subscriptions

## Security Considerations

- All functions validate user permissions appropriately
- Admin functions are protected with admin role checks
- RLS policies ensure users can only access their own data
- Service role client is used only where necessary (file uploads)
- All functions use proper error handling and input validation

## Next Steps

With the backend foundation in place, the next phase will focus on implementing the Admin Payment Verification UI (Phase 2):
1. Create admin payment verification dashboard
2. Implement payment list and detail views
3. Add approval/rejection functionality
4. Implement admin action logging display 