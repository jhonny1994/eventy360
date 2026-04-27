# Eventy360 Mobile Production Reference

Date: 2026-04-27
Status: Active working reference

## Purpose

This file is the single reference for anyone working on the Eventy360 mobile MVP.

It consolidates:

- product mentality,
- required information architecture,
- current implementation state,
- web-to-mobile parity expectations,
- must-have gaps,
- better-to-have gaps,
- implementation order,
- release-blocking product rules.

Use this before making UI, routing, UX, or flow decisions.

## Canonical Source Set

This reference is derived from:

1. `docs/tasks/mvp/prd-eventy360-production-mobile-app.md`
2. `docs/tasks/mvp/app-foundations/02-researcher-journey-and-ux.md`
3. `docs/tasks/mvp/phase6-mobile-ui-production-audit.md`
4. current mobile implementation under `apps/mobile`
5. current researcher web semantics under `apps/web/src/app/[locale]/profile`

If these sources disagree, follow this priority:

1. researcher journey and UX intent
2. PRD functional requirements
3. production audit rules
4. existing web semantics
5. current mobile implementation

## Product Mentality

The correct mentality for this app is:

- build a mobile product, not a collection of pages,
- shell first, then screens,
- tasks before features,
- stable navigation before decorative polish,
- settings as a first-class destination,
- home as a decision surface, not a sitemap,
- localization and theme as user-facing capabilities, not hidden implementation details,
- route quality judged end-to-end, not screen-by-screen.

This means the app should answer:

1. What state is the researcher in?
2. What should they do now?
3. What is blocking them?
4. Where can they go next?

## Required Top-Level Information Architecture

Per the UX doc, post-onboarding mobile should use stable primary navigation:

1. Home
2. Events
3. Submissions
4. Repository
5. Account

Current mobile now implements this shell, and the remaining work is about deep parity, polish, and release confidence.

## Current Mobile Route Map

Defined routes today:

- `/onboarding`
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/reset`
- `/profile-gate`
- `/unsupported-role`
- `/home`
- `/events`
- `/events/saved`
- `/submissions`
- `/repository`
- `/account`
- `/account/profile`
- `/account/security`
- `/account/topics`
- `/account/trust`
- `/account/trust/report-payment`

Source:

- `apps/mobile/lib/app/router/route_paths.dart`
- `apps/mobile/lib/app/router/app_router.dart`

Important reality:

- account now exists as a first-class top-level destination,
- the bottom navigation shell exists,
- trust is now housed under account,
- remaining work is about parity depth rather than missing shell architecture.

## What Exists In Mobile Today

### Foundation

- Flutter app foundation and feature-first architecture
- Riverpod v3, Freezed, localization, Firebase Messaging, Supabase integration
- persistent theme state
- persistent locale state
- shared page primitives and auth scaffold

### Auth and onboarding

- sign in
- sign up
- password reset with recovery mode handling
- onboarding flow
- profile completion gate
- unsupported-role gate

### Researcher workflows

- home
- event discovery
- event detail
- bookmarks
- topic subscriptions
- push token registration and deep-link handling
- abstract submission
- full-paper submission
- revision submission
- submission list
- submission detail
- verification upload
- payment reporting
- payment history
- repository list
- repository detail
- protected file opening and downloads

### Reliability work already present

- duplicate-submit protection patterns
- retry-safe write handling
- idempotency keys in critical writes
- local draft preservation for submissions
- secure file type and size validation in sensitive uploads

## What Exists Technically But Not As Product UX

These capabilities are already present in code but are not properly exposed to the user:

### Theme

- persistent theme mode controller exists
- user-facing control is only a home app-bar toggle
- required destination-level settings UX does not exist

Source:

- `apps/mobile/lib/app/theme/theme_mode_controller.dart`
- `apps/mobile/lib/features/home/presentation/home_screen.dart`

### Language

- locale controller exists
- English and Arabic are wired
- no in-app language switch exists

Source:

- `apps/mobile/lib/app/localization/locale_controller.dart`

### Notifications

- notification permission and topic flows exist
- no user-facing notification preferences destination exists
- no clear platform-settings handoff surface exists

## Core Product Gaps

### Release-blocking gaps

1. no persistent app shell
2. no `Account` or `Settings` destination
3. no in-app language switching
4. theme control is in the wrong place
5. notification preferences are not discoverable
6. home is overloaded and acting as substitute navigation

### High-priority parity gaps

1. event detail lacks web-level context and richer decision support
2. submissions detail lacks feedback parity and strong file/privacy framing
3. mobile topics are mixed into event discovery instead of having their own destination
4. repository and trust flows are usable but not well-housed in the overall information architecture
5. profile identity, edit, subscription, verification, security, and sign-out are not centralized

## Route-By-Route Audit

### Onboarding

Current mobile:

- multi-step onboarding exists
- contextual notification education exists

Must-have missing:

- flow into language selection
- flow into theme selection
- flow into topic setup
- flow into stable tabbed shell

Reference:

- UX journey stage says users should choose language, theme, and topics before reaching the home command center

### Sign in

Current mobile:

- good auth shell
- autofill present

Must-have missing:

- clearer return-to-task and account destination after auth
- eventual account/security continuation model

Better-have:

- password visibility toggle

### Sign up

Current mobile:

- good auth shell
- autofill present

Must-have missing:

- stronger path communication from registration to profile completion and first real value

Better-have:

- password visibility toggle

### Password reset

Current mobile:

- works, including recovery mode

Must-have missing:

- later placement in security/account IA

### Profile completion gate

Current mobile:

- functional and aligned with gating semantics

Must-have missing:

- relationship to later account/profile edit surface

### Home

Current mobile:

- shows verification, subscription, deadline, active submission
- includes theme toggle, sign out, navigation buttons, and notification education

Must-have missing:

- task-first structure
- one dominant next action
- recommended events
- saved events shortcut
- notification preview
- stable relation to persistent tabs

Current problem:

- home is doing navigation, settings, status, and education all at once

### Events list

Current mobile:

- search
- topic filters
- topic subscriptions
- pagination
- bookmarks

Must-have missing:

- saved/bookmarked events view
- dedicated topics management destination
- stronger preservation of search and filters across round-trips

Better-have:

- richer filters
- better separation between discovery and topic preference management

### Event detail

Current mobile:

- bookmark CTA
- submit abstract CTA
- basic topics, location, deadline

Must-have missing:

- richer description
- event timeline
- organizer context
- eligibility guidance
- stronger state framing

### Submissions list

Current mobile:

- list of submissions
- basic status labels
- quick path to create abstract

Must-have missing:

- richer metadata
- filters
- active/past grouping
- stronger relationship to originating event discovery flow

### Submission detail

Current mobile:

- status chip
- abstract text
- timeline
- next action for full paper or revision

Must-have missing:

- reviewer feedback parity
- event-side context and deadlines
- better file metadata and safer file handling UX
- stronger human-readable timeline states

### Submission write flows

Current mobile:

- abstract, full paper, revision
- draft persistence
- idempotency keys
- file selection

Must-have missing:

- explicit accepted file guidance before upload
- clearer upload receipt and confirmation UX
- stronger draft restore communication
- stronger event context in abstract submission

### Repository list

Current mobile:

- subscription gate
- search
- topic filters
- load more
- detail navigation
- protected download preparation

Must-have missing:

- placement under stable app shell
- stronger premium-context explanation path
- richer filter surface

### Paper detail

Current mobile:

- metadata
- abstract
- download section

Must-have missing:

- back-to-repository context
- richer metadata hierarchy
- stronger analytics context

### Trust center

Current mobile:

- verification state
- verification upload
- payment history
- entry to report payment

Must-have missing:

- placement under account
- topic, subscription, profile, notification, and security relations
- broader account/trust IA

### Payment report

Current mobile:

- strong form
- proof upload

Must-have missing:

- integrated history/report experience
- clearer payment instructions and expectations before submission

## Mobile vs Web: What Mobile Is Already Better At

Mobile already has some product-quality advantages over the current web implementation:

1. real onboarding exists
2. contextual notification permission strategy is stronger
3. draft preservation in submission writing is stronger
4. idempotency-key handling is explicit in writes
5. secure upload validation is stronger in sensitive flows
6. mobile auth and gate flows are more focused than several web equivalents

Do not regress these while chasing visual or parity improvements.

## Mobile vs Web: What Web Still Teaches Mobile

Web remains the best source for preserved researcher semantics in:

1. profile dashboard state framing
2. repository as a dedicated protected destination
3. verification as status + guidance + uploader
4. payment as history + report mode
5. topic subscriptions as a dedicated concept
6. profile edit and security destinations
7. richer event detail content
8. richer submission detail content

Mobile should preserve these semantics while using correct mobile patterns.

## Must-Have Before Calling The App Production-Grade

1. Bottom navigation shell
2. Account/settings destination
3. In-app language switching
4. Theme controls inside account/settings
5. Notification preferences entry point
6. Home rewrite
7. Dedicated topics/subscription/account semantics
8. Event detail parity improvement
9. Submission detail parity improvement
10. Route-by-route large-text, RTL, and resume validation

## Better-To-Have After The Must-Haves

1. notification inbox
2. recent activity on home
3. saved papers/history
4. richer repository filters
5. citation/share/export actions
6. support/help surface
7. stronger autosave and restore messaging

## Working Order

Anyone continuing this work should follow this order:

### Order 1: Shell

- add bottom navigation shell
- create account/settings destination
- re-home sign out, theme, language, notification preferences

### Order 2: Home

- remove stacked navigation buttons
- make home about next action, deadline, latest submission, and short status summary

### Order 3: Account

- add profile overview
- add verification entry
- add subscription/payment entry
- add topics entry
- add language and theme settings
- add security entry

### Order 4: Discovery parity

- add saved events
- separate topic subscriptions from event filtering
- strengthen event detail

### Order 5: Submission parity

- improve submission detail feedback, file context, and event context
- improve write-flow guidance and receipts

### Order 6: Repository and trust polish

- improve repository filters and detail context
- improve payment history/report cohesion

### Order 7: Full validation

- cold start
- background/foreground resume
- deep-link entry
- RTL
- large text
- light/dark
- failure and recovery

## Non-Negotiable Rules

1. Do not add new primary flows outside the app shell model.
2. Do not treat technical capabilities as complete if users cannot discover them.
3. Do not use home as a replacement for navigation or settings.
4. Do not ship multilingual claims without visible language controls or an explicitly approved system-locale-only decision.
5. Do not claim production readiness without route-by-route manual validation of core researcher flows.

## Files To Read First Before Working

1. `docs/tasks/mvp/mobile-production-reference.md`
2. `docs/tasks/mvp/app-foundations/02-researcher-journey-and-ux.md`
3. `docs/tasks/mvp/prd-eventy360-production-mobile-app.md`
4. `docs/tasks/mvp/phase6-mobile-ui-production-audit.md`
5. `docs/tasks/mvp/tasks-eventy360-production-mobile-app.md`

## Short Summary

The mobile app already has most of the core connected workflows.

What it does not yet have is the full product architecture expected of a production mobile app:

- stable shell,
- account/settings destination,
- visible preferences,
- cleaner home,
- clearer route responsibilities,
- stronger parity with preserved web semantics.

That is the current center of gravity for all remaining work.
