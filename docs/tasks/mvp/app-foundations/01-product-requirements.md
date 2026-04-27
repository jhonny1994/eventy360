# Product Requirements

Date: 2026-04-25

## Product Definition

Eventy360 mobile is a researcher operations app for academic event participation and research workflow management.

It is not:

- a marketing site,
- an attendee companion,
- an organizer/admin console,
- a partial mobile wrapper over the website.

## Existing Web Feature Baseline To Reuse

The mobile product should start by inheriting existing researcher feature behavior from the web product wherever it already works well, instead of inventing parallel workflows.

Observed baseline in the current web app:

- profile completion is mandatory before full access,
- the researcher dashboard surfaces profile completion, verification, subscription state, and recent activity,
- event discovery already exists inside the researcher profile area,
- submissions are researcher-only and begin from event discovery,
- topic subscriptions are researcher-only and subscription-gated,
- subscriptions and payments already share a dedicated payment page with history and reporting modes,
- verification already combines current status, uploader, and document guidance,
- repository already exists as a dedicated researcher area.

Mobile should preserve these product semantics first, while using mobile and Flutter best practices for onboarding, navigation, forms, permissions, accessibility, and platform behavior.

Additional concrete behaviors confirmed in the web implementation:

- submissions list is researcher-only and redirects non-researchers away,
- event submission entry checks deadline, user role, duplicate submission, and existing submission redirect,
- topic subscription UI uses optimistic updates with duplicate-subscription defense,
- bookmark actions revalidate user stats because bookmarks affect profile completion,
- payment flow is a two-step report flow followed by proof upload,
- repository download is currently premium-guarded and tracks analytics before opening the file URL,
- profile completion metrics currently include subscribed, verified, participated in event, and bookmarked event milestones.

## Target User

Primary user: researcher

Supporting personas:

- Deadline-driven submitter
- Topic-following scanner
- Status-anxious author
- Premium knowledge seeker
- Account and trust manager

## In-Scope Features

- Researcher onboarding
- Authentication and session restoration
- Researcher onboarding and profile
- Home dashboard
- Event discovery and event detail
- Bookmarks and saved events
- Topic subscriptions
- Abstract submission
- Full-paper submission
- Revision submission
- Submission detail, history, and feedback
- Verification workflow
- Subscription state and premium gating
- In-app payment flow for the current business process
- Repository browse, detail, and protected download
- Push notifications
- In-app notification inbox
- Settings, language, theme, and account actions

## Out Of Scope

- Organizer/admin mobile parity
- Anonymous repository use
- Play Store and App Store automation in first release
- Offline final writes for submissions, verification, or payment
- Promotional push campaigns

## Product Goals

1. Deliver a complete researcher mobile experience rather than a read-only companion.
2. Reduce friction in deadline-driven and document-heavy workflows.
3. Make status changes and critical deadlines actionable through mobile notifications.
3. Make subscribed-topic event discovery and relevant researcher updates actionable through mobile notifications.
4. Preserve trust for sensitive researcher documents and payment flows.
5. Create an architecture that can support future iOS expansion without major redesign.
6. Preserve task continuity so researchers can return to the exact context they were in after interruption, restart, or notification entry.

## Functional Requirements

### Authentication And Account

1. Researcher sign-up, sign-in, sign-out, password reset, and email confirmation must work on mobile.
2. Unsupported account roles must be blocked from mobile product flows.
3. Session restoration must survive app restarts.

### Onboarding

4. The app must provide a proper mobile onboarding flow that follows app industry standards.
5. Onboarding must be short, value-oriented, and must not front-load notification permission.
6. Onboarding must route users into profile completion or the app shell based on existing account state.
7. Onboarding must respect locale and RTL from the first session.
8. Onboarding must be skippable or minimal for returning authenticated users who already completed setup.

### Profile

9. Profile completion must be required before full app access.
10. Researchers must be able to edit their profile after onboarding.
11. Preferred language and theme must persist per user.

### Discovery And Topics

12. Researchers must be able to browse events with mobile-friendly filtering and pagination.
13. Event details must clearly present deadlines, eligibility, instructions, and next actions.
14. Researchers must be able to bookmark events.
15. Researchers must be able to manage topic subscriptions.
16. Search, filters, and relevant list context should be restorable when moving between list and detail screens.

### Submissions

17. Researchers must be able to see submission status, feedback, and history.
18. Researchers must be able to submit abstracts, full papers, and revisions when eligible.
19. Long forms may persist drafts, but final writes require live backend validation.
20. Submission flows must preserve draft and context across app backgrounding or recoverable interruption.
21. Submission detail must present a clear timeline with one primary next action.

### Verification, Subscription, And Payment

22. Researchers must be able to submit verification documents.
23. Researchers must be able to view subscription and premium state.
24. The app must support the current in-app payment process, including proof or reference handling and payment history.
25. Verification and payment blockers must preserve return-to-task behavior after resolution.

### Repository

26. Entitled users must be able to browse accepted papers and view details.
27. Downloads must be protected by authenticated access checks.

### Notifications

28. The app must support critical push notifications and an in-app inbox.
29. Push notifications must primarily serve subscribed-topic event discovery for researchers.
30. The app may also support in-app notification records for other researcher workflow updates where appropriate.
31. Users must be able to control notification preferences at a basic category level.
32. Notification entry must restore the user to the exact relevant in-app context whenever possible.

### Home Experience

33. The app must provide a researcher command center home screen.
34. Home must surface account state, profile progress, verification status, subscription or trial state, urgent deadlines, active submission state, and relevant event shortcuts.
35. The home screen must help the user identify the highest-priority next action within a short session.

## Success Metrics

- Researcher can complete onboarding on Android.
- Researcher can discover events, submit work, complete payment, and access the repository from mobile.
- Critical notifications drive the user to the correct in-app destination.
- Theme selection persists across launches.
- Drafts, filters, and key user context survive common interruption paths.
- Signed Android release artifacts are produced reliably from the release workflow.
