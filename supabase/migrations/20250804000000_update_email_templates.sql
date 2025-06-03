-- Update email templates to use the new feedback structure
-- This migration updates all email templates that use feedback to work with the new format
-- where feedback is a JSONB object with a 'content' field
-- Update abstract_accepted_notification template
UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{ar}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'ar',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'abstract_accepted_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{en}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'en',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'abstract_accepted_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{fr}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'fr',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'abstract_accepted_notification';

-- Update abstract_rejected_notification template
UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{ar}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'ar',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'abstract_rejected_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{en}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'en',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'abstract_rejected_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{fr}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'fr',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'abstract_rejected_notification';

-- Update full_paper_accepted_notification template
UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{ar}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'ar',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'full_paper_accepted_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{en}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'en',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'full_paper_accepted_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{fr}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'fr',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'full_paper_accepted_notification';

-- Update full_paper_rejected_notification template
UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{ar}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'ar',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'full_paper_rejected_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{en}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'en',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'full_paper_rejected_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{fr}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'fr',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}',
                '{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'full_paper_rejected_notification';

-- Update revision_requested_notification template
-- This template seems to use feedback directly without the {{#feedback}} wrapper
UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{ar}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'ar',
                '<p><strong>ملاحظات المقيّمين:</strong></p>\r\n               <p>{{feedback.ar}}</p>',
                '<p><strong>ملاحظات المقيّمين:</strong></p>\r\n               {{#feedback}}<p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'revision_requested_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{en}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'en',
                '<p><strong>Reviewer Feedback:</strong></p>\r\n               <p>{{feedback.en}}</p>',
                '<p><strong>Reviewer Feedback:</strong></p>\r\n               {{#feedback}}<p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'revision_requested_notification';

UPDATE
    public.email_templates
SET
    body_html_translations = jsonb_set(
        body_html_translations,
        '{fr}',
        to_jsonb(
            REPLACE(
                body_html_translations ->> 'fr',
                '<p><strong>Commentaires des évaluateurs:</strong></p>\r\n               <p>{{feedback.fr}}</p>',
                '<p><strong>Commentaires des évaluateurs:</strong></p>\r\n               {{#feedback}}<p>{{feedback.content}}</p>{{/feedback}}'
            )
        )
    )
WHERE
    template_key = 'revision_requested_notification';

-- Mark the templates as updated
UPDATE
    public.email_templates
SET
    updated_at = CURRENT_TIMESTAMP
WHERE
    template_key IN (
        'abstract_accepted_notification',
        'abstract_rejected_notification',
        'full_paper_accepted_notification',
        'full_paper_rejected_notification',
        'revision_requested_notification'
    );

-- Output success message
DO $$ BEGIN 
  RAISE NOTICE 'Email templates updated successfully to use the new feedback format';
END $$;