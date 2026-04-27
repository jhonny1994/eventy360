# Phase 6 Mobile Route Parity Checklist

Date: 2026-04-27
Status: Active parity checklist

## Purpose

This document is the route-by-route parity matrix for the Eventy360 mobile MVP.

It exists to make `6.3.4`, `6.3.5`, and `6.3.6` executable instead of vague.

Use it during manual QA and before starting phase 7 release work.

## How To Use

For each route:

1. validate the required semantic behavior
2. validate large-text behavior at Android font scale `1.3x` and `2.0x`
3. validate Arabic RTL layout
4. validate cold start and background resume where marked
5. record pass/fail with evidence

## Validation Columns

- `Web/Doc semantic`: the product meaning mobile must preserve
- `Must validate`: the essential behaviors to check manually
- `Large text`: what must still work at high font scale
- `RTL`: what must still work in Arabic
- `Resume`: cold-start, background-resume, or return-to-task behavior to verify

## Route Matrix

### `/onboarding`

- Web/Doc semantic:
  - short mobile-first orientation into the researcher journey
- Must validate:
  - step progression is clear
  - skip and continue stay stable
  - completion routes to sign-in, not a dead-end
- Large text:
  - title, body, and CTA remain readable without overlap
- RTL:
  - page order, progress dots, and header alignment remain coherent
- Resume:
  - app reopen does not crash or strand the user mid-flow

### `/auth/sign-in`

- Web/Doc semantic:
  - secure return into the researcher workspace
- Must validate:
  - email/password entry
  - invalid credentials surface clearly
  - forgot-password path is reachable
- Large text:
  - fields and CTA remain fully visible with keyboard open
- RTL:
  - field labels and action order remain understandable
- Resume:
  - backgrounding with partially entered credentials does not break the screen

### `/auth/sign-up`

- Web/Doc semantic:
  - create researcher access, then move into completion flow
- Must validate:
  - sign-up success
  - auth errors surface clearly
  - return-to-sign-in path is obvious
- Large text:
  - form stays scrollable and primary CTA remains reachable
- RTL:
  - labels, helper copy, and alternate action remain readable
- Resume:
  - app reopen does not lose route integrity

### `/auth/reset`

- Web/Doc semantic:
  - recover access securely
- Must validate:
  - reset email path
  - recovery mode path
  - success copy is explicit
- Large text:
  - password fields and buttons do not collapse or clip
- RTL:
  - error and success copy align correctly
- Resume:
  - deep-link recovery session still lands in a usable state after reopen

### `/profile-gate`

- Web/Doc semantic:
  - minimum researcher profile required before app access
- Must validate:
  - full name, institution, wilaya, and daira selection
  - validation on missing location
  - success routes forward
- Large text:
  - dropdowns and submit CTA remain operable
- RTL:
  - location fields remain aligned and readable
- Resume:
  - backgrounding during completion does not break state

### `/initial-setup`

- Web/Doc semantic:
  - choose language, theme, and topics before entering the command center
- Must validate:
  - language selection persists
  - theme selection persists
  - topic subscriptions work
  - finish action routes to home shell
- Large text:
  - chips and finish actions wrap cleanly
- RTL:
  - language/theme chips and topic chips remain stable
- Resume:
  - reopening during setup preserves route and does not loop incorrectly

### `/home`

- Web/Doc semantic:
  - command center for current researcher state
- Must validate:
  - next action is obvious
  - status summary is accurate
  - quick links navigate to correct tabs
  - notification education links to account preferences
- Large text:
  - metrics and quick links do not overlap or truncate critically
- RTL:
  - status hierarchy and quick-link scan remain natural
- Resume:
  - cold start and background resume do not trigger layout crashes

### `/events`

- Web/Doc semantic:
  - event discovery, not topic settings
- Must validate:
  - search
  - topic filters
  - bookmark toggling
  - list-to-detail return preserves context
- Large text:
  - search, chips, and cards remain usable
- RTL:
  - cards and filter rows remain readable
- Resume:
  - return from detail keeps scroll/search/filter state

### `/events/saved`

- Web/Doc semantic:
  - dedicated saved events recovery surface
- Must validate:
  - saved list loads
  - empty state is clear
  - detail navigation works
- Large text:
  - saved cards remain readable
- RTL:
  - empty and list states stay aligned
- Resume:
  - returning from detail restores list position where feasible

### `/events/:eventId`

- Web/Doc semantic:
  - decision-support screen before submission
- Must validate:
  - deadline
  - topics
  - location
  - organizer guidance
  - duplicate-submission redirect
- Large text:
  - action buttons remain reachable and timeline text wraps safely
- RTL:
  - sections preserve hierarchy
- Resume:
  - app resume on this route preserves current event context

### `/submissions`

- Web/Doc semantic:
  - current researcher work queue
- Must validate:
  - list visibility
  - status comprehension
  - navigation to detail
  - new abstract action behavior
- Large text:
  - list rows remain scannable
- RTL:
  - status and event/title relationships remain clear
- Resume:
  - list-to-detail round-trip preserves context

### `/submissions/new-abstract`

- Web/Doc semantic:
  - guided abstract creation from the correct event
- Must validate:
  - event selection
  - draft restore
  - validation
  - duplicate redirect to existing submission
- Large text:
  - form stays scrollable with keyboard open
- RTL:
  - labels and guidance copy remain readable
- Resume:
  - draft survives interruption and reopen

### `/submissions/:submissionId`

- Web/Doc semantic:
  - current submission state, evidence, and next step
- Must validate:
  - human-readable status narrative
  - event/deadline context
  - feedback rendering
  - file action behavior
- Large text:
  - narrative, chips, and file metadata do not collapse
- RTL:
  - timeline and feedback sections remain coherent
- Resume:
  - reopening deep-links back into the same submission safely

### `/submissions/:submissionId/full-paper`

- Web/Doc semantic:
  - upload the eligible full paper on the correct record
- Must validate:
  - guidance copy
  - file selection
  - submit success
  - return to detail
- Large text:
  - upload and submit controls remain usable
- RTL:
  - helper text and validation remain aligned
- Resume:
  - interruption does not lose selected context unexpectedly

### `/submissions/:submissionId/revision`

- Web/Doc semantic:
  - respond to revision request on the existing submission
- Must validate:
  - revision notes field
  - file selection
  - submit success
- Large text:
  - controls remain reachable with keyboard and picker interaction
- RTL:
  - notes and upload guidance remain clear
- Resume:
  - draft/selection behavior remains safe after resume

### `/repository`

- Web/Doc semantic:
  - premium protected research discovery
- Must validate:
  - premium gate state
  - search
  - author filter
  - wilaya filter
  - topic filter
  - detail navigation
- Large text:
  - filters and cards wrap without breaking actions
- RTL:
  - filter order and card metadata remain understandable
- Resume:
  - return from detail preserves filter and scroll state

### `/repository/:paperId`

- Web/Doc semantic:
  - confirm paper context before protected download
- Must validate:
  - back-to-repository action
  - abstract
  - metadata
  - tracked/protected download action
- Large text:
  - detail sections remain readable and CTA remains visible
- RTL:
  - metadata grouping remains stable
- Resume:
  - reopening after background resume does not lose selected paper context

### `/account`

- Web/Doc semantic:
  - central destination for identity, preferences, trust, and subscription
- Must validate:
  - profile overview
  - subscription overview
  - language control
  - theme control
  - notification preferences
  - sign out
- Large text:
  - preference tiles and section headers remain readable
- RTL:
  - settings scan naturally in Arabic
- Resume:
  - changes persist after full app restart

### `/account/profile`

- Web/Doc semantic:
  - edit current researcher identity and location
- Must validate:
  - profile loads
  - wilaya/daira reload works
  - save succeeds
- Large text:
  - form remains scrollable and readable
- RTL:
  - input labels and dropdown content remain stable
- Resume:
  - background/resume does not lose editability or crash

### `/account/security`

- Web/Doc semantic:
  - safe access-management surface
- Must validate:
  - reset email action
  - direct password update
  - success/error handling
- Large text:
  - password fields and helper copy remain visible
- RTL:
  - security copy remains understandable
- Resume:
  - route remains valid after recovery flow interruptions

### `/account/topics`

- Web/Doc semantic:
  - dedicated topic preference management
- Must validate:
  - topic toggling
  - notification permission request timing
  - permission-denied recovery path
- Large text:
  - chips remain tappable and wrap cleanly
- RTL:
  - chip layout and copy remain stable
- Resume:
  - reopening after permission handoff returns safely

### `/account/trust`

- Web/Doc semantic:
  - trust center unifying verification, payments, and subscription resolution
- Must validate:
  - verification state
  - subscription state
  - payment history
  - entry to report payment
- Large text:
  - status and payment cards remain readable
- RTL:
  - badges, actions, and content order remain coherent
- Resume:
  - protected document actions and route state survive reopen

### `/account/trust/report-payment`

- Web/Doc semantic:
  - report payment with clear instructions and proof
- Must validate:
  - payment instructions visibility
  - recommended amount behavior
  - proof upload constraints
  - successful submit and return
- Large text:
  - form and instructions remain scannable
- RTL:
  - instructions, labels, and CTA order stay clear
- Resume:
  - backgrounding during report does not corrupt form state

## Required Evidence Bundle

For phase 6 completion, capture at minimum:

1. one screenshot per primary route in English light theme
2. one screenshot per primary route in Arabic
3. one screenshot per primary route with large text enabled where layout risk is meaningful
4. one screen recording for cold-start to home
5. one screen recording for background-resume on:
   - home
   - events detail
   - submission detail
   - payment report
6. notes for any route that passes only with caveats

## Exit Rule

Phase 6 route parity is not complete until every route above has:

1. pass or accepted non-blocking caveat
2. captured evidence
3. linked defect for every unresolved issue
