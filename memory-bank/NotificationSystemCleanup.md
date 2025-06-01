# Notification System Cleanup

## Project Overview
This project aimed to simplify the email notification system in Eventy360 by removing all URLs, emails, and clickable elements from email templates, retaining only essential information in the final emails.

## Implementation Progress
- [x] **Phase 1: Analysis & Mapping**
  - [x] Analyze and map current email template structure
  - [x] Analyze SQL functions creating notifications
- [x] **Phase 2: Implementation**
  - [x] Update send-email Edge Function
  - [x] Create SQL Migration for Email Templates
  - [x] Update SQL Functions for Notification Payloads
  - [x] Fix remaining template format issues
- [ ] **Phase 3: Verification**
  - [ ] Conduct System Testing

## Known Issues and Limitations

The following issues were identified and addressed during implementation:

### 1. Template Format Inconsistencies

- **Issue:** Some older templates (like `verification_request_submitted`) were using bracket-style placeholders `[placeholder]` while newer templates use mustache-style `{{placeholder}}`.
- **Solution:** All templates have been standardized to use mustache-style placeholders, and the `send-email` Edge Function has been updated to process only this format.
- **Status:** ✅ Fixed in migration `20250701000000_update_email_templates_plain_text.sql`

### 2. Conditional Mustache Placeholders

- **Issue:** Some academic event email templates use conditional mustache syntax like `{{#feedback}}...{{/feedback}}`, but the Edge Function only implements simple variable replacement.
- **Solution Options:**
  - Option 1 (Recommended): Pre-process conditionals at the SQL function level before sending to notification_queue
  - Option 2: Add a proper Mustache templating engine to the Edge Function (complex)
  - Option 3: Simplify templates by removing conditional tags
- **Status:** ⚠️ Documented but requires implementation decision

### 3. Static Templates vs Dynamic Payloads

- **Issue:** Some templates like `user_verified_badge_removed` have been made static (no dynamic placeholders) while SQL functions might still include fields like `rejection_reason`.
- **Solution:** SQL functions have been updated to align with the static nature of these templates. The trigger functions now handle any necessary conditional text inclusion before sending to the notification system.
- **Status:** ✅ Fixed in migration `20250701000001_update_notification_sql_functions.sql`

### 4. Edge Function Processing Logic

- **Issue:** The `send-email` Edge Function only processed bracket-style placeholders (`[placeholder]`) but templates were being updated to mustache-style (`{{placeholder}}`).
- **Solution:** The Edge Function has been updated to process mustache-style placeholders with an appropriate regex pattern.
- **Status:** ✅ Fixed in `send-email` Edge Function

## Migration Files

### 1. Email Template Migration (`20250701000000_update_email_templates_plain_text.sql`)

This migration:
- Updates all email templates to use mustache-style placeholders (`{{placeholder}}`)
- Standardizes template format across all notification types
- Removes URLs and clickable elements from templates
- Makes some templates intentionally static (no dynamic placeholders)
- Includes detailed comments about conditional placeholders in academic event templates

### 2. SQL Function Migration (`20250701000001_update_notification_sql_functions.sql`)

This migration:
- Updates SQL functions to generate payloads with keys matching template placeholders
- Ensures snake_case consistency between payload keys and template placeholders
- Removes obsolete URL/email fields from payloads
- Aligns functions with static templates where appropriate

## Edge Function Update

The `send-email` Edge Function has been updated to:
- Process mustache-style placeholders with regex pattern: `/\{\{([A-Za-z0-9_.-]+)\}\}/g`
- Improve error handling and logging
- Maintain backward compatibility where possible

## System Considerations

### Notification Type Consistency
- The `handle_notification_insert()` trigger should be reviewed to ensure all critical templates are properly categorized as "immediate"

### Error Message Enhancement
- The `send-email` Edge Function should return more descriptive error messages
- Include template names and missing placeholder details in error messages

### Rate Limiting
- Consider reviewing Resend API rate limits
- Implement configurable delays between sends for high-volume scenarios
- Consider exponential backoff for failed sends

### Trigger Sequencing
- The `update_notification_queue_placeholders()` trigger correctly runs BEFORE INSERT on notification_queue
- This ensures payload cleanup happens before notification processing

## Next Steps

1. Decide on an approach for handling conditional mustache placeholders in academic event templates
2. Implement notification system for new events in subscribed topics using the standardized mustache format
3. Conduct comprehensive testing of the updated notification system
4. Enhance error messages in the Edge Function for better troubleshooting 