# Conditional Mustache Placeholders in Eventy360 Email Templates

## Overview

Eventy360's email notification system now supports conditional Mustache placeholders, allowing for dynamic content inclusion based on data presence. This feature is particularly useful for academic event email templates where reviewer feedback may or may not be provided.

## Implementation Details

The `send-email` Edge Function has been enhanced to support two types of Mustache placeholders:

1. **Regular Placeholders**: `{{variable_name}}`
2. **Conditional Blocks**: `{{#section}}...{{/section}}`

### How Conditional Blocks Work

When processing an email template, the Edge Function:

1. First processes all conditional blocks using the pattern: `/\{\{#([A-Za-z0-9_.-]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g`
2. Checks if the section name exists in the payload data and has a truthy value
3. If truthy, includes the content within the block (processing any nested placeholders)
4. If falsy or not present, removes the block entirely
5. After processing all conditional blocks, processes regular placeholders as before

### Nested Property Access

The implementation also supports nested property access using dot notation:

- `{{feedback.en}}` - Accesses the `en` property within the `feedback` object
- `{{event_name.ar}}` - Accesses the `ar` property within the `event_name` object

This is particularly useful for multi-language content stored in JSON objects.

## Example Usage

### Template with Conditional Feedback

```html
<p>Dear Researcher,</p>
<p>Thank you for submitting your abstract titled <strong>"{{submission_title.en}}"</strong>.</p>
<p>After careful review, we regret to inform you that your abstract has not been accepted.</p>
<p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>
<p>We appreciate your interest in our event.</p>
```

### SQL Function Implementation

```sql
CREATE OR REPLACE FUNCTION public.handle_submission_feedback(
  submission_id uuid,
  feedback_text jsonb,
  decision_status text
) RETURNS void AS $$
BEGIN
  -- Create notification with conditional feedback
  INSERT INTO public.notification_queue (
    template_key,
    recipient_profile_id,
    notification_type,
    payload_data,
    status
  ) VALUES (
    'abstract_rejected_notification',
    researcher_id,
    'immediate',
    jsonb_build_object(
      'event_id', event_id,
      'submission_id', submission_id,
      'event_name', event_name,
      'submission_title', submission_title,
      -- Include feedback only if it exists
      CASE WHEN feedback_text IS NOT NULL AND feedback_text != '{}'::jsonb THEN
        'feedback', feedback_text
      ELSE
        NULL, NULL -- This pair will be filtered out by jsonb_build_object
      END
    ),
    'pending'
  );
END;
$$ LANGUAGE plpgsql;
```

## Best Practices

1. **Keep Conditionals Simple**: Use conditionals only when necessary, and keep their structure simple.

2. **Verify Payload Structure**: Ensure that your SQL functions provide the correct payload structure for the conditional blocks to work.

3. **Test Thoroughly**: Test templates both with and without the conditional data to ensure they render correctly in both cases.

4. **Use Consistent Naming**: Follow a consistent naming convention for conditional sections and their nested properties.

5. **Document Conditional Sections**: In the `available_placeholders` array of the email template, include both the section name and any nested properties.

6. **Handle Null Values Gracefully**: When building JSON payloads in SQL functions, handle null values appropriately:

   ```sql
   -- Good practice: This automatically filters out null values
   CASE WHEN feedback_text IS NOT NULL AND feedback_text != '{}'::jsonb THEN
     'feedback', feedback_text
   ELSE
     NULL, NULL -- This pair will be filtered out by jsonb_build_object
   END
   ```

## Limitations

1. **Simple Conditional Logic Only**: The implementation only supports simple existence checks (`{{#section}}` means "if section exists"). It does not support complex conditionals like `if/else` or comparisons.

2. **No Iterative Sections**: This implementation does not support iterating over arrays with `{{#each}}` or similar constructs.

3. **No Nested Conditionals**: While nested properties are supported, nested conditional blocks (conditionals within conditionals) are not currently supported.

## Example Templates

### Abstract Rejected Notification

```html
<p>Dear Researcher,</p>
<p>Thank you for submitting your abstract titled <strong>"{{submission_title.en}}"</strong>.</p>
<p>After careful review, we regret to inform you that your abstract has not been accepted.</p>
<p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>
<p>We appreciate your interest in our event.</p>
```

### Full Paper Accepted Notification

```html
<p>Dear Researcher,</p>
<p>Congratulations! Your full paper titled <strong>"{{submission_title.en}}"</strong> has been accepted.</p>
<p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>
<p>{{#presentation_details}}<p><strong>Presentation Details:</strong></p><p>Date: {{presentation_details.date}}</p><p>Time: {{presentation_details.time}}</p><p>Location: {{presentation_details.location}}</p>{{/presentation_details}}</p>
<p>Thank you for your valuable contribution.</p>
```

## Conclusion

The implementation of conditional Mustache placeholders enhances the flexibility of the Eventy360 email notification system, allowing for more dynamic and content-rich email templates. By following the best practices outlined in this document, you can create email templates that adapt to different scenarios while maintaining a clean and maintainable codebase. 