# Researcher Journey And UX

Date: 2026-04-25

## Experience Thesis

Eventy360 mobile is a researcher operations app. It should feel calm, serious, mobile-native, and trustworthy around deadlines, documents, payments, and academic status changes.

The UI should help a researcher answer four questions quickly:

- What state am I in?
- What can I do now?
- What is blocking me?
- Where do I go next?

## Existing Web Flows To Preserve First

The first mobile version should borrow existing researcher product logic from the web app before introducing new behavior.

Observed web baselines that mobile should preserve:

- profile completion gate before full access,
- dashboard emphasis on profile completion, verification, and subscription state,
- researcher-only submissions area,
- event discovery as the entry point for starting a submission,
- subscription-gated topic management,
- payment area split between history and report flow,
- verification page combining current state, uploader, and guidance,
- repository as a dedicated researcher destination.

Mobile should not copy the web shell, sidebar structure, or page layout patterns. It should preserve feature semantics while using correct mobile and Flutter best practices for onboarding, bottom navigation, deep links, permissions, forms, upload flows, accessibility, and stateful return-to-task behavior.

Concrete web audit notes that affect mobile UX planning:

- the web dashboard uses profile completion as an engagement mechanic, so mobile home should preserve that “trust and progress” framing,
- the submissions area uses event discovery as the natural entry point for starting an abstract,
- the payment area uses history and report modes rather than a single long page,
- the verification area combines status, explanatory copy, accepted-document guidance, and uploader in one flow,
- topic subscriptions use optimistic UI and success or error feedback,
- repository access is premium-gated before the main content, not after the user drills deep.

## UX Principles

1. Every state has one primary next action.
2. Deadlines and eligibility appear before long descriptive content.
3. Uploads are guided workflows, not plain file fields.
4. Premium gates preserve user context and explain the unlock path.
5. Notification permission is requested only after the user has already experienced value.
6. Arabic RTL is a first-order requirement, not a late translation pass.
7. Raw backend enums never appear directly in the interface.
8. Sensitive document and payment states must feel secure and explicit.
9. Interruption recovery is part of the product, not an edge case.

## Target Researcher Modes

### Deadline Mode

The user opens the app because a submission, revision, or payment window is time-sensitive.

UI implication:

- the home screen must surface urgent deadlines first,
- submission detail must show current phase and required action immediately,
- notifications must deep-link to exact workflow context.

### Discovery Mode

The user is scanning for relevant events in short sessions.

UI implication:

- event discovery must be dense, fast to filter, and easy to bookmark,
- topic relevance should be visible without reading the full description,
- search and filters must survive navigation round-trips.

### Status Mode

The user is checking whether something changed.

UI implication:

- submission, verification, and payment states need clean labels,
- the app should show last update, current status, and what happens next,
- notification inbox and badges should support short check-ins without friction.

### Access Mode

The user is blocked by premium, payment, or verification state.

UI implication:

- the blocker should be explained in human terms,
- the unlock action should be immediate,
- returning to the original task after resolution should feel seamless.

## End-To-End Journey

### Stage 0: Onboarding

The app needs a real onboarding layer because this is a production mobile product.

Onboarding requirements:

- keep it short,
- explain researcher value clearly,
- do not ask for push permission on first frame,
- move quickly into sign-in, registration, or profile completion,
- respect locale and RTL from the beginning,
- support return users who reopen the app mid-journey.
- avoid feature tours that delay the first useful action.

Onboarding must fit the existing product truth:

- new or incomplete users should land in profile completion when required,
- authenticated complete researchers should not be forced through introductory screens repeatedly,
- organizer or admin accounts should exit to the unsupported-account route rather than enter the researcher app.

1. Install and launch
2. Sign in or create a researcher account
3. Confirm email or recover access through deep link
4. Complete required profile
5. Choose language, theme, and topics
6. Reach home command center
7. Discover and bookmark events
8. Review event details and eligibility
9. Submit abstract
10. Track submission status and feedback
11. Submit full paper when eligible
12. Submit revision when requested
13. Resolve verification or subscription blockers
14. Complete payment inside the mobile workflow
15. Browse and download repository papers securely
16. Receive critical notifications and return directly to the right screen

## Information Architecture

### Primary Navigation

Bottom navigation with:

1. Home
2. Events
3. Submissions
4. Repository
5. Account

### Secondary Surfaces

- Notifications inbox
- Saved events
- Topics
- Verification
- Subscription
- Payments
- Settings

### Navigation Rules

- Primary tabs must be stable and always available after onboarding.
- Deep links must land inside the correct tab and sub-screen.
- Back behavior should preserve search, filters, and in-progress context where reasonable.
- Premium and auth guards should redirect with context preservation, not hard reset the user flow.

## Screen Strategy

### Home

Purpose:

- Command center for the current researcher state.

Required sections:

- account state summary,
- profile completion progress,
- verification status,
- subscription or trial status,
- next deadline,
- latest active submission,
- recommended events,
- saved events shortcut,
- notification preview.

Outcome:

- user understands the most urgent task within 10 seconds.

This is explicitly grounded in the current web dashboard, which already treats completion, verification, and subscription state as core researcher signals.

### Events

Purpose:

- Help researchers find relevant opportunities quickly.

Views:

- discover list,
- saved list,
- event detail,
- event filters bottom sheet.

List rules:

- prioritize title, deadline, status, format, and relevance,
- use compact rows or compact cards,
- keep visuals secondary to metadata,
- make bookmark action quick and low-friction.
- keep the user’s search and filter state intact when moving between list and detail.

### Submissions

Purpose:

- Reduce anxiety and confusion in a high-stakes workflow.

Views:

- submissions list,
- submission detail timeline,
- abstract submission,
- full-paper submission,
- revision submission.

Rules:

- timeline is the center of the detail view,
- current phase and next action must appear above historical detail,
- feedback must be readable and separated from action controls,
- each file row must communicate privacy and type clearly.
- starting a new submission should usually originate from event discovery or event detail, matching the current web product semantics.
- duplicate submission attempts should route the user to the existing submission instead of creating confusion.
- draft recovery should feel automatic and reassuring rather than manual and technical.

### Repository

Purpose:

- Turn the app into a usable research tool, not just a submission tool.

Views:

- search and browse,
- paper detail,
- protected download flow.

Rules:

- search/filter should be lightweight and mobile-friendly,
- paper metadata should scan quickly,
- downloads must confirm access safely without exposing fragile URLs.

### Account

Purpose:

- Centralize trust, settings, and researcher identity tasks.

Views:

- profile,
- topics,
- verification,
- subscription,
- payments,
- notification preferences,
- language and theme,
- sign out.

Rules:

- trust and access blockers should be easy to find,
- settings should be grouped by meaning, not technical implementation.
- payment UX should preserve the current product pattern of history plus reporting flow, adapted to mobile.
- verification UX should preserve the current pattern of status plus guidance plus uploader, adapted to mobile.

## Form And Upload UX

### Form Rules

- Persistent labels, not placeholder-only inputs
- Inline validation near the field
- One obvious submit action
- Long forms split into logical sections or steps
- Preserve draft state when the app backgrounds or the network fails
- onboarding and profile forms should not ask for more than needed to reach first value

### Upload Rules

- Show accepted file types and size before selection
- Show selected file name and size after selection
- Show upload progress during transfer
- Show retry or cancel actions where the backend allows them
- Show success receipt after completion
- Never expose raw storage URLs

This is especially important because the current web submission and file flows already show that upload and write behavior are complex enough to confuse users if the UI is too thin.

## State Design

Every major screen should define UI for:

- loading,
- empty,
- error,
- offline or stale,
- blocked or gated,
- success or receipt.

State language should be human-readable and action-oriented.

Examples:

- `Awaiting review` instead of raw enum text
- `Revision requested` instead of technical workflow code
- `Payment under review` instead of backend status jargon

## Notification UX

### Notification Categories

- new events in subscribed topics
- deadline-sensitive reminders tied to subscribed-topic relevance
- optional in-app status updates for researcher workflows where useful

### Notification Rules

- v1 push notifications should primarily serve subscribed-topic discovery and relevant deadline reminders
- permission prompt should happen after a value moment
- payload copy should avoid sensitive detail in the device tray
- tapping a notification must land on the exact relevant screen
- inbox should mirror push events with read state and time context
- notification entry should restore useful context rather than dropping the user at a generic landing screen

### Recommended Permission Moments

- after bookmarking a deadline-sensitive event,
- after entering topic subscriptions,
- after the user has clearly seen the value of topic-based event discovery.

## Internationalization Tooling

Flutter localization workflow should use the `flutter-intl` VS Code extension from Localizely:

- [Flutter Intl](https://marketplace.visualstudio.com/items?itemName=localizely.flutter-intl)

This should be reflected in the developer workflow and documentation so localization behavior aligns with the chosen tooling from the start.

## Premium Gate UX

Premium gating must:

- preserve the current task context,
- explain why the action is blocked,
- show the current plan or trial state,
- offer immediate resolution through payment or subscription flow,
- return the user to the original task on success.

## Interruption And Return-To-Task UX

The app should behave well when the user:

- backgrounds the app mid-form,
- returns after a notification,
- leaves during upload,
- signs in from a deep link,
- resumes after a network failure.

Expected UX:

- drafts survive where safe,
- incomplete work is easy to resume,
- the user lands near the task they care about,
- the app avoids forcing the user to reconstruct context manually.

## Visual System Direction

The visual language should be:

- compact,
- academic,
- quiet but confident,
- status-rich rather than decorative.

Guidance:

- avoid hero-style marketing layouts,
- avoid oversized decorative cards,
- use status color sparingly and consistently,
- make timelines, chips, badges, and panels readable under RTL and large text,
- prioritize information hierarchy over illustration.

## Localization And Accessibility

### Localization

- Arabic RTL is release-blocking
- English is release-blocking
- Long translated strings must not break layouts
- Date, time, and number formatting must respect locale

### Accessibility

- large text must not collapse key actions,
- semantics labels are required for interactive controls,
- focus order must remain logical under RTL,
- touch targets must remain usable,
- progress and upload states should be announced accessibly where possible.

## Theme

The theme system must support:

- `system`,
- `light`,
- `dark`.

Requirements:

- persistence across launches,
- consistent behavior in every primary screen,
- no broken contrast in status badges, timelines, or form errors,
- no divergence between Arabic and English layouts when theme changes.

## UX Release Gates

The product is not ready until:

- onboarding is short, coherent, and follows mobile app conventions,
- home, events, submissions, payment, and repository flows are usable in Arabic and English,
- notification flows deep-link correctly,
- interruption and return-to-task behavior is reliable in critical workflows,
- upload flows feel reliable and understandable,
- premium gates preserve context,
- large text and RTL do not break primary actions,
- blocked, empty, offline, and error states are present for critical workflows.
